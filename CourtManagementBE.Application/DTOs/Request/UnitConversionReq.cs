using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class UnitConversionRequest
{
    [Required(ErrorMessage = "Dịch vụ liên kết là bắt buộc.")]
    public int ServiceID { get; set; }

    [Required(ErrorMessage = "Đơn vị gốc là bắt buộc.")]
    public int SourceUnitID { get; set; }

    [Required(ErrorMessage = "Đơn vị quy đổi là bắt buộc.")]
    public int TargetUnitID { get; set; }

    [Range(0.0001, 1000000, ErrorMessage = "Tỉ lệ quy đổi phải lớn hơn 0.")]
    public decimal Factor { get; set; }

    public bool IsActive { get; set; } = true;
}
