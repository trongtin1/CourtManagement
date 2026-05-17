using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public abstract class MasterDataBase
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedDate { get; set; } = DateTimeOffset.UtcNow;
}
