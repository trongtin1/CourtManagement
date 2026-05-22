using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CourtUtilityRequest
{
    [Required] public int CourtID { get; set; }
    [Required] public int UtilityID { get; set; }
}
