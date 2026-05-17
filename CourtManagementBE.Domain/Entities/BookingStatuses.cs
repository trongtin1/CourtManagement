using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class BookingStatuses : MasterDataBase
{
    [Key]
    public int BookingStatusID { get; set; }
    public string ColorCode { get; set; } = string.Empty;
    public bool CanCancel { get; set; }
    public bool IsFinal { get; set; }
}
