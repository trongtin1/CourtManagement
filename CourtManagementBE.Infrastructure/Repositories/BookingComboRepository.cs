using Microsoft.EntityFrameworkCore;
using CourtManagementBE.Infrastructure.Data;
using CourtManagementBE.Infrastructure.Common;
using System.Data;
using Microsoft.Data.SqlClient;
using CourtManagementBE.Domain.IRepositories;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Application.DTOs;
using CourtManagementBE.Infrastructure.Extensions.SqlExtentions;

namespace CourtManagementBE.Infrastructure.Repositories;

public class BookingComboRepository : GenericRepository<BookingCombos>, IBookingComboRepository
{
    private readonly AppDbContext _ctx;

    public BookingComboRepository(AppDbContext ctx) : base(ctx)
    {
        _ctx = ctx;
    }

    public async Task<string?> BulkUpdateBookingCombosAsync(Guid bookingId, string modifiedBy, List<BookingComboBulkUpdateItemRequest> requests)
    {
        // 1. Build DataTable for TVP
        var table = requests.ToDataTable();

        // 2. Call Stored Procedure
        using (var command = _ctx.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "dbo.sp_BulkUpdateBookingCombos";
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.Add(new SqlParameter("@BookingID", bookingId));
            command.Parameters.Add(new SqlParameter("@ModifiedBy", modifiedBy));

            var requestsParam = new SqlParameter("@Requests", SqlDbType.Structured)
            {
                TypeName = "dbo.BookingComboBulkUpdateType",
                Value = table
            };
            command.Parameters.Add(requestsParam);

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
                throw new Exception("Lỗi hệ thống khi cập nhật combo booking.", ex);
            }
        }
    }
}
