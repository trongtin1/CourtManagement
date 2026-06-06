namespace CourtManagementBE.Application.DTOs;

public class JournalEntryResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string VoucherNo { get; set; } = string.Empty;
    public DateTime EntryDate { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string SourceTable { get; set; } = string.Empty;
    public string SourceId { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }
    public bool IsBalanced => TotalDebit == TotalCredit;
    public List<JournalEntryLineResponseDto> Lines { get; set; } = [];
}

public class JournalEntryLineResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string JournalEntryId { get; set; } = string.Empty;
    public string AccountCode { get; set; } = string.Empty;
    public string? AccountName { get; set; }
    public decimal DebitAmount { get; set; }
    public decimal CreditAmount { get; set; }
    public string? PartnerId { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class PostJournalEntriesResponseDto
{
    public int PostedCount { get; set; }
    public List<string> PostedEntryIds { get; set; } = [];
}

public class ChartOfAccountResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string AccountCode { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty;
    public string? ParentAccountId { get; set; }
    public int Level { get; set; }
    public bool IsActive { get; set; }
}

public class AccountingRuleResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty;
    public string DebitAccount { get; set; } = string.Empty;
    public string CreditAccount { get; set; } = string.Empty;
    public string OriginalSource { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<AccountingRuleConditionResponseDto> Conditions { get; set; } = [];
}

public class AccountingRuleConditionResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string RuleId { get; set; } = string.Empty;
    public string SourceTable { get; set; } = string.Empty;
    public string FieldName { get; set; } = string.Empty;
    public string Operator { get; set; } = string.Empty;
    public string ExpectedValue { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class VoucherResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string No { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
    public decimal Amt { get; set; }
    public string State { get; set; } = string.Empty;
}

public class CashflowTransactionDto
{
    public string Key { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string No { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
}

public class CashflowFundDto
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Bal { get; set; }
}

public class CashflowBankDto
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Acc { get; set; } = string.Empty;
    public decimal Bal { get; set; }
    public string Color { get; set; } = string.Empty;
}

public class CashflowResponseDto
{
    public decimal StartBal { get; set; }
    public List<CashflowTransactionDto> Ledger { get; set; } = [];
    public List<CashflowFundDto> CashFunds { get; set; } = [];
    public List<CashflowBankDto> Banks { get; set; } = [];
}

public class ReceivableResponseDto
{
    public string Key { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public decimal Paid { get; set; }
    public string Due { get; set; } = string.Empty;
    public string Age { get; set; } = string.Empty;
}

public class PayableResponseDto
{
    public string Key { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public decimal Paid { get; set; }
    public string Due { get; set; } = string.Empty;
    public string Urg { get; set; } = string.Empty;
}

