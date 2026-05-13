using CourtManagementBE.Application.Common;

namespace CourtManagementBE.Domain.Models
{
    public class PagingSpecification
    {
        public int Page { get; }
        public int PageSize { get; }
        public int Skip => (Page - 1) * PageSize;
        public int Take => PageSize;

        public PagingSpecification(QueryResource query)
        {
            Page = query.Page <= 0 ? 1 : query.Page;
            PageSize = query.PageSize <= 0 ? 10 : query.PageSize;
        }
    }
}
