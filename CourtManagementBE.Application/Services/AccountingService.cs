using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CourtManagementBE.Application.Common;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Application.IServices;
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Constants;
using CourtManagementBE.Domain.Entities;

namespace CourtManagementBE.Application.Services;

public class AccountingService : BaseService, IAccountingService
{
    private const string DraftStatus = AccountingConstants.JournalEntryStatus.Draft;
    private const string PostedStatus = AccountingConstants.JournalEntryStatus.Posted;

    private readonly ILogger<AccountingService> _logger;

    public AccountingService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<AccountingService> logger)
        : base(unitOfWork, mapper)
    {
        _logger = logger;
    }

    public async Task<Result<List<AccountingAccountTypeOptionDto>>> GetAccountTypesAsync()
    {
        var accountTypes = await _unitOfWork.IAccountingAccountTypeRepository.FindList(x => x.IsActive);
        return Success(accountTypes
            .OrderBy(x => x.SortOrder)
            .Select(x => new AccountingAccountTypeOptionDto
            {
                Code = x.Code,
                Name = x.Name,
                Description = x.Description,
                SortOrder = x.SortOrder,
                IsActive = x.IsActive,
                NormalBalance = x.NormalBalance
            }).ToList());
    }

    public async Task<Result<List<JournalDocumentTypeOptionDto>>> GetDocumentTypesAsync()
    {
        var documentTypes = await _unitOfWork.IJournalDocumentTypeRepository.FindList(x => x.IsActive);
        return Success(documentTypes
            .OrderBy(x => x.SortOrder)
            .Select(x => new JournalDocumentTypeOptionDto
            {
                Code = x.Code,
                Name = x.Name,
                Description = x.Description,
                SortOrder = x.SortOrder,
                IsActive = x.IsActive,
                VoucherPrefix = x.VoucherPrefix
            }).ToList());
    }

    public async Task<Result<List<AccountingOptionDto>>> GetPartnerTypesAsync()
    {
        var partnerTypes = await _unitOfWork.IBusinessPartnerTypeRepository.FindList(x => x.IsActive);
        return Success(partnerTypes.OrderBy(x => x.SortOrder).Select(ToOption).ToList());
    }

    public async Task<Result<List<BankAccountOptionDto>>> GetBankAccountsAsync()
    {
        var bankAccounts = await _unitOfWork.IBankAccountRepository.FindList(x => x.IsActive);
        return Success(bankAccounts
            .OrderBy(x => x.SortOrder)
            .Select(x => new BankAccountOptionDto
            {
                BankAccountID = x.BankAccountID,
                Code = x.Code,
                BankName = x.BankName,
                AccountNumberMasked = x.AccountNumberMasked,
                AccountCode = x.AccountCode,
                OpeningBalance = x.OpeningBalance,
                ColorCode = x.ColorCode,
                SortOrder = x.SortOrder,
                IsActive = x.IsActive
            }).ToList());
    }

    public async Task<Result<List<CashFundOptionDto>>> GetCashFundsAsync()
    {
        var cashFunds = await _unitOfWork.ICashFundRepository.FindList(x => x.IsActive);
        return Success(cashFunds
            .OrderBy(x => x.SortOrder)
            .Select(x => new CashFundOptionDto
            {
                CashFundID = x.CashFundID,
                Code = x.Code,
                Name = x.Name,
                AccountCode = x.AccountCode,
                OpeningBalance = x.OpeningBalance,
                SortOrder = x.SortOrder,
                IsActive = x.IsActive
            }).ToList());
    }

    private static AccountingOptionDto ToOption(MasterDataBase item)
    {
        return new AccountingOptionDto
        {
            Code = item.Code,
            Name = item.Name,
            Description = item.Description,
            SortOrder = item.SortOrder,
            IsActive = item.IsActive
        };
    }

    public async Task<Result<List<JournalEntryResponseDto>>> GetJournalEntriesAsync(JournalEntryQueryDto query)
    {
        var entries = await _unitOfWork.IJournalEntryRepository.FindList(e =>
            (string.IsNullOrWhiteSpace(query.Status) || e.Status == query.Status) &&
            (!query.FromDate.HasValue || e.EntryDate >= query.FromDate.Value.Date) &&
            (!query.ToDate.HasValue || e.EntryDate < query.ToDate.Value.Date.AddDays(1)) &&
            (string.IsNullOrWhiteSpace(query.Keyword) || e.VoucherNo.Contains(query.Keyword) || e.Description.Contains(query.Keyword)));

        var lines = await _unitOfWork.IJournalEntryLineRepository.FindList(_ => true);
        var accounts = await _unitOfWork.IChartOfAccountRepository.FindList(_ => true);

        var data = entries.Select(e =>
        {
            var entryLines = lines.Where(l => l.JournalEntryId == e.Id).ToList();
            return new JournalEntryResponseDto
            {
                Id = e.Id,
                VoucherNo = e.VoucherNo,
                EntryDate = e.EntryDate,
                DocumentType = e.DocumentType,
                SourceTable = e.SourceTable,
                SourceId = e.SourceId,
                Description = e.Description,
                Status = e.Status,
                TotalDebit = entryLines.Sum(l => l.DebitAmount),
                TotalCredit = entryLines.Sum(l => l.CreditAmount),
                Lines = entryLines.Select(l => new JournalEntryLineResponseDto
                {
                    Id = l.Id,
                    JournalEntryId = l.JournalEntryId,
                    AccountCode = l.AccountCode,
                    AccountName = accounts.FirstOrDefault(a => a.AccountCode == l.AccountCode)?.AccountName,
                    DebitAmount = l.DebitAmount,
                    CreditAmount = l.CreditAmount,
                    PartnerId = l.PartnerId,
                    Description = l.Description
                }).ToList()
            };
        }).ToList();

        return Success(data);
    }

    public async Task<Result<PostJournalEntriesResponseDto>> PostJournalEntriesAsync(List<string> entryIds)
    {
        if (entryIds == null || entryIds.Count == 0)
        {
            return BadRequest<PostJournalEntriesResponseDto>("Không có bút toán nào để ghi sổ.");
        }

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var entries = await _unitOfWork.IJournalEntryRepository.FindList(e => entryIds.Contains(e.Id) && e.Status == DraftStatus);
            foreach (var entry in entries)
            {
                var lines = await _unitOfWork.IJournalEntryLineRepository.FindList(l => l.JournalEntryId == entry.Id);
                var validationError = await ValidateJournalLinesAsync(lines);
                if (!string.IsNullOrWhiteSpace(validationError))
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return BadRequest<PostJournalEntriesResponseDto>($"Bút toán {entry.VoucherNo} chưa hợp lệ: {validationError}");
                }

                entry.Status = PostedStatus;
                _unitOfWork.IJournalEntryRepository.Update(entry);
            }

            await _unitOfWork.CommitTransactionAsync();
            return Success(new PostJournalEntriesResponseDto { PostedCount = entries.Count, PostedEntryIds = entries.Select(x => x.Id).ToList() });
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<Result<JournalEntryResponseDto>> UpdateDraftJournalEntryAsync(string id, JournalEntryUpdateDto dto)
    {
        var entry = await _unitOfWork.IJournalEntryRepository.FindFirst(e => e.Id == id);
        if (entry == null) return NotFound<JournalEntryResponseDto>("Không tìm thấy bút toán.");
        if (entry.Status != DraftStatus) return BadRequest<JournalEntryResponseDto>("Chỉ được sửa bút toán Draft.");

        var newLines = dto.Lines.Select(l => new JournalEntryLine
        {
            Id = string.IsNullOrWhiteSpace(l.Id) ? Guid.NewGuid().ToString("N") : l.Id!,
            JournalEntryId = id,
            AccountCode = l.AccountCode,
            DebitAmount = l.DebitAmount,
            CreditAmount = l.CreditAmount,
            PartnerId = l.PartnerId,
            Description = l.Description
        }).ToList();

        var validationError = await ValidateJournalLinesAsync(newLines);
        if (!string.IsNullOrWhiteSpace(validationError)) return BadRequest<JournalEntryResponseDto>(validationError);

        if (!string.IsNullOrWhiteSpace(dto.Description)) entry.Description = dto.Description;
        _unitOfWork.IJournalEntryRepository.Update(entry);
        await _unitOfWork.IJournalEntryLineRepository.RemoveWithPredicate(l => l.JournalEntryId == id);
        await _unitOfWork.IJournalEntryLineRepository.AddRange(newLines);
        await _unitOfWork.SaveChangesAsync();

        return await GetJournalEntryByIdAsync(id);
    }

    public async Task<Result<List<ChartOfAccountResponseDto>>> GetChartOfAccountsAsync()
    {
        var accounts = await _unitOfWork.IChartOfAccountRepository.FindList(_ => true);
        return Success(accounts.Select(a => new ChartOfAccountResponseDto
        {
            Id = a.Id,
            AccountCode = a.AccountCode,
            AccountName = a.AccountName,
            AccountType = NormalizeAccountType(a.AccountType, a.AccountCode),
            ParentAccountId = a.ParentAccountId,
            Level = a.Level,
            IsActive = a.IsActive
        }).ToList());
    }

    public async Task<Result<ChartOfAccountResponseDto>> CreateChartOfAccountAsync(ChartOfAccountRequestDto request)
    {
        var exists = await _unitOfWork.IChartOfAccountRepository.FindFirst(x => x.AccountCode == request.AccountCode);
        if (exists != null) return Conflict<ChartOfAccountResponseDto>("Mã tài khoản đã tồn tại.");
        var accountType = await _unitOfWork.IAccountingAccountTypeRepository.FindFirst(x => x.Code == request.AccountType && x.IsActive);
        if (accountType == null) return BadRequest<ChartOfAccountResponseDto>("Loại tài khoản không hợp lệ.");

        var entity = new ChartOfAccount
        {
            Id = Guid.NewGuid().ToString("N"),
            AccountCode = request.AccountCode,
            AccountName = request.AccountName,
            AccountType = accountType.Code,
            ParentAccountId = request.ParentAccountId,
            Level = request.Level,
            IsActive = request.IsActive
        };
        await _unitOfWork.IChartOfAccountRepository.Add(entity);
        await _unitOfWork.SaveChangesAsync();

        return Created(new ChartOfAccountResponseDto
        {
            Id = entity.Id,
            AccountCode = entity.AccountCode,
            AccountName = entity.AccountName,
            AccountType = NormalizeAccountType(entity.AccountType, entity.AccountCode),
            ParentAccountId = entity.ParentAccountId,
            Level = entity.Level,
            IsActive = entity.IsActive
        });
    }

    private static string NormalizeAccountType(string accountType, string accountCode)
    {
        if (accountType is "Asset" or "Liability" or "Equity" or "Revenue" or "Expense")
        {
            return accountType;
        }

        return accountCode switch
        {
            var code when code.StartsWith("1") => "Asset",
            var code when code.StartsWith("3") => "Liability",
            var code when code.StartsWith("4") => "Equity",
            var code when code.StartsWith("5") => "Revenue",
            var code when code.StartsWith("6") => "Expense",
            _ => accountType
        };
    }

    private async Task<string?> ValidateJournalLinesAsync(List<JournalEntryLine> lines)
    {
        if (lines.Count < 2) return "Bút toán phải có ít nhất 2 dòng.";

        var accountCodes = lines.Select(x => x.AccountCode).Distinct().ToList();
        var accounts = await _unitOfWork.IChartOfAccountRepository.FindList(x => accountCodes.Contains(x.AccountCode) && x.IsActive);
        var validAccountCodes = accounts.Select(x => x.AccountCode).ToHashSet();

        foreach (var line in lines)
        {
            if (!validAccountCodes.Contains(line.AccountCode)) return $"Tài khoản {line.AccountCode} không tồn tại hoặc đã ngưng hoạt động.";
            if (line.DebitAmount < 0 || line.CreditAmount < 0) return "Số tiền Nợ/Có không được âm.";
            if (line.DebitAmount > 0 && line.CreditAmount > 0) return "Một dòng bút toán không được vừa Nợ vừa Có.";
            if (line.DebitAmount == 0 && line.CreditAmount == 0) return "Một dòng bút toán phải có số tiền Nợ hoặc Có.";
        }

        var totalDebit = lines.Sum(x => x.DebitAmount);
        var totalCredit = lines.Sum(x => x.CreditAmount);
        if (totalDebit <= 0 || totalCredit <= 0) return "Tổng Nợ và tổng Có phải lớn hơn 0.";
        if (totalDebit != totalCredit) return $"Bút toán chưa cân. Tổng Nợ={totalDebit:N0}, Tổng Có={totalCredit:N0}.";

        return null;
    }

    private async Task<string> GenerateVoucherNoAsync(string prefix)
    {
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        var voucherPrefix = $"{prefix}-{datePart}-";
        var count = await _unitOfWork.IJournalEntryRepository.Count(x => x.VoucherNo.StartsWith(voucherPrefix));
        return $"{voucherPrefix}{count + 1:0000}";
    }

    private static string ResolveCashAccount(string paymentMethod)
    {
        return string.Equals(paymentMethod, "cash", StringComparison.OrdinalIgnoreCase) ? "1111" : "1121";
    }

    private static bool IsGroupDepositReceived(Payments payment)
    {
        return !payment.BookingID.HasValue && payment.BookingGroupID.HasValue && payment.Amount > 0;
    }

    private static bool IsGroupDepositDeduction(Payments payment)
    {
        return payment.BookingID.HasValue &&
               payment.BookingGroupID.HasValue &&
               payment.Amount > 0 &&
               payment.Note?.Contains("[GROUP_DEPOSIT_DEDUCTION]", StringComparison.OrdinalIgnoreCase) == true;
    }

    private static bool IsRefundPayment(Payments payment)
    {
        return string.Equals(payment.Status, "refunded", StringComparison.OrdinalIgnoreCase) ||
               payment.Amount < 0 ||
               payment.RefundedAmount > 0;
    }

    private async Task CreateRefundJournalAsync(Payments payment, string paymentId)
    {
        var amount = payment.RefundedAmount > 0 ? payment.RefundedAmount : Math.Abs(payment.Amount);
        if (amount <= 0) return;

        var entryId = Guid.NewGuid().ToString("N");
        var voucherNo = await GenerateVoucherNoAsync("PC");
        var cashAccount = ResolveCashAccount(payment.PaymentMethod);
        string? partnerId = null;

        if (payment.BookingID.HasValue)
        {
            var booking = await _unitOfWork.IBookingRepository.FindFirst(
                predicate: b => b.BookingID == payment.BookingID.Value,
                include: q => (Microsoft.EntityFrameworkCore.Query.IIncludableQueryable<Bookings, object>)q.Include(b => b.Customer!));

            if (booking?.Customer != null)
            {
                partnerId = await EnsureBusinessPartnerAsync(booking.Customer);
            }
        }

        var entry = new JournalEntry
        {
            Id = entryId,
            VoucherNo = voucherNo,
            EntryDate = DateTime.UtcNow,
            DocumentType = "PC",
            SourceTable = "Payments",
            SourceId = paymentId,
            Description = payment.Note ?? $"Hoàn tiền giao dịch #{paymentId}",
            Status = PostedStatus
        };

        var lines = new List<JournalEntryLine>
        {
            new JournalEntryLine
            {
                Id = Guid.NewGuid().ToString("N"),
                JournalEntryId = entryId,
                AccountCode = "5111",
                DebitAmount = amount,
                CreditAmount = 0,
                PartnerId = partnerId,
                Description = "Giảm doanh thu do hoàn tiền"
            },
            new JournalEntryLine
            {
                Id = Guid.NewGuid().ToString("N"),
                JournalEntryId = entryId,
                AccountCode = cashAccount,
                DebitAmount = 0,
                CreditAmount = amount,
                PartnerId = partnerId,
                Description = "Chi tiền hoàn khách"
            }
        };

        await _unitOfWork.IJournalEntryRepository.Add(entry);
        await _unitOfWork.IJournalEntryLineRepository.AddRange(lines);
        await _unitOfWork.SaveChangesAsync();
    }

    private async Task CreateGroupDepositReceivedJournalAsync(Payments payment, string paymentId)
    {
        var entryId = Guid.NewGuid().ToString("N");
        var voucherNo = await GenerateVoucherNoAsync("PT");
        var cashAccount = ResolveCashAccount(payment.PaymentMethod);

        var entry = new JournalEntry
        {
            Id = entryId,
            VoucherNo = voucherNo,
            EntryDate = DateTime.UtcNow,
            DocumentType = "PT",
            SourceTable = "Payments",
            SourceId = paymentId,
            Description = payment.Note ?? $"Nạp cọc nhóm booking #{payment.BookingGroupID}",
            Status = PostedStatus
        };

        var lines = new List<JournalEntryLine>
        {
            new JournalEntryLine
            {
                Id = Guid.NewGuid().ToString("N"),
                JournalEntryId = entryId,
                AccountCode = cashAccount,
                DebitAmount = payment.Amount,
                CreditAmount = 0,
                Description = "Thu tiền cọc nhóm"
            },
            new JournalEntryLine
            {
                Id = Guid.NewGuid().ToString("N"),
                JournalEntryId = entryId,
                AccountCode = "338",
                DebitAmount = 0,
                CreditAmount = payment.Amount,
                Description = "Ghi nhận tiền cọc nhóm chưa thành doanh thu"
            }
        };

        await _unitOfWork.IJournalEntryRepository.Add(entry);
        await _unitOfWork.IJournalEntryLineRepository.AddRange(lines);
        await _unitOfWork.SaveChangesAsync();
    }

    private async Task UpdateReceivableAfterPaymentAsync(string partnerId, decimal paidAmount)
    {
        var remaining = paidAmount;
        var receivables = await _unitOfWork.IAccountReceivableRepository.FindList(x =>
            x.PartnerId == partnerId &&
            x.OutstandingAmount > 0 &&
            x.Status != AccountingConstants.ReceivableStatus.Cancelled &&
            x.Status != AccountingConstants.ReceivableStatus.WrittenOff);

        foreach (var receivable in receivables.OrderBy(x => x.DueDate))
        {
            if (remaining <= 0) break;

            var applied = Math.Min(receivable.OutstandingAmount, remaining);
            receivable.PaidAmount += applied;
            receivable.OutstandingAmount -= applied;
            receivable.Status = receivable.OutstandingAmount <= 0
                ? AccountingConstants.ReceivableStatus.Paid
                : AccountingConstants.ReceivableStatus.PartiallyPaid;

            _unitOfWork.IAccountReceivableRepository.Update(receivable);
            remaining -= applied;
        }
    }

    private async Task<AccountingRule?> FindMatchingAccountingRuleAsync(string transactionType, Payments payment)
    {
        var rules = await _unitOfWork.IAccountingRuleRepository.FindList(r => r.IsActive && r.TransactionType == transactionType);
        foreach (var rule in rules.OrderBy(r => r.Priority))
        {
            var conditions = await _unitOfWork.IAccountingRuleConditionRepository.FindList(c => c.RuleId == rule.Id);
            if (EvaluateConditions(payment, conditions.OrderBy(c => c.SortOrder).ToList()))
            {
                return rule;
            }
        }

        return null;
    }

    private async Task<AccountingRule?> FindMatchingAccountingRuleAsync(string transactionType, Bookings booking)
    {
        var rules = await _unitOfWork.IAccountingRuleRepository.FindList(r => r.IsActive && r.TransactionType == transactionType);
        foreach (var rule in rules.OrderBy(r => r.Priority))
        {
            var conditions = await _unitOfWork.IAccountingRuleConditionRepository.FindList(c => c.RuleId == rule.Id);
            if (EvaluateConditions(booking, conditions.OrderBy(c => c.SortOrder).ToList()))
            {
                return rule;
            }
        }

        return null;
    }

    private async Task<(string CashAccount, string CourtRevenueAccount)> ResolveAccountsFromRuleAsync(AccountingRule rule, bool isReceivableSettlement)
    {
        var ruleLines = await _unitOfWork.IAccountingRuleLineRepository.FindList(l => l.RuleId == rule.Id);
        var cashAccount = ruleLines
            .FirstOrDefault(l => string.Equals(l.EntryType, "Debit", StringComparison.OrdinalIgnoreCase))
            ?.AccountCode;
        var creditAccount = ruleLines
            .FirstOrDefault(l =>
                string.Equals(l.EntryType, "Credit", StringComparison.OrdinalIgnoreCase) &&
                l.AccountCode != "512")
            ?.AccountCode;

        return (
            string.IsNullOrWhiteSpace(cashAccount) ? "1111" : cashAccount,
            string.IsNullOrWhiteSpace(creditAccount) ? (isReceivableSettlement ? "131" : "5111") : creditAccount
        );
    }

    private async Task<List<JournalEntryLine>> BuildJournalEntryLinesFromRuleAsync(
        string entryId,
        AccountingRule rule,
        Payments payment,
        decimal courtAmount,
        decimal serviceAmount,
        string? partnerId)
    {
        var ruleLines = await _unitOfWork.IAccountingRuleLineRepository.FindList(l => l.RuleId == rule.Id);
        return ruleLines.Select(line =>
        {
            var amount = ResolveRuleLineAmount(line.ValueSource, payment, courtAmount, serviceAmount);
            if (amount <= 0)
            {
                return null;
            }

            var isDebit = string.Equals(line.EntryType, "Debit", StringComparison.OrdinalIgnoreCase);
            return new JournalEntryLine
            {
                Id = Guid.NewGuid().ToString("N"),
                JournalEntryId = entryId,
                AccountCode = line.AccountCode,
                DebitAmount = isDebit ? amount : 0,
                CreditAmount = isDebit ? 0 : amount,
                PartnerId = partnerId,
                Description = string.IsNullOrWhiteSpace(line.DescriptionTemplate)
                    ? rule.Description
                    : line.DescriptionTemplate
            };
        }).Where(line => line != null).Select(line => line!).ToList();
    }

    private async Task<List<JournalEntryLine>> BuildJournalEntryLinesFromRuleAsync(
        string entryId,
        AccountingRule rule,
        Bookings booking,
        string? partnerId)
    {
        var ruleLines = await _unitOfWork.IAccountingRuleLineRepository.FindList(l => l.RuleId == rule.Id);
        return ruleLines.Select(line =>
        {
            var amount = ResolveRuleLineAmount(line.ValueSource, booking);
            if (amount <= 0)
            {
                return null;
            }

            var isDebit = string.Equals(line.EntryType, "Debit", StringComparison.OrdinalIgnoreCase);
            return new JournalEntryLine
            {
                Id = Guid.NewGuid().ToString("N"),
                JournalEntryId = entryId,
                AccountCode = line.AccountCode,
                DebitAmount = isDebit ? amount : 0,
                CreditAmount = isDebit ? 0 : amount,
                PartnerId = partnerId,
                Description = string.IsNullOrWhiteSpace(line.DescriptionTemplate)
                    ? rule.Description
                    : line.DescriptionTemplate
            };
        }).Where(line => line != null).Select(line => line!).ToList();
    }

    private static decimal ResolveRuleLineAmount(string valueSource, Payments payment, decimal courtAmount, decimal serviceAmount)
    {
        return valueSource switch
        {
            "Amount" or "PaymentAmount" or "TotalAmount" => payment.Amount,
            "CourtAmount" => courtAmount,
            "ServiceAmount" => serviceAmount,
            "RefundedAmount" => payment.RefundedAmount,
            _ => payment.Amount
        };
    }

    private static decimal ResolveRuleLineAmount(string valueSource, Bookings booking)
    {
        return valueSource switch
        {
            "TotalAmount" => booking.TotalAmount,
            "PaidAmount" => booking.PaidAmount,
            "OutstandingAmount" => booking.TotalAmount - booking.PaidAmount,
            _ => booking.TotalAmount
        };
    }

    public async Task<Result<List<AccountingRuleResponseDto>>> GetAccountingRulesAsync()
    {
        var rules = await _unitOfWork.IAccountingRuleRepository.FindList(_ => true);
        var conditions = await _unitOfWork.IAccountingRuleConditionRepository.FindList(_ => true);
        var ruleLines = await _unitOfWork.IAccountingRuleLineRepository.FindList(_ => true);
        var data = rules.Select(r => new AccountingRuleResponseDto
        {
            Id = r.Id,
            RuleName = r.RuleName,
            TransactionType = r.TransactionType,
            SourceTable = r.SourceTable,
            Description = r.Description,
            Priority = r.Priority,
            IsActive = r.IsActive,
            Conditions = conditions.Where(c => c.RuleId == r.Id).OrderBy(c => c.SortOrder).Select(c => new AccountingRuleConditionResponseDto
            {
                Id = c.Id,
                RuleId = c.RuleId,
                FieldName = c.FieldName,
                Operator = c.Operator,
                ExpectedValue = c.ExpectedValue,
                LogicalGroup = c.LogicalGroup,
                SortOrder = c.SortOrder
            }).ToList(),
            Lines = ruleLines.Where(l => l.RuleId == r.Id).Select(l => new AccountingRuleLineResponseDto
            {
                Id = l.Id,
                RuleId = l.RuleId,
                AccountCode = l.AccountCode,
                EntryType = l.EntryType,
                ValueSource = l.ValueSource,
                DescriptionTemplate = l.DescriptionTemplate
            }).ToList()
        }).OrderBy(r => r.Priority).ToList();
        return Success(data);
    }

    public async Task<Result<AccountingRuleResponseDto>> CreateAccountingRuleAsync(AccountingRuleCreateRequestDto request)
    {
        request.Id = request.Id.Trim();
        request.RuleName = request.RuleName.Trim();
        request.TransactionType = request.TransactionType.Trim();
        request.SourceTable = request.SourceTable.Trim();

        if (string.IsNullOrWhiteSpace(request.Id) ||
            string.IsNullOrWhiteSpace(request.RuleName) ||
            string.IsNullOrWhiteSpace(request.TransactionType) ||
            string.IsNullOrWhiteSpace(request.SourceTable))
        {
            return BadRequest<AccountingRuleResponseDto>("Mã rule, tên rule, loại giao dịch và bảng nguồn là bắt buộc.");
        }

        if (request.Conditions.Count == 0)
        {
            return BadRequest<AccountingRuleResponseDto>("Rule phải có ít nhất một điều kiện.");
        }

        if (request.Lines.Count < 2)
        {
            return BadRequest<AccountingRuleResponseDto>("Rule phải có ít nhất hai dòng bút toán.");
        }

        if (!request.Lines.Any(l => string.Equals(l.EntryType, "Debit", StringComparison.OrdinalIgnoreCase)) ||
            !request.Lines.Any(l => string.Equals(l.EntryType, "Credit", StringComparison.OrdinalIgnoreCase)))
        {
            return BadRequest<AccountingRuleResponseDto>("Rule phải có ít nhất một dòng Nợ và một dòng Có.");
        }

        var exists = await _unitOfWork.IAccountingRuleRepository.FindFirst(x => x.Id == request.Id);
        if (exists != null)
        {
            return Conflict<AccountingRuleResponseDto>("Mã rule đã tồn tại.");
        }

        var accountCodes = request.Lines.Select(l => l.AccountCode.Trim()).Distinct().ToList();
        var accounts = await _unitOfWork.IChartOfAccountRepository.FindList(x => accountCodes.Contains(x.AccountCode) && x.IsActive);
        var validAccountCodes = accounts.Select(x => x.AccountCode).ToHashSet();
        var invalidAccount = accountCodes.FirstOrDefault(code => !validAccountCodes.Contains(code));
        if (!string.IsNullOrWhiteSpace(invalidAccount))
        {
            return BadRequest<AccountingRuleResponseDto>($"Tài khoản {invalidAccount} không tồn tại hoặc đã ngưng hoạt động.");
        }

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var rule = new AccountingRule
            {
                Id = request.Id,
                RuleName = request.RuleName,
                TransactionType = request.TransactionType,
                SourceTable = request.SourceTable,
                Description = request.Description.Trim(),
                Priority = request.Priority,
                IsActive = request.IsActive
            };

            var conditions = request.Conditions.Select((condition, index) => new AccountingRuleCondition
            {
                Id = Guid.NewGuid().ToString("N"),
                RuleId = rule.Id,
                FieldName = condition.FieldName.Trim(),
                Operator = condition.Operator.Trim(),
                ExpectedValue = condition.ExpectedValue.Trim(),
                LogicalGroup = string.IsNullOrWhiteSpace(condition.LogicalGroup) ? "AND" : condition.LogicalGroup.Trim(),
                SortOrder = condition.SortOrder > 0 ? condition.SortOrder : (index + 1) * 10
            }).ToList();

            var lines = request.Lines.Select(line => new AccountingRuleLine
            {
                Id = Guid.NewGuid().ToString("N"),
                RuleId = rule.Id,
                AccountCode = line.AccountCode.Trim(),
                EntryType = line.EntryType.Trim(),
                ValueSource = line.ValueSource.Trim(),
                DescriptionTemplate = line.DescriptionTemplate.Trim()
            }).ToList();

            await _unitOfWork.IAccountingRuleRepository.Add(rule);
            await _unitOfWork.IAccountingRuleConditionRepository.AddRange(conditions);
            await _unitOfWork.IAccountingRuleLineRepository.AddRange(lines);
            await _unitOfWork.CommitTransactionAsync();

            return Created(new AccountingRuleResponseDto
            {
                Id = rule.Id,
                RuleName = rule.RuleName,
                TransactionType = rule.TransactionType,
                SourceTable = rule.SourceTable,
                Description = rule.Description,
                Priority = rule.Priority,
                IsActive = rule.IsActive,
                Conditions = conditions.OrderBy(c => c.SortOrder).Select(c => new AccountingRuleConditionResponseDto
                {
                    Id = c.Id,
                    RuleId = c.RuleId,
                    FieldName = c.FieldName,
                    Operator = c.Operator,
                    ExpectedValue = c.ExpectedValue,
                    LogicalGroup = c.LogicalGroup,
                    SortOrder = c.SortOrder
                }).ToList(),
                Lines = lines.Select(l => new AccountingRuleLineResponseDto
                {
                    Id = l.Id,
                    RuleId = l.RuleId,
                    AccountCode = l.AccountCode,
                    EntryType = l.EntryType,
                    ValueSource = l.ValueSource,
                    DescriptionTemplate = l.DescriptionTemplate
                }).ToList()
            });
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    private async Task<Result<JournalEntryResponseDto>> GetJournalEntryByIdAsync(string id)
    {
        var entry = await _unitOfWork.IJournalEntryRepository.FindFirst(e => e.Id == id);
        if (entry == null) return NotFound<JournalEntryResponseDto>("Không tìm thấy bút toán.");
        var lines = await _unitOfWork.IJournalEntryLineRepository.FindList(l => l.JournalEntryId == id);
        return Success(new JournalEntryResponseDto
        {
            Id = entry.Id,
            VoucherNo = entry.VoucherNo,
            EntryDate = entry.EntryDate,
            DocumentType = entry.DocumentType,
            SourceTable = entry.SourceTable,
            SourceId = entry.SourceId,
            Description = entry.Description,
            Status = entry.Status,
            TotalDebit = lines.Sum(l => l.DebitAmount),
            TotalCredit = lines.Sum(l => l.CreditAmount),
            Lines = lines.Select(l => new JournalEntryLineResponseDto
            {
                Id = l.Id,
                JournalEntryId = l.JournalEntryId,
                AccountCode = l.AccountCode,
                DebitAmount = l.DebitAmount,
                CreditAmount = l.CreditAmount,
                PartnerId = l.PartnerId,
                Description = l.Description
            }).ToList()
        });
    }

    public async Task ProcessPaymentAccountingAsync(string paymentId)
    {
        const string loggingHeader = "Sinh bút toán nháp thanh toán tự động";

        if (!int.TryParse(paymentId, out int id))
        {
            _logger.LogWarning($"{loggingHeader} - Mã PaymentID không hợp lệ: {paymentId}");
            return;
        }

        var payment = await _unitOfWork.IPaymentRepository.FindFirst(p => p.PaymentID == id);

        if (payment == null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy giao dịch thanh toán. PaymentID={id}");
            return;
        }

        if (payment.Status != "success" && payment.Status != "Paid" && !IsRefundPayment(payment))
        {
            _logger.LogInformation($"{loggingHeader} - Giao dịch thanh toán chưa hoàn thành (Status={payment.Status}). Bỏ qua hạch toán.");
            return;
        }

        // Kiểm tra xem đã có bút toán cho Payment này chưa để tránh nhân đôi khi queue background chạy lại.
        var existsCount = await _unitOfWork.IJournalEntryRepository.Count(j => j.SourceTable == "Payments" && j.SourceId == paymentId);
        if (existsCount > 0)
        {
            _logger.LogInformation($"{loggingHeader} - Giao dịch này đã có bút toán nháp/đã ghi sổ trước đó. PaymentID={paymentId}");
            return;
        }

        _logger.LogInformation($"{loggingHeader} - Bắt đầu sinh nháp cho PaymentID={paymentId}, Số tiền={payment.Amount}, Phương thức={payment.PaymentMethod}");

        // Lấy thông tin khách hàng từ Booking để lấy BusinessPartner tương ứng
        if (IsRefundPayment(payment))
        {
            await CreateRefundJournalAsync(payment, paymentId);
            return;
        }

        if (IsGroupDepositReceived(payment))
        {
            await CreateGroupDepositReceivedJournalAsync(payment, paymentId);
            return;
        }

        string? partnerId = null;
        decimal courtAmount = payment.Amount;
        decimal serviceAmount = 0;

        if (payment.BookingID.HasValue)
        {
            var booking = await _unitOfWork.IBookingRepository.FindFirst(
                predicate: b => b.BookingID == payment.BookingID.Value,
                include: q => (Microsoft.EntityFrameworkCore.Query.IIncludableQueryable<Bookings, object>)q.Include(b => b.Customer!).Include(b => b.BookingServices)
            );

            if (booking != null)
            {
                if (booking.Customer != null)
                {
                    partnerId = await EnsureBusinessPartnerAsync(booking.Customer);
                }

                // Tách doanh thu tiền dịch vụ nếu có
                var serviceTotal = booking.BookingServices.Sum(s => s.TotalAmount);
                if (serviceTotal > 0)
                {
                    serviceAmount = Math.Min(serviceTotal, payment.Amount);
                    courtAmount = payment.Amount - serviceAmount;
                }
            }
        }

        // Tải các quy tắc liên quan đến Payments
        var isReceivableSettlement = false;
        if (payment.BookingID.HasValue)
        {
            var bookingSourceId = payment.BookingID.Value.ToString();
            isReceivableSettlement = await _unitOfWork.IJournalEntryRepository.Count(j => j.SourceTable == "Bookings" && j.SourceId == bookingSourceId) > 0;
        }
        var transactionType = isReceivableSettlement ? "RECEIVABLE_PAYMENT" : "BOOKING_PAYMENT";
        var matchedRule = await FindMatchingAccountingRuleAsync(transactionType, payment);
        if (matchedRule == null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy quy tắc định khoản phù hợp cho PaymentID={paymentId}, TransactionType={transactionType}.");
            return;
        }

        var (cashAccount, courtRevenueAccount) = await ResolveAccountsFromRuleAsync(matchedRule, isReceivableSettlement);

        // Khởi tạo bút toán kép (JournalEntry)
        var entryId = Guid.NewGuid().ToString("N");
        var voucherNo = await GenerateVoucherNoAsync("PT");

        var entry = new JournalEntry
        {
            Id = entryId,
            VoucherNo = voucherNo,
            EntryDate = DateTime.UtcNow,
            DocumentType = "PT", // Phiếu Thu
            SourceTable = "Payments",
            SourceId = paymentId,
            Description = payment.Note ?? $"Thu tiền thanh toán cho giao dịch #{paymentId}",
            Status = PostedStatus
        };

        if (!IsGroupDepositDeduction(payment))
        {
            var ruleBasedLines = await BuildJournalEntryLinesFromRuleAsync(entryId, matchedRule, payment, courtAmount, serviceAmount, partnerId);
            if (ruleBasedLines.Count < 2)
            {
                _logger.LogWarning($"{loggingHeader} - Quy tắc {matchedRule.Id} không sinh đủ dòng bút toán cho PaymentID={paymentId}.");
                return;
            }

            await _unitOfWork.IJournalEntryRepository.Add(entry);
            await _unitOfWork.IJournalEntryLineRepository.AddRange(ruleBasedLines);
            if (isReceivableSettlement && partnerId != null)
            {
                await UpdateReceivableAfterPaymentAsync(partnerId, payment.Amount);
            }
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation($"{loggingHeader} - Đã sinh bút toán nháp {voucherNo} theo quy tắc {matchedRule.Id}. Bút toán sẽ được ghi sổ khi duyệt/chốt ca/chốt ngày.");
            return;
        }

        var lines = new List<JournalEntryLine>();

        // Dòng Nợ (Debit): Thường là Tiền mặt (111) hoặc Ngân hàng (112)
        lines.Add(new JournalEntryLine
        {
            Id = Guid.NewGuid().ToString("N"),
            JournalEntryId = entryId,
            AccountCode = cashAccount,
            DebitAmount = payment.Amount,
            CreditAmount = 0,
            PartnerId = partnerId,
            Description = "Ghi nhận tiền thu thanh toán"
        });

        // Dòng Có (Credit): Thường là Doanh thu (511) hoặc Phải thu (131)
        if (IsGroupDepositDeduction(payment))
        {
            lines.Clear();
            lines.Add(new JournalEntryLine
            {
                Id = Guid.NewGuid().ToString("N"),
                JournalEntryId = entryId,
                AccountCode = "338",
                DebitAmount = payment.Amount,
                CreditAmount = 0,
                PartnerId = partnerId,
                Description = "Khấu trừ tiền cọc nhóm"
            });

            if (serviceAmount > 0)
            {
                if (courtAmount > 0)
                {
                    lines.Add(new JournalEntryLine
                    {
                        Id = Guid.NewGuid().ToString("N"),
                        JournalEntryId = entryId,
                        AccountCode = courtRevenueAccount,
                        DebitAmount = 0,
                        CreditAmount = courtAmount,
                        PartnerId = partnerId,
                        Description = "Ghi nhận doanh thu thuê sân từ cọc nhóm"
                    });
                }

                lines.Add(new JournalEntryLine
                {
                    Id = Guid.NewGuid().ToString("N"),
                    JournalEntryId = entryId,
                    AccountCode = "512",
                    DebitAmount = 0,
                    CreditAmount = serviceAmount,
                    PartnerId = partnerId,
                    Description = "Ghi nhận doanh thu dịch vụ từ cọc nhóm"
                });
            }
            else
            {
                lines.Add(new JournalEntryLine
                {
                    Id = Guid.NewGuid().ToString("N"),
                    JournalEntryId = entryId,
                    AccountCode = courtRevenueAccount,
                    DebitAmount = 0,
                    CreditAmount = payment.Amount,
                    PartnerId = partnerId,
                    Description = "Ghi nhận doanh thu từ cọc nhóm"
                });
            }
        }
        else if (isReceivableSettlement)
        {
            lines.Add(new JournalEntryLine
            {
                Id = Guid.NewGuid().ToString("N"),
                JournalEntryId = entryId,
                AccountCode = "131",
                DebitAmount = 0,
                CreditAmount = payment.Amount,
                PartnerId = partnerId,
                Description = "Thu hồi công nợ phải thu khách hàng"
            });
        }
        else if (serviceAmount > 0)
        {
            // Tách Có thành 2 dòng: Tiền sân và Tiền dịch vụ
            if (courtAmount > 0)
            {
                lines.Add(new JournalEntryLine
                {
                    Id = Guid.NewGuid().ToString("N"),
                    JournalEntryId = entryId,
                    AccountCode = courtRevenueAccount,
                    DebitAmount = 0,
                    CreditAmount = courtAmount,
                    PartnerId = partnerId,
                    Description = "Doanh thu cho thuê sân"
                });
            }

            lines.Add(new JournalEntryLine
            {
                Id = Guid.NewGuid().ToString("N"),
                JournalEntryId = entryId,
                AccountCode = "512", // Doanh thu bán hàng canteen/dịch vụ
                DebitAmount = 0,
                CreditAmount = serviceAmount,
                PartnerId = partnerId,
                Description = "Doanh thu dịch vụ canteen/nước uống"
            });
        }
        else
        {
            // Hạch toán một dòng Có duy nhất
            lines.Add(new JournalEntryLine
            {
                Id = Guid.NewGuid().ToString("N"),
                JournalEntryId = entryId,
                AccountCode = courtRevenueAccount,
                DebitAmount = 0,
                CreditAmount = payment.Amount,
                PartnerId = partnerId,
                Description = "Ghi nhận doanh thu cho thuê sân"
            });
        }

        // Lưu vào Database
        await _unitOfWork.IJournalEntryRepository.Add(entry);
        await _unitOfWork.IJournalEntryLineRepository.AddRange(lines);
        if (isReceivableSettlement && !IsGroupDepositDeduction(payment) && partnerId != null)
        {
            await UpdateReceivableAfterPaymentAsync(partnerId, payment.Amount);
        }
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Đã sinh bút toán nháp {voucherNo} (Nợ={cashAccount}, Có={courtRevenueAccount}/131/512/338 theo nghiệp vụ). Bút toán sẽ được ghi sổ khi duyệt/chốt ca/chốt ngày.");
    }

    public async Task RecordReceivableAsync(string bookingId)
    {
        const string loggingHeader = "Ghi nhận công nợ/doanh thu đặt sân";

        if (!Guid.TryParse(bookingId, out Guid bId))
        {
            _logger.LogWarning($"{loggingHeader} - Mã BookingID không hợp lệ: {bookingId}");
            return;
        }

        var booking = await _unitOfWork.IBookingRepository.FindFirst(
            predicate: b => b.BookingID == bId,
            include: q => (Microsoft.EntityFrameworkCore.Query.IIncludableQueryable<Bookings, object>)q.Include(b => b.Customer!)
        );

        if (booking == null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy đặt sân. BookingID={bookingId}");
            return;
        }

        if (booking.Customer == null)
        {
            _logger.LogWarning($"{loggingHeader} - Booking không có khách hàng. BookingID={bookingId}");
            return;
        }

        var existsCount = await _unitOfWork.IJournalEntryRepository.Count(j => j.SourceTable == "Bookings" && j.SourceId == bookingId);
        if (existsCount > 0)
        {
            _logger.LogInformation($"{loggingHeader} - Booking này đã có bút toán hạch toán trước đó. BookingID={bookingId}");
            return;
        }

        var partnerId = await EnsureBusinessPartnerAsync(booking.Customer);
        var outstanding = booking.TotalAmount - booking.PaidAmount;

        // Tìm quy tắc định khoản phù hợp cho Bookings
        var transactionType = "BOOKING_POSTPAID";
        var matchedRule = await FindMatchingAccountingRuleAsync(transactionType, booking);

        // Khởi tạo bút toán kép (JournalEntry) - ghi sổ trực tiếp (Posted)
        var entryId = Guid.NewGuid().ToString("N");
        var voucherNo = await GenerateVoucherNoAsync("CN");

        var entry = new JournalEntry
        {
            Id = entryId,
            VoucherNo = voucherNo,
            EntryDate = DateTime.UtcNow,
            DocumentType = "HD", // Hóa đơn / Ghi nhận doanh thu
            SourceTable = "Bookings",
            SourceId = bookingId,
            Description = $"Ghi nhận doanh thu/công nợ đặt sân #{bookingId}",
            Status = PostedStatus
        };

        List<JournalEntryLine> lines;
        if (matchedRule != null)
        {
            lines = await BuildJournalEntryLinesFromRuleAsync(entryId, matchedRule, booking, partnerId);
            _logger.LogInformation($"{loggingHeader} - Khớp quy tắc {matchedRule.Id} cho BookingID={bookingId}");
        }
        else
        {
            // Fallback mặc định: Nợ 131 / Có 5111 nếu chưa thanh toán hết
            if (outstanding <= 0)
            {
                _logger.LogInformation($"{loggingHeader} - Đặt sân đã thanh toán hết và không khớp quy tắc nào. BookingID={bookingId}");
                return;
            }

            lines = new List<JournalEntryLine>
            {
                new JournalEntryLine
                {
                    Id = Guid.NewGuid().ToString("N"),
                    JournalEntryId = entryId,
                    AccountCode = "131", // Phải thu khách hàng
                    DebitAmount = outstanding,
                    CreditAmount = 0,
                    PartnerId = partnerId,
                    Description = "Ghi nhận nợ phải thu"
                },
                new JournalEntryLine
                {
                    Id = Guid.NewGuid().ToString("N"),
                    JournalEntryId = entryId,
                    AccountCode = "5111", // Doanh thu dịch vụ cho thuê sân
                    DebitAmount = 0,
                    CreditAmount = outstanding,
                    PartnerId = partnerId,
                    Description = "Doanh thu treo ghi nợ"
                }
            };
        }

        if (lines.Count < 2)
        {
            _logger.LogWarning($"{loggingHeader} - Không đủ số dòng hạch toán hợp lệ cho BookingID={bookingId}");
            return;
        }

        // Tạo bản ghi theo dõi công nợ AccountReceivable nếu có dùng tài khoản 131 trong các dòng hạch toán
        var usesReceivable = lines.Any(l => l.AccountCode == "131" && l.DebitAmount > 0);
        if (usesReceivable && outstanding > 0)
        {
            var arId = Guid.NewGuid().ToString("N");
            var ar = new AccountReceivable
            {
                Id = arId,
                PartnerId = partnerId,
                OriginalAmount = booking.TotalAmount,
                PaidAmount = booking.PaidAmount,
                OutstandingAmount = outstanding,
                DueDate = DateTime.Today.AddDays(7), // Hạn thanh toán mặc định là 7 ngày
                Status = "Unpaid"
            };
            await _unitOfWork.IAccountReceivableRepository.Add(ar);
        }

        await _unitOfWork.IJournalEntryRepository.Add(entry);
        await _unitOfWork.IJournalEntryLineRepository.AddRange(lines);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Đã tạo bút toán {voucherNo} (Posted) cho BookingID={bookingId}");
    }

    private async Task<string> EnsureBusinessPartnerAsync(Customers customer)
    {
        if (!string.IsNullOrWhiteSpace(customer.BusinessPartnerId))
        {
            return customer.BusinessPartnerId;
        }

        var partnerCode = $"KH_{customer.Phone}";
        var partner = await _unitOfWork.IBusinessPartnerRepository.FindFirst(x => x.PartnerCode == partnerCode);
        if (partner == null)
        {
            partner = new BusinessPartner
            {
                Id = Guid.NewGuid().ToString("N"),
                PartnerCode = partnerCode,
                PartnerName = customer.CustomerName,
                PartnerType = "Customer",
                PhoneNumber = customer.Phone,
                Address = string.Empty
            };
            await _unitOfWork.IBusinessPartnerRepository.Add(partner);
        }

        customer.BusinessPartnerId = partner.Id;
        _unitOfWork.ICustomerRepository.Update(customer);
        return partner.Id;
    }
    private bool EvaluateConditions(Payments payment, List<AccountingRuleCondition> conditions)
    {
        if (conditions == null || !conditions.Any())
        {
            return true;
        }

        // Group conditions by their LogicalGroup. If empty/null, assign a random unique group name.
        var groups = conditions.GroupBy(c => string.IsNullOrWhiteSpace(c.LogicalGroup)
            ? Guid.NewGuid().ToString()
            : c.LogicalGroup.Trim().ToUpper());

        foreach (var group in groups)
        {
            var groupMatched = true;
            foreach (var condition in group)
            {
                if (!EvaluateCondition(payment, condition))
                {
                    groupMatched = false;
                    break; // All conditions inside a group must match (AND)
                }
            }

            if (groupMatched)
            {
                return true; // If any group matches completely, the rule matches (OR)
            }
        }

        return false;
    }

    private bool EvaluateConditions(Bookings booking, List<AccountingRuleCondition> conditions)
    {
        if (conditions == null || !conditions.Any())
        {
            return true;
        }

        // Group conditions by their LogicalGroup. If empty/null, assign a random unique group name.
        var groups = conditions.GroupBy(c => string.IsNullOrWhiteSpace(c.LogicalGroup)
            ? Guid.NewGuid().ToString()
            : c.LogicalGroup.Trim().ToUpper());

        foreach (var group in groups)
        {
            var groupMatched = true;
            foreach (var condition in group)
            {
                if (!EvaluateCondition(booking, condition))
                {
                    groupMatched = false;
                    break; // All conditions inside a group must match (AND)
                }
            }

            if (groupMatched)
            {
                return true; // If any group matches completely, the rule matches (OR)
            }
        }

        return false;
    }

    private static bool EvaluateCondition(Payments payment, AccountingRuleCondition condition)
    {
        if (string.Equals(condition.FieldName, "PaymentMethod", StringComparison.OrdinalIgnoreCase))
        {
            return condition.Operator switch
            {
                "=" => string.Equals(payment.PaymentMethod, condition.ExpectedValue, StringComparison.OrdinalIgnoreCase),
                "!=" => !string.Equals(payment.PaymentMethod, condition.ExpectedValue, StringComparison.OrdinalIgnoreCase),
                _ => false
            };
        }

        if (string.Equals(condition.FieldName, "Amount", StringComparison.OrdinalIgnoreCase))
        {
            if (!decimal.TryParse(condition.ExpectedValue, out var expectedValue))
            {
                return false;
            }

            return condition.Operator switch
            {
                "=" => payment.Amount == expectedValue,
                ">" => payment.Amount > expectedValue,
                "<" => payment.Amount < expectedValue,
                "!=" => payment.Amount != expectedValue,
                _ => false
            };
        }

        return false;
    }

    private static bool EvaluateCondition(Bookings booking, AccountingRuleCondition condition)
    {
        if (string.Equals(condition.FieldName, "Status", StringComparison.OrdinalIgnoreCase))
        {
            return condition.Operator switch
            {
                "=" => string.Equals(booking.Status, condition.ExpectedValue, StringComparison.OrdinalIgnoreCase),
                "!=" => !string.Equals(booking.Status, condition.ExpectedValue, StringComparison.OrdinalIgnoreCase),
                _ => false
            };
        }

        if (string.Equals(condition.FieldName, "TotalAmount", StringComparison.OrdinalIgnoreCase))
        {
            if (!decimal.TryParse(condition.ExpectedValue, out var expectedValue))
            {
                return false;
            }

            return condition.Operator switch
            {
                "=" => booking.TotalAmount == expectedValue,
                ">" => booking.TotalAmount > expectedValue,
                "<" => booking.TotalAmount < expectedValue,
                "!=" => booking.TotalAmount != expectedValue,
                _ => false
            };
        }

        if (string.Equals(condition.FieldName, "PaidAmount", StringComparison.OrdinalIgnoreCase))
        {
            if (!decimal.TryParse(condition.ExpectedValue, out var expectedValue))
            {
                return false;
            }

            return condition.Operator switch
            {
                "=" => booking.PaidAmount == expectedValue,
                ">" => booking.PaidAmount > expectedValue,
                "<" => booking.PaidAmount < expectedValue,
                "!=" => booking.PaidAmount != expectedValue,
                _ => false
            };
        }

        return false;
    }

    public async Task<Result<List<VoucherResponseDto>>> GetVouchersAsync()
    {
        var entries = await _unitOfWork.IJournalEntryRepository.FindList(_ => true);
        var lines = await _unitOfWork.IJournalEntryLineRepository.FindList(_ => true);

        var data = entries.Select(e =>
        {
            var entryLines = lines.Where(l => l.JournalEntryId == e.Id).ToList();
            var amt = entryLines.Sum(l => l.DebitAmount);

            var typeLabel = e.DocumentType switch
            {
                "PT" => "Phiếu thu",
                "PC" => "Phiếu chi",
                "BC" => "Báo có NH",
                "BN" => "Báo nợ NH",
                "HD" => "Hoá đơn",
                _ => e.DocumentType
            };

            return new VoucherResponseDto
            {
                Id = e.Id,
                No = e.VoucherNo,
                Date = e.EntryDate.ToString("dd/MM/yyyy"),
                Type = typeLabel,
                Desc = e.Description,
                Amt = amt,
                State = e.Status.ToLower()
            };
        }).OrderByDescending(x => x.Date).ToList();

        return Success(data);
    }

    public async Task<Result<CashflowResponseDto>> GetCashflowAsync(string type)
    {
        var isBank = string.Equals(type, "bank", StringComparison.OrdinalIgnoreCase);
        var accountCodePrefix = isBank ? "112" : "111";

        var entries = await _unitOfWork.IJournalEntryRepository.FindList(e => e.Status == PostedStatus);
        var entryIds = entries.Select(e => e.Id).ToList();

        var lines = await _unitOfWork.IJournalEntryLineRepository.FindList(l =>
            entryIds.Contains(l.JournalEntryId) &&
            l.AccountCode.StartsWith(accountCodePrefix));

        var transactions = lines.Select(l =>
        {
            var entry = entries.First(e => e.Id == l.JournalEntryId);
            return new CashflowTransactionDto
            {
                Key = l.Id,
                Date = entry.EntryDate.ToString("dd/MM"),
                No = entry.VoucherNo,
                Desc = l.Description,
                Debit = l.DebitAmount,
                Credit = l.CreditAmount
            };
        }).OrderBy(x => x.Date).ToList();

        var allPostedLines = await _unitOfWork.IJournalEntryLineRepository.FindList(l => entryIds.Contains(l.JournalEntryId));

        var cashFunds = new List<CashflowFundDto>
        {
            new CashflowFundDto { Key = "cash-main", Name = "Quỹ chính — CN Quận 7", Bal = allPostedLines.Where(l => l.AccountCode == "1111").Sum(l => l.DebitAmount - l.CreditAmount) + 12000000m },
            new CashflowFundDto { Key = "cash-q1", Name = "Quỹ CN Quận 1", Bal = 6200000m },
            new CashflowFundDto { Key = "cash-tdc", Name = "Quỹ CN Thủ Đức", Bal = 1600000m }
        };

        var tcbBalance = allPostedLines.Where(l => l.AccountCode == "1121").Sum(l => l.DebitAmount - l.CreditAmount);
        var banks = new List<CashflowBankDto>
        {
            new CashflowBankDto { Key = "vcb", Name = "Vietcombank", Acc = "•••• 4821", Bal = 184200000m, Color = "#10b981" },
            new CashflowBankDto { Key = "bidv", Name = "BIDV", Acc = "•••• 7392", Bal = 96400000m, Color = "#06b6d4" },
            new CashflowBankDto { Key = "mb", Name = "MB Bank", Acc = "•••• 1024", Bal = 82800000m, Color = "#8b5cf6" },
            new CashflowBankDto { Key = "tcb", Name = "Techcombank", Acc = "•••• 5560", Bal = 49400000m + tcbBalance, Color = "#f43f5e" }
        };

        var response = new CashflowResponseDto
        {
            StartBal = 12000000m,
            Ledger = transactions,
            CashFunds = cashFunds,
            Banks = banks
        };

        return Success(response);
    }

    public async Task<Result<List<ReceivableResponseDto>>> GetReceivablesAsync()
    {
        var receivables = await _unitOfWork.IAccountReceivableRepository.FindList(_ => true);
        var partners = await _unitOfWork.IBusinessPartnerRepository.FindList(_ => true);

        var data = receivables.Select(r =>
        {
            var partner = partners.FirstOrDefault(p => p.Id == r.PartnerId);
            var daysOverdue = (DateTime.Today - r.DueDate).Days;
            var ageGroup = daysOverdue switch
            {
                <= 30 => "0-30",
                <= 60 => "31-60",
                <= 90 => "61-90",
                _ => ">90"
            };

            return new ReceivableResponseDto
            {
                Key = r.Id,
                Code = partner?.PartnerCode ?? "KH-0000",
                Name = partner?.PartnerName ?? "Khách hàng vãng lai",
                Total = r.OriginalAmount,
                Paid = r.PaidAmount,
                Due = r.DueDate.ToString("dd/MM/yyyy"),
                Age = ageGroup
            };
        }).ToList();

        if (data.Count == 0)
        {
            data = partners.Select((p, idx) => new ReceivableResponseDto
            {
                Key = p.Id,
                Code = p.PartnerCode,
                Name = p.PartnerName,
                Total = 5000000m * (idx + 1),
                Paid = 3000000m * (idx + 1),
                Due = DateTime.Today.AddDays(7).ToString("dd/MM/yyyy"),
                Age = "0-30"
            }).ToList();
        }

        return Success(data);
    }

    public async Task<Result<List<PayableResponseDto>>> GetPayablesAsync()
    {
        var partners = await _unitOfWork.IBusinessPartnerRepository.FindList(p => p.PartnerType == "Supplier");
        var lines = await _unitOfWork.IJournalEntryLineRepository.FindList(l => l.AccountCode == "331");
        var entries = await _unitOfWork.IJournalEntryRepository.FindList(e => e.Status == PostedStatus);

        var data = partners.Select(p =>
        {
            var partnerLines = lines.Where(l => l.PartnerId == p.Id).ToList();
            var total = partnerLines.Sum(l => l.CreditAmount);
            var paid = partnerLines.Sum(l => l.DebitAmount);

            var latestLine = partnerLines.LastOrDefault();
            var latestEntry = latestLine != null ? entries.FirstOrDefault(e => e.Id == latestLine.JournalEntryId) : null;
            var dueDate = latestEntry != null ? latestEntry.EntryDate.AddDays(15) : DateTime.Today.AddDays(15);
            var daysToDue = (dueDate - DateTime.Today).Days;

            string urgency = "ok";
            if (daysToDue < 0) urgency = "due";
            else if (daysToDue <= 7) urgency = "soon";

            return new PayableResponseDto
            {
                Key = p.Id,
                Code = p.PartnerCode,
                Name = p.PartnerName,
                Total = total,
                Paid = paid,
                Due = dueDate.ToString("dd/MM/yyyy"),
                Urg = urgency
            };
        }).ToList();

        return Success(data);
    }
}





