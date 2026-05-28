using Microsoft.EntityFrameworkCore;
using CourtManagementBE.Infrastructure.Data;
using CourtManagementBE.Infrastructure.Common;
using System.Data;
using Microsoft.Data.SqlClient;
using CourtManagementBE.Domain.IRepositories;
using CourtManagementBE.Domain.Entities;
using CourtManagementBE.Infrastructure.Extensions.SqlExtentions;
using CourtManagementBE.Application.DTOs;

namespace CourtManagementBE.Infrastructure.Repositories;

public class CourtRepository : GenericRepository<Courts>, ICourtRepository
{
    private readonly AppDbContext _ctx;

    public CourtRepository(AppDbContext ctx) : base(ctx)
    {
        _ctx = ctx;
    }

    public async Task<List<CourtSlotAvailabilityResponse>> GetSlotAvailabilityAsync(int courtId, DateTime targetDate)
    {
        var ls = new List<CourtSlotAvailabilityResponse>();
        DataTable dt = new();
        using (var command = _ctx.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "dbo.sp_GetCourtSlotAvailability";
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@CourtID", courtId));
            command.Parameters.Add(new SqlParameter("@TargetDate", targetDate.Date));

            await _ctx.Database.OpenConnectionAsync();
            using var result = await command.ExecuteReaderAsync();
            dt.Load(result);
            ls = ISqlExtensions.ConvertDataTable<CourtSlotAvailabilityResponse>(dt);
        }
        return ls;
    }

    public async Task<List<CourtTimelineAvailabilityResponse>> GetTimelineAvailabilityAsync(int facilityId, DateTime targetDate)
    {
        string jsonResult = string.Empty;
        using (var command = _ctx.Database.GetDbConnection().CreateCommand())
        {
            command.CommandText = "dbo.sp_GetAllCourtsSlotAvailability";
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.Add(new SqlParameter("@FacilityID", facilityId));
            command.Parameters.Add(new SqlParameter("@TargetDate", targetDate.Date));

            await _ctx.Database.OpenConnectionAsync();
            using var result = await command.ExecuteReaderAsync();
            if (await result.ReadAsync())
            {
                jsonResult = result.IsDBNull(0) ? string.Empty : result.GetString(0);
            }
        }

        if (string.IsNullOrWhiteSpace(jsonResult))
            return new List<CourtTimelineAvailabilityResponse>();

        var options = new System.Text.Json.JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        return System.Text.Json.JsonSerializer.Deserialize<List<CourtTimelineAvailabilityResponse>>(jsonResult, options)
               ?? new List<CourtTimelineAvailabilityResponse>();
    }
}
