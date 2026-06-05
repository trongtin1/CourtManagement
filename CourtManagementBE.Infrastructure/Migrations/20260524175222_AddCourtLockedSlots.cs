using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddCourtLockedSlots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CourtLockedSlots",
                columns: table => new
                {
                    CourtLockedSlotID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourtID = table.Column<int>(type: "int", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: true),
                    SpecificDate = table.Column<DateTime>(type: "date", nullable: true),
                    StartTime = table.Column<TimeSpan>(type: "time(7)", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "time(7)", nullable: false),
                    IsWeekly = table.Column<bool>(type: "bit", nullable: false),
                    IsAllDay = table.Column<bool>(type: "bit", nullable: false),
                    LockReason = table.Column<string>(type: "nvarchar(500)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(100)", nullable: false),
                    UpdatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(100)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourtLockedSlots", x => x.CourtLockedSlotID);
                    table.CheckConstraint("CK_CourtLockedSlots_DateMode", "([IsWeekly] = 1 AND [DayOfWeek] IS NOT NULL AND [SpecificDate] IS NULL) OR ([IsWeekly] = 0 AND [SpecificDate] IS NOT NULL AND [DayOfWeek] IS NULL)");
                    table.CheckConstraint("CK_CourtLockedSlots_DayOfWeek", "[DayOfWeek] IS NULL OR ([DayOfWeek] >= 0 AND [DayOfWeek] <= 6)");
                    table.CheckConstraint("CK_CourtLockedSlots_TimeRange", "[StartTime] < [EndTime]");
                    table.ForeignKey(
                        name: "FK_CourtLockedSlots_Courts_CourtID",
                        column: x => x.CourtID,
                        principalTable: "Courts",
                        principalColumn: "CourtID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourtLockedSlots_CourtID_IsWeekly_DayOfWeek_SpecificDate_StartTime_EndTime",
                table: "CourtLockedSlots",
                columns: new[] { "CourtID", "IsWeekly", "DayOfWeek", "SpecificDate", "StartTime", "EndTime" });

            migrationBuilder.CreateIndex(
                name: "IX_CourtLockedSlots_IsActive",
                table: "CourtLockedSlots",
                column: "IsActive");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourtLockedSlots");
        }
    }
}
