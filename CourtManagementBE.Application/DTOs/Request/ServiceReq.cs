using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class ServiceRequest
{
    public int? FacilityID { get; set; }
    [Required, MaxLength(20)] public string ServiceCode { get; set; } = string.Empty;
    [Required, MaxLength(200)] public string ServiceName { get; set; } = string.Empty;
    public int? ServiceTypeID { get; set; }
    public int? UnitID { get; set; }
    public int MinQuantity { get; set; }
    public int MaxQuantity { get; set; }
    public bool IsTrackStock { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public decimal? Price { get; set; }
}

public class StockAdjustmentRequest
{
    [Range(1, 10000, ErrorMessage = "Số lượng điều chỉnh phải lớn hơn 0.")]
    public int Quantity { get; set; }
}
