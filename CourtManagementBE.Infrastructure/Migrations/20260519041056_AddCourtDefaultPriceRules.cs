using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddCourtDefaultPriceRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Label",
                table: "CourtPriceRules");

            migrationBuilder.DropColumn(
                name: "NewLabel",
                table: "CourtPriceRuleHistories");

            migrationBuilder.DropColumn(
                name: "OldLabel",
                table: "CourtPriceRuleHistories");

            migrationBuilder.CreateTable(
                name: "CourtDefaultPriceRules",
                columns: table => new
                {
                    CourtDefaultPriceRuleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PriceRuleTypeID = table.Column<int>(type: "int", nullable: true),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(100)", nullable: false),
                    UpdatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(100)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourtDefaultPriceRules", x => x.CourtDefaultPriceRuleID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourtDefaultPriceRules_DayOfWeek_StartTime_EndTime",
                table: "CourtDefaultPriceRules",
                columns: new[] { "DayOfWeek", "StartTime", "EndTime" });

            migrationBuilder.CreateIndex(
                name: "IX_CourtDefaultPriceRules_PriceRuleTypeID",
                table: "CourtDefaultPriceRules",
                column: "PriceRuleTypeID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourtDefaultPriceRules");

            migrationBuilder.AddColumn<string>(
                name: "Label",
                table: "CourtPriceRules",
                type: "nvarchar(100)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NewLabel",
                table: "CourtPriceRuleHistories",
                type: "nvarchar(100)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OldLabel",
                table: "CourtPriceRuleHistories",
                type: "nvarchar(100)",
                nullable: false,
                defaultValue: "");
        }
    }
}
