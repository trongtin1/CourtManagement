namespace CourtManagementBE.Domain.Enums;

public enum BookingStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed,
    CheckedIn,
    NoShow
}

public enum BookingGroupStatus
{
    Active,
    Paused,
    Cancelled,
    Completed
}
