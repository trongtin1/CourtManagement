using System;

namespace CourtManagementBE.Domain.Entities
{
    public class IdempotencyKey
    {
        public string Key { get; set; } = string.Empty;
        public string RequestHash { get; set; } = string.Empty;
        public string ResponseContent { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
    }
}
