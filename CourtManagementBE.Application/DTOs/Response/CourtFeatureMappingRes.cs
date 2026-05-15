namespace CourtManagementBE.Application.DTOs;

public class CourtFeatureMappingResponse
{
    public int CourtFeatureMappingID { get; set; }
    public int CourtID { get; set; }
    public int CourtFeatureID { get; set; }
    public DateTimeOffset CreateDate { get; set; }
}
