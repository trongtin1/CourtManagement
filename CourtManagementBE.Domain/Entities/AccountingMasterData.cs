namespace CourtManagementBE.Domain.Entities;

public class AccountingAccountTypes : MasterDataBase
{
    public int AccountingAccountTypeID { get; set; }
    public string NormalBalance { get; set; } = string.Empty;
}

public class JournalDocumentTypes : MasterDataBase
{
    public int JournalDocumentTypeID { get; set; }
    public string VoucherPrefix { get; set; } = string.Empty;
}

public class BusinessPartnerTypes : MasterDataBase
{
    public int BusinessPartnerTypeID { get; set; }
}

public class BankAccount
{
    public int BankAccountID { get; set; }
    public string Code { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string AccountNumberMasked { get; set; } = string.Empty;
    public string AccountCode { get; set; } = string.Empty;
    public decimal OpeningBalance { get; set; }
    public string ColorCode { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class CashFund
{
    public int CashFundID { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string AccountCode { get; set; } = string.Empty;
    public decimal OpeningBalance { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
