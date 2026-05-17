namespace CourtManagementBE.Application.DTOs;

public class CreateBookingStatusRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public string ColorCode { get; set; } = string.Empty;
    public bool CanCancel { get; set; }
    public bool IsFinal { get; set; }
}

public class UpdateBookingStatusRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public string ColorCode { get; set; } = string.Empty;
    public bool CanCancel { get; set; }
    public bool IsFinal { get; set; }
}
