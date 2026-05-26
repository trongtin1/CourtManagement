using System;
using System.Collections.Generic;

namespace CourtManagementBE.Application.DTOs;

public class ComboResponse
{
    public int ComboID { get; set; }
    public string ComboCode { get; set; } = string.Empty;
    public string ComboName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal ComboPrice { get; set; }
    public int DurationHours { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public List<ComboServiceResponse> Services { get; set; } = new();
}

public class ComboServiceResponse
{
    public int ServiceID { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public string ServiceCode { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
