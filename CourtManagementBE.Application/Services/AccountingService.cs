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

        if (!string.IsNullOrWhiteSpace(dto.Description)) entry.Description = dto.Description;
        _unitOfWork.IJournalEntryRepository.Update(entry);
        await _unitOfWork.IJournalEntryLineRepository.RemoveWithPredicate(l => l.JournalEntryId == id);

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

    public async Task<Result<List<AccountingRuleResponseDto>>> GetAccountingRulesAsync()
    {
        var rules = await _unitOfWork.IAccountingRuleRepository.FindList(_ => true);
        var conditions = await _unitOfWork.IAccountingRuleConditionRepository.FindList(_ => true);
        var data = rules.Select(r => new AccountingRuleResponseDto
        {
            Id = r.Id,
            TransactionType = r.TransactionType,
            DebitAccount = r.DebitAccount,
            CreditAccount = r.CreditAccount,
            OriginalSource = r.OriginalSource,
            Description = r.Description,
            Conditions = conditions.Where(c => c.RuleId == r.Id).Select(c => new AccountingRuleConditionResponseDto
            {
                Id = c.Id,
                RuleId = c.RuleId,
                SourceTable = c.SourceTable,
                FieldName = c.FieldName,
                Operator = c.Operator,
                ExpectedValue = c.ExpectedValue,
                Description = c.Description
            }).ToList()
        }).ToList();
        return Success(data);
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

        if (payment.Status != "success" && payment.Status != "Paid")
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
        var rules = await _unitOfWork.IAccountingRuleRepository.FindList(r => r.OriginalSource == "Payments");

        AccountingRule? matchedRule = null;

        foreach (var rule in rules)
        {
            var conditions = await _unitOfWork.IAccountingRuleConditionRepository.FindList(c => c.RuleId == rule.Id);

            if (EvaluateConditions(payment, conditions))
            {
                matchedRule = rule;
                break;
            }
        }

        if (matchedRule == null)
        {
            _logger.LogWarning($"{loggingHeader} - Không tìm thấy quy tắc định khoản nào phù hợp cho PaymentID={paymentId}.");
            return;
        }

        // Khởi tạo bút toán kép (JournalEntry)
        var entryId = Guid.NewGuid().ToString("N");
        var voucherNo = $"PT-{DateTime.Now:yyyyMMdd}-{new Random().Next(1000, 9999)}";

        var entry = new JournalEntry
        {
            Id = entryId,
            VoucherNo = voucherNo,
            EntryDate = DateTime.UtcNow,
            DocumentType = "PT", // Phiếu Thu
            SourceTable = "Payments",
            SourceId = paymentId,
            Description = payment.Note ?? $"Thu tiền thanh toán cho giao dịch #{paymentId}",
            Status = DraftStatus
        };

        var lines = new List<JournalEntryLine>();

        // Dòng Nợ (Debit): Thường là Tiền mặt (111) hoặc Ngân hàng (112)
        lines.Add(new JournalEntryLine
        {
            Id = Guid.NewGuid().ToString("N"),
            JournalEntryId = entryId,
            AccountCode = matchedRule.DebitAccount,
            DebitAmount = payment.Amount,
            CreditAmount = 0,
            PartnerId = partnerId,
            Description = $"Nợ tài khoản dòng tiền theo quy tắc {matchedRule.Id}"
        });

        // Dòng Có (Credit): Thường là Doanh thu (511) hoặc Phải thu (131)
        if (isReceivableSettlement)
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
                    AccountCode = matchedRule.CreditAccount,
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
                AccountCode = matchedRule.CreditAccount,
                DebitAmount = 0,
                CreditAmount = payment.Amount,
                PartnerId = partnerId,
                Description = $"Có tài khoản doanh thu/công nợ theo quy tắc {matchedRule.Id}"
            });
        }

        // Lưu vào Database
        await _unitOfWork.IJournalEntryRepository.Add(entry);
        await _unitOfWork.IJournalEntryLineRepository.AddRange(lines);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Đã sinh bút toán nháp {voucherNo} (Nợ={matchedRule.DebitAccount}, Có={matchedRule.CreditAccount}). Bút toán sẽ được ghi sổ khi duyệt/chốt ca/chốt ngày.");
    }

    public async Task RecordReceivableAsync(string bookingId)
    {
        const string loggingHeader = "Sinh bút toán nháp công nợ phải thu";

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
            _logger.LogInformation($"{loggingHeader} - Booking này đã có bút toán nháp/đã ghi sổ trước đó. BookingID={bookingId}");
            return;
        }

        var partnerId = await EnsureBusinessPartnerAsync(booking.Customer);

        // Tạo bản ghi theo dõi công nợ AccountReceivable
        var arId = Guid.NewGuid().ToString("N");
        var outstanding = booking.TotalAmount - booking.PaidAmount;

        if (outstanding <= 0)
        {
            _logger.LogInformation($"{loggingHeader} - Đặt sân đã thanh toán hết, không tạo công nợ. BookingID={bookingId}");
            return;
        }

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

        // Tạo bút toán hạch toán Nợ 131 / Có 511
        var entryId = Guid.NewGuid().ToString("N");
        var voucherNo = $"CN-{DateTime.Now:yyyyMMdd}-{new Random().Next(1000, 9999)}";

        var entry = new JournalEntry
        {
            Id = entryId,
            VoucherNo = voucherNo,
            EntryDate = DateTime.UtcNow,
            DocumentType = "PT", // Phải thu
            SourceTable = "Bookings",
            SourceId = bookingId,
            Description = $"Ghi nhận công nợ phải thu cho đặt sân #{bookingId}",
            Status = DraftStatus
        };

        var lines = new List<JournalEntryLine>
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

        await _unitOfWork.IAccountReceivableRepository.Add(ar);
        await _unitOfWork.IJournalEntryRepository.Add(entry);
        await _unitOfWork.IJournalEntryLineRepository.AddRange(lines);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation($"{loggingHeader} - Đã tạo công nợ {arId} và bút toán nháp {voucherNo} cho đối tác {partnerId} số tiền {outstanding}đ. Bút toán sẽ được ghi sổ khi duyệt/chốt ca/chốt ngày.");
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

        var hasOrCondition = conditions.Any(c => string.Equals(c.LogicalGroup, "OR", StringComparison.OrdinalIgnoreCase));
        var anyOrMatched = false;

        foreach (var condition in conditions)
        {
            var isOr = string.Equals(condition.LogicalGroup, "OR", StringComparison.OrdinalIgnoreCase);
            var matched = EvaluateCondition(payment, condition);

            if (isOr)
            {
                anyOrMatched |= matched;
                continue;
            }

            if (!matched)
            {
                return false;
            }
        }

        return !hasOrCondition || anyOrMatched;
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





