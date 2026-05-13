namespace CourtManagementBE.Application.DTOs;

public class DashboardMetricResponse
{
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public long Value { get; set; }
    public string IconKey { get; set; } = string.Empty;
}

public class DashboardSummaryResponse
{
    public List<DashboardMetricResponse> Metrics { get; set; } = [];
    public string Overview { get; set; } = string.Empty;
}
