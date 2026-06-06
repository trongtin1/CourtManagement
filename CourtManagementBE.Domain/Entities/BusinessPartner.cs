using System.ComponentModel.DataAnnotations;

namespace CourtManagementBE.Domain.Entities;

public class BusinessPartner
{
    [Key]
    public string Id { get; set; } = string.Empty;

    public string PartnerCode { get; set; } = string.Empty;

    public string PartnerName { get; set; } = string.Empty;

    public string PartnerType { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;
}
