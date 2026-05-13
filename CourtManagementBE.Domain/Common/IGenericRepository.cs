
using CourtManagementBE.Domain.Models;
using Microsoft.EntityFrameworkCore.Query;
using System.Linq.Expressions;

namespace CourtManagementBE.Domain.Common
{
    public interface IGenericRepository<T> where T : class
    {
        Task<T?> FindSingle(Expression<Func<T, bool>> predicate, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool disableTracking = true);

        Task<T?> FindFirst(Expression<Func<T, bool>> predicate, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool disableTracking = true);

        Task<T?> FindLast(Expression<Func<T, bool>> predicate, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool disableTracking = true);

        Task<List<T>> FindList(Expression<Func<T, bool>> predicate, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool disableTracking = true);
        Task<PageList<T>> FindAll(Expression<Func<T, bool>> predicate, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            bool disableTracking = true, PagingSpecification? pagingSpecification = null);

        Task<List<T>> FindListFromRawQuery(FormattableString rawQuery);

        Task Add(T entity);

        Task AddRange(List<T> entities);

        void Update(T entity);

        void UpdateRange(List<T> entities);

        void Remove(T entity);

        void RemoveRange(List<T> entities);

        Task RemoveWithPredicate(Expression<Func<T, bool>> predicate);

        Task UpdateWithPredicate(
            Expression<Func<T, bool>> predicate,
            Action<UpdateSettersBuilder<T>> setPropertyCalls);

        Task BulkInsert(List<T> entities);

        Task BulkUpdate(List<T> entities);

        Task BulkDelete(List<T> entities);
        Task<long> Count(Expression<Func<T, bool>> predicate);
    }
}
