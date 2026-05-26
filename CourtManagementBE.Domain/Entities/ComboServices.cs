using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class ComboServices
{
    [Key]
    public int ID { get; set; }
    public int ComboID { get; set; }
    public int ServiceID { get; set; }
    public int Quantity { get; set; }

    public virtual Combos Combo { get; set; } = null!;
    public virtual Services Service { get; set; } = null!;
}
