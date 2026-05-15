using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CreateCourtFeatureMappingRequest
{
    [Required] public int CourtID { get; set; }
    [Required] public int CourtFeatureID { get; set; }
}
