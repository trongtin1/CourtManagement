namespace CourtManagementBE.Application.DTOs;

public class CustomerResponse
{
    public int CustomerID { get; set; }
    public Guid? UserID { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int? CustomerTypeID { get; set; }
    public string CustomerType { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTimeOffset CreateDate { get; set; }
}
