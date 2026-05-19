using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddCourtPriceRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourtPriceByTimeSlots");

            migrationBuilder.DropTable(
                name: "CourtPriceHistories");

            migrationBuilder.DropTable(
                name: "TimeSlots");

            migrationBuilder.DropIndex(
                name: "IX_BookingSlots_CourtID_BookingDate_TimeSlotID",
                table: "BookingSlots");

            migrationBuilder.DropColumn(
                name: "TimeSlotID",
                table: "BookingSlots");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EndTime",
                table: "BookingSlots",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "StartTime",
                table: "BookingSlots",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.CreateTable(
                name: "CourtPriceRuleHistories",
                columns: table => new
                {
                    CourtPriceRuleHistoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourtPriceRuleID = table.Column<int>(type: "int", nullable: false),
                    CourtID = table.Column<int>(type: "int", nullable: false),
                    OldPriceRuleTypeID = table.Column<int>(type: "int", nullable: true),
                    NewPriceRuleTypeID = table.Column<int>(type: "int", nullable: true),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    OldStartTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    OldEndTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    OldPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OldLabel = table.Column<string>(type: "nvarchar(100)", nullable: false),
                    NewStartTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    NewEndTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    NewPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NewLabel = table.Column<string>(type: "nvarchar(100)", nullable: false),
                    ChangeDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ChangedBy = table.Column<string>(type: "varchar(100)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourtPriceRuleHistories", x => x.CourtPriceRuleHistoryID);
                });

            migrationBuilder.CreateTable(
                name: "CourtPriceRules",
                columns: table => new
                {
                    CourtPriceRuleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourtID = table.Column<int>(type: "int", nullable: false),
                    PriceRuleTypeID = table.Column<int>(type: "int", nullable: true),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Label = table.Column<string>(type: "nvarchar(100)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(100)", nullable: false),
                    UpdatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(100)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourtPriceRules", x => x.CourtPriceRuleID);
                });

            migrationBuilder.CreateTable(
                name: "PriceRuleTypes",
                columns: table => new
                {
                    PriceRuleTypeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ColorCode = table.Column<string>(type: "varchar(10)", nullable: false),
                    Code = table.Column<string>(type: "varchar(50)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriceRuleTypes", x => x.PriceRuleTypeID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookingSlots_CourtID_BookingDate_StartTime_EndTime",
                table: "BookingSlots",
                columns: new[] { "CourtID", "BookingDate", "StartTime", "EndTime" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourtPriceRuleHistories_CourtID",
                table: "CourtPriceRuleHistories",
                column: "CourtID");

            migrationBuilder.CreateIndex(
                name: "IX_CourtPriceRuleHistories_CourtPriceRuleID",
                table: "CourtPriceRuleHistories",
                column: "CourtPriceRuleID");

            migrationBuilder.CreateIndex(
                name: "IX_CourtPriceRules_CourtID_DayOfWeek_StartTime_EndTime",
                table: "CourtPriceRules",
                columns: new[] { "CourtID", "DayOfWeek", "StartTime", "EndTime" });

            migrationBuilder.CreateIndex(
                name: "IX_CourtPriceRules_PriceRuleTypeID",
                table: "CourtPriceRules",
                column: "PriceRuleTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_PriceRuleTypes_Code",
                table: "PriceRuleTypes",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourtPriceRuleHistories");

            migrationBuilder.DropTable(
                name: "CourtPriceRules");

            migrationBuilder.DropTable(
                name: "PriceRuleTypes");

            migrationBuilder.DropIndex(
                name: "IX_BookingSlots_CourtID_BookingDate_StartTime_EndTime",
                table: "BookingSlots");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "BookingSlots");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "BookingSlots");

            migrationBuilder.AddColumn<int>(
                name: "TimeSlotID",
                table: "BookingSlots",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "CourtPriceByTimeSlots",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourtID = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TimeSlotID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourtPriceByTimeSlots", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "CourtPriceHistories",
                columns: table => new
                {
                    CourtPriceHistoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChangeDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ChangedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CourtID = table.Column<int>(type: "int", nullable: false),
                    CourtPriceByTimeSlotID = table.Column<int>(type: "int", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    NewPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OldPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TimeSlotID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourtPriceHistories", x => x.CourtPriceHistoryID);
                });

            migrationBuilder.CreateTable(
                name: "TimeSlots",
                columns: table => new
                {
                    TimeSlotID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    SlotName = table.Column<string>(type: "nvarchar(100)", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeSlots", x => x.TimeSlotID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookingSlots_CourtID_BookingDate_TimeSlotID",
                table: "BookingSlots",
                columns: new[] { "CourtID", "BookingDate", "TimeSlotID" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourtPriceByTimeSlots_CourtID_TimeSlotID_DayOfWeek",
                table: "CourtPriceByTimeSlots",
                columns: new[] { "CourtID", "TimeSlotID", "DayOfWeek" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourtPriceHistories_CourtPriceByTimeSlotID",
                table: "CourtPriceHistories",
                column: "CourtPriceByTimeSlotID");
        }
    }
}
