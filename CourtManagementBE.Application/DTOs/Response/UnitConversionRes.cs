namespace CourtManagementBE.Application.DTOs;

public class UnitConversionResponse
{
    public int UnitConversionID { get; set; }
    public int ServiceID { get; set; }
    public int SourceUnitID { get; set; }
    public string SourceUnitName { get; set; } = string.Empty;
    public string SourceUnitSymbol { get; set; } = string.Empty;
    public int TargetUnitID { get; set; }
    public string TargetUnitName { get; set; } = string.Empty;
    public string TargetUnitSymbol { get; set; } = string.Empty;
    public decimal Factor { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
}
