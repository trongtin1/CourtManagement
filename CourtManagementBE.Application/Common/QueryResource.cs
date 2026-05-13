namespace CourtManagementBE.Application.Common
{
    public class QueryResource
    {
        public string SortColumnBy { get; set; } = string.Empty;
        public bool IsSortColumnAscending { get; set; } = true;
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 12;
        public string? SearchTerm { get; set; } = null;
    }

}