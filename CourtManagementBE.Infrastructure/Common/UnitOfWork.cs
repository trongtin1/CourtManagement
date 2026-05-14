using CourtManagementBE.Domain.Common;
using CourtManagementBE.Domain.IRepositories;
using CourtManagementBE.Infrastructure.Data;
using CourtManagementBE.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;


namespace CourtManagementBE.Infrastructure.Common;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private IDbContextTransaction? _currentTransaction;
    private bool _disposed;
    private readonly ILogger<UnitOfWork> _logger;

    public UnitOfWork(AppDbContext context, ILogger<UnitOfWork> logger)
    {
        _context = context;
        _logger = logger;
    }

    public IAuthRepository IAuthRepository => new AuthRepository(_context);
    public IUserTokenRepository IUserTokenRepository => new UserTokenRepository(_context);
    public ITenantRepository ITenantRepository => new TenantRepository(_context);
    public IFacilityRepository IFacilityRepository => new FacilityRepository(_context);
    public IAreaRepository IAreaRepository => new AreaRepository(_context);
    public ICourtRepository ICourtRepository => new CourtRepository(_context);
    public ICourtTypeRepository ICourtTypeRepository => new CourtTypeRepository(_context);
    public ICourtStatusRepository ICourtStatusRepository => new CourtStatusRepository(_context);
    public ICourtFeatureRepository ICourtFeatureRepository => new CourtFeatureRepository(_context);
    public IUtilityRepository IUtilityRepository => new UtilityRepository(_context);
    public ITimeSlotRepository ITimeSlotRepository => new TimeSlotRepository(_context);
    public ICourtPriceRepository ICourtPriceRepository => new CourtPriceRepository(_context);
    public ICustomerRepository ICustomerRepository => new CustomerRepository(_context);
    public IBookingRepository IBookingRepository => new BookingRepository(_context);
    public IBookingSlotRepository IBookingSlotRepository => new BookingSlotRepository(_context);
    public IBookingServiceRepository IBookingServiceRepository => new BookingServiceRepository(_context);
    public IPaymentRepository IPaymentRepository => new PaymentRepository(_context);
    public IServiceRepository IServiceRepository => new ServiceRepository(_context);
    public IServicePriceRepository IServicePriceRepository => new ServicePriceRepository(_context);
    public ICourtAreaMappingRepository ICourtAreaMappingRepository => new CourtAreaMappingRepository(_context);
    public ICourtUtilityRepository ICourtUtilityRepository => new CourtUtilityRepository(_context);
    public ICourtPriceHistoryRepository ICourtPriceHistoryRepository => new CourtPriceHistoryRepository(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _currentTransaction ??= await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await _context.SaveChangesAsync(cancellationToken);

            if (_currentTransaction is not null)
            {
                await _currentTransaction.CommitAsync(cancellationToken);
            }
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            if (_currentTransaction is not null)
            {
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (_currentTransaction is not null)
            {
                await _currentTransaction.RollbackAsync(cancellationToken);
            }
        }
        finally
        {
            if (_currentTransaction is not null)
            {
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                _context.Dispose();
            }

            _disposed = true;
        }
    }
    public async Task ExecuteSqlRawAsync(string sql)
    {
        try
        {
            await _context.Database.ExecuteSqlRawAsync(sql);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing SQL raw: {Sql}", sql);
            throw;
        }
    }
}
