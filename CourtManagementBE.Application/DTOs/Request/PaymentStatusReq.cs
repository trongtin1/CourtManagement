namespace CourtManagementBE.Application.DTOs;

public class CreatePaymentStatusRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public string ColorCode { get; set; } = string.Empty;
    public bool IsFinal { get; set; }
}

public class UpdatePaymentStatusRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public string ColorCode { get; set; } = string.Empty;
    public bool IsFinal { get; set; }
}
