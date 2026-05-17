using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CreateCustomerRequest
{
    public Guid? UserID { get; set; }
    [Required, MaxLength(200)] public string CustomerName { get; set; } = string.Empty;
    [MaxLength(20)] public string Phone { get; set; } = string.Empty;
    [MaxLength(255)] public string Email { get; set; } = string.Empty;
    public int? CustomerTypeID { get; set; }
    [MaxLength(20)] public string CustomerType { get; set; } = "normal";
    [MaxLength(500)] public string Note { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class UpdateCustomerRequest
{
    [Required, MaxLength(200)] public string CustomerName { get; set; } = string.Empty;
    [MaxLength(20)] public string Phone { get; set; } = string.Empty;
    [MaxLength(255)] public string Email { get; set; } = string.Empty;
    public int? CustomerTypeID { get; set; }
    [MaxLength(20)] public string CustomerType { get; set; } = string.Empty;
    [MaxLength(500)] public string Note { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
