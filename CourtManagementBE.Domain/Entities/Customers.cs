using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class Customers
{
    [Key]
    public int CustomerID { get; set; }
    public Guid? UserID { get; set; }              // nullable: null = khách vãng lai, có giá trị = user đã đăng ký
    public string CustomerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int? CustomerTypeID { get; set; }
    public string CustomerType { get; set; } = "normal"; // normal | vip | member
    public string Note { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreateDate { get; set; } = DateTimeOffset.UtcNow;
}
