namespace CourtManagementBE.Application.DTOs;

public class CourtUtilityResponse
{
    public int CourtUtilitiesID { get; set; }
    public int CourtID { get; set; }
    public int UtilityID { get; set; }
    public DateTimeOffset CreateDate { get; set; }
}
