using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CreateCourtUtilityRequest
{
    [Required] public int CourtID { get; set; }
    [Required] public int UtilityID { get; set; }
}
