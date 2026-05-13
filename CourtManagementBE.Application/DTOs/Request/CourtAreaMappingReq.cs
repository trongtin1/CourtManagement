using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Application.DTOs;

public class CreateCourtAreaMappingRequest
{
    [Required] public int CourtID { get; set; }
    [Required] public int AreaID { get; set; }
    public float PositionX { get; set; }
    public float PositionY { get; set; }
    public int DisplayOrder { get; set; }
}

public class UpdateCourtAreaMappingRequest
{
    public float PositionX { get; set; }
    public float PositionY { get; set; }
    public int DisplayOrder { get; set; }
}
