using CourtManagementBE.Application.Common;

namespace CourtManagementBE.Application.Resources
{
    public class BookingResource : QueryResource
    {
        public int? BookingGroupID { get; set; }
        public string? Status { get; set; }
    }
}
