using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CreateCourtPriceRequest
{
    [Required] public int CourtID { get; set; }
    [Required] public int TimeSlotID { get; set; }
    [Required, Range(0, 6)] public int DayOfWeek { get; set; }
    [Required] public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateCourtPriceRequest
{
    [Required] public decimal Price { get; set; }
    public bool IsActive { get; set; }
}
