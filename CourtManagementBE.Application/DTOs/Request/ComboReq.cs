using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace CourtManagementBE.Application.DTOs;

public class ComboRequest
{
    [Required, MaxLength(50)] public string ComboCode { get; set; } = string.Empty;
    [Required, MaxLength(200)] public string ComboName { get; set; } = string.Empty;
    [MaxLength(500)] public string Description { get; set; } = string.Empty;
    public decimal ComboPrice { get; set; }
    public int DurationHours { get; set; }
    public bool IsActive { get; set; } = true;
    public List<ComboServiceRequest> Services { get; set; } = new();
}

public class ComboServiceRequest
{
    public int ServiceID { get; set; }
    public int Quantity { get; set; }
}
