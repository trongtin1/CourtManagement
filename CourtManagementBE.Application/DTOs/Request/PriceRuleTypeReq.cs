namespace CourtManagementBE.Application.DTOs;

public class CreatePriceRuleTypeRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public string ColorCode { get; set; } = string.Empty;
    public bool IsMapping { get; set; } = false;
    public bool IsLoadDefault { get; set; } = true;
}

public class UpdatePriceRuleTypeRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public string ColorCode { get; set; } = string.Empty;
    public bool IsMapping { get; set; }
    public bool IsLoadDefault { get; set; }
}
