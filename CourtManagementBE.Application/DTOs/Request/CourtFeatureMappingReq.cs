using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CourtFeatureMappingRequest
{
    [Required] public int CourtID { get; set; }
    [Required] public int CourtFeatureID { get; set; }
}
