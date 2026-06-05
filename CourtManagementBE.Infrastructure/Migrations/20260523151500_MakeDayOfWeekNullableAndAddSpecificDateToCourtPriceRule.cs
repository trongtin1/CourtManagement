using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class MakeDayOfWeekNullableAndAddSpecificDateToCourtPriceRule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "DayOfWeek",
                table: "CourtPriceRules",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<DateTime>(
                name: "SpecificDate",
                table: "CourtPriceRules",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "DayOfWeek",
                table: "CourtPriceRuleHistories",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<DateTime>(
                name: "SpecificDate",
                table: "CourtPriceRuleHistories",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SpecificDate",
                table: "CourtPriceRules");

            migrationBuilder.DropColumn(
                name: "SpecificDate",
                table: "CourtPriceRuleHistories");

            migrationBuilder.AlterColumn<int>(
                name: "DayOfWeek",
                table: "CourtPriceRules",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "DayOfWeek",
                table: "CourtPriceRuleHistories",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
