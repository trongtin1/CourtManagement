using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Domain.IRepositories;
using CourtManagementBE.Infrastructure.Common;
using CourtManagementBE.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Microsoft.Data.SqlClient;

namespace CourtManagementBE.Infrastructure.Repositories;

public class BookingGroupRepository : GenericRepository<BookingGroups>, IBookingGroupRepository
{
    private readonly AppDbContext _ctx;
    public BookingGroupRepository(AppDbContext ctx) : base(ctx)
    {
        _ctx = ctx;
    }

    public async Task<string?> CreateRecurringBookingGroupAsync(
        int customerId, int facilityId, int courtId, DateTime startDate, DateTime endDate,
        TimeSpan startTime, TimeSpan endTime, string daysOfWeek, string createdBy, string note)
    {
        using (var command = _ctx.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "dbo.sp_CreateRecurringBookingGroup";
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add(new SqlParameter("@CustomerID", customerId));
            command.Parameters.Add(new SqlParameter("@FacilityID", facilityId));
            command.Parameters.Add(new SqlParameter("@CourtID", courtId));
            command.Parameters.Add(new SqlParameter("@StartDate", startDate.Date));
            command.Parameters.Add(new SqlParameter("@EndDate", endDate.Date));
            command.Parameters.Add(new SqlParameter("@StartTime", startTime));
            command.Parameters.Add(new SqlParameter("@EndTime", endTime));
            command.Parameters.Add(new SqlParameter("@DaysOfWeek", daysOfWeek));
            command.Parameters.Add(new SqlParameter("@CreatedBy", createdBy));
            command.Parameters.Add(new SqlParameter("@Note", note ?? (object)DBNull.Value));

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
