
using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.Models;
using CourtManagementBE.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using System.Linq.Expressions;
using System.Transactions;

namespace CourtManagementBE.Infrastructure.Common;

public class GenericRepository<T> : IGenericRepository<T> where T : class
{
    private readonly AppDbContext _context;

    public GenericRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task Add(T entity)
    {
        await _context.AddAsync(entity);
    }

    public async Task AddRange(List<T> entities)
    {
        await _context.Set<T>().AddRangeAsync(entities);
    }

    private IQueryable<T> FindAll(Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        bool disableTracking = true, PagingSpecification? pagingSpecification = null, bool splitQuery = false)
    {
        IQueryable<T> items = _context.Set<T>();
        if (include != null)
        {
            items = include(items);
        }

        if (splitQuery)
        {
            items = items.AsSplitQuery();
        }

        if (disableTracking == true)
        {
            items = items.AsNoTracking();
        }

        if (orderBy != null)
        {
            items = orderBy(items);
        }

        if (pagingSpecification != null)
        {
            items = items.Skip(pagingSpecification.Skip).Take(pagingSpecification.Take);
        }

        return items;
    }

    public async Task<PageList<T>> FindAll(
        Expression<Func<T, bool>> predicate,
        Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null,
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        bool disableTracking = true,
        PagingSpecification? pagingSpecification = null,
        bool splitQuery = false)
    {
        IQueryable<T> query = _context.Set<T>();

        if (include != null)
            query = include(query);

        if (splitQuery)
            query = query.AsSplitQuery();

        if (predicate != null)
            query = query.Where(predicate);

        if (disableTracking)
            query = query.AsNoTracking();

        var totalCount = await query.CountAsync();

        if (orderBy != null)
            query = orderBy(query);

        int page = 1;
        int pageSize = totalCount;

        if (pagingSpecification != null)
        {
            page = pagingSpecification.Page;
            pageSize = pagingSpecification.PageSize;

            query = query
                .Skip(pagingSpecification.Skip)
                .Take(pagingSpecification.Take);
        }

        var items = await query.ToListAsync();

        return new PageList<T>(items, totalCount, page, pageSize);
    }

    public async Task<T?> FindSingle(Expression<Func<T, bool>> predicate, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool disableTracking = true, bool splitQuery = false)
    {
        T? res = default;
        using (var scope = CreateTransaction())
        {
            res = await FindAll(include, orderBy, disableTracking, splitQuery: splitQuery).SingleOrDefaultAsync(predicate);
            scope.Complete();
        }
        return res;
    }

    public async Task<T?> FindFirst(Expression<Func<T, bool>> predicate, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool disableTracking = true, bool splitQuery = false)
    {
        T? res = default;
        using (var scope = CreateTransaction())
        {
            res = await FindAll(include, orderBy, disableTracking, splitQuery: splitQuery).FirstOrDefaultAsync(predicate);
            scope.Complete();
        }
        return res;
    }

    public async Task<T?> FindLast(Expression<Func<T, bool>> predicate, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool disableTracking = true, bool splitQuery = false)
    {
        T? res = default;
        using (var scope = CreateTransaction())
        {
            res = await FindAll(include, orderBy, disableTracking, splitQuery: splitQuery).LastOrDefaultAsync(predicate);
            scope.Complete();
        }
        return res;
    }

    public void Remove(T entity)
    {
        _context.Set<T>().Remove(entity);
    }

    public void RemoveRange(List<T> entities)
    {
        _context.Set<T>().RemoveRange(entities);
    }

    public void Update(T entity)
    {
        _context.Update(entity);
    }

    public void UpdateRange(List<T> entities)
    {
        _context.Set<T>().UpdateRange(entities);
    }

    public async Task<List<T>> FindList(Expression<Func<T, bool>> predicate, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool disableTracking = true, bool splitQuery = false)
    {
        List<T> res = [];
        using (var scope = CreateTransaction())
        {
            res = await FindAll(include, orderBy, disableTracking, splitQuery: splitQuery).Where(predicate).ToListAsync();
            scope.Complete();
        }
        return res;
    }

    public async Task RemoveWithPredicate(Expression<Func<T, bool>> predicate)
    {
        await _context.Set<T>().Where(predicate).ExecuteDeleteAsync();
    }

    public async Task UpdateWithPredicate(
      Expression<Func<T, bool>> predicate,
      Action<UpdateSettersBuilder<T>> setPropertyCalls)
    {
        await _context.Set<T>()
            .Where(predicate)
            .ExecuteUpdateAsync(setPropertyCalls);
    }

    private static TransactionScope CreateTransaction()
    {
        return new TransactionScope(TransactionScopeOption.Required,
                                    new TransactionOptions()
                                    {
                                        IsolationLevel = IsolationLevel.ReadUncommitted
                                    },
                                   TransactionScopeAsyncFlowOption.Enabled);
    }

    public async Task BulkInsert(List<T> entities)
    {
        await _context.Set<T>().AddRangeAsync(entities);
        await _context.SaveChangesAsync();
    }

    public async Task BulkUpdate(List<T> entities)
    {
        _context.Set<T>().UpdateRange(entities);
        await _context.SaveChangesAsync();
    }

    public async Task BulkDelete(List<T> entities)
    {
        _context.Set<T>().RemoveRange(entities);
        await _context.SaveChangesAsync();
    }

    public async Task<List<T>> FindListFromRawQuery(FormattableString rawQuery)
    {
        List<T> res = [];
        using (var scope = CreateTransaction())
        {
            res = await _context.Set<T>().FromSql(rawQuery)
                            .AsNoTracking()
                            .ToListAsync();

            scope.Complete();
        }
        return res;
    }

    public async Task<long> Count(Expression<Func<T, bool>> predicate)
    {
        long res = 0;
        using (var scope = CreateTransaction())
        {
            res = await _context.Set<T>().CountAsync(predicate);
            scope.Complete();
        }
        return res;
    }
}
