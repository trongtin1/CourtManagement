using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.IRepositories;
using CourtManagementBE.Infrastructure.Common;
using CourtManagementBE.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Microsoft.Data.SqlClient;

namespace CourtManagementBE.Infrastructure.Repositories;

public class BookingRepository : GenericRepository<Bookings>, IBookingRepository
{
    private readonly AppDbContext _ctx;
    public BookingRepository(AppDbContext ctx) : base(ctx)
    {
        _ctx = ctx;
    }

    public async Task<string?> CancelBookingAsync(
        Guid bookingId,
        string cancellationReason,
        decimal refundAmount,
        decimal penaltyAmount,
        string refundNote,
        string penaltyNote,
        string performedBy,
        string historyNote)
    {
        using (var command = _ctx.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "dbo.sp_CancelBooking";
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add(new SqlParameter("@BookingID", bookingId));
            command.Parameters.Add(new SqlParameter("@CancellationReason", cancellationReason ?? (object)DBNull.Value));
            command.Parameters.Add(new SqlParameter("@RefundAmount", refundAmount));
            command.Parameters.Add(new SqlParameter("@PenaltyAmount", penaltyAmount));
            command.Parameters.Add(new SqlParameter("@RefundNote", refundNote ?? (object)DBNull.Value));
            command.Parameters.Add(new SqlParameter("@PenaltyNote", penaltyNote ?? (object)DBNull.Value));
            command.Parameters.Add(new SqlParameter("@PerformedBy", performedBy ?? (object)DBNull.Value));
            command.Parameters.Add(new SqlParameter("@HistoryNote", historyNote ?? (object)DBNull.Value));

            var errorMessageParam = new SqlParameter("@ErrorMessage", SqlDbType.NVarChar, -1) { Direction = ParameterDirection.Output };
            command.Parameters.Add(errorMessageParam);

            try
            {
                await _ctx.Database.OpenConnectionAsync();
                await command.ExecuteNonQueryAsync();

                return errorMessageParam.Value != DBNull.Value ? (string)errorMessageParam.Value : null;
            }
            catch (SqlException ex)
            {
                return ex.Message;
            }
        }
    }
}