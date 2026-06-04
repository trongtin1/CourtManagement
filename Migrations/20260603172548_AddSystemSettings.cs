using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClosingTime",
                table: "Facilities");

            migrationBuilder.DropColumn(
                name: "OpeningTime",
                table: "Facilities");

            migrationBuilder.DropColumn(
                name: "SlotDurationMinutes",
                table: "Facilities");

            migrationBuilder.DropColumn(
                name: "Timezone",
                table: "Facilities");

            migrationBuilder.CreateTable(
                name: "SystemSettings",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SlotDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    OpeningTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    ClosingTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    Timezone = table.Column<string>(type: "varchar(50)", nullable: false, defaultValue: "Asia/Ho_Chi_Minh"),
                    EnableCancellationFee = table.Column<bool>(type: "bit", nullable: false),
                    CancellationFeePercent = table.Column<decimal>(type: "decimal(5,2)", nullable: false, defaultValue: 20.0m),
                    CancellationThresholdHours = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSettings", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SystemSettings");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "ClosingTime",
                table: "Facilities",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "OpeningTime",
                table: "Facilities",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<int>(
                name: "SlotDurationMinutes",
                table: "Facilities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Timezone",
                table: "Facilities",
                type: "varchar(50)",
                nullable: false,
                defaultValue: "Asia/Ho_Chi_Minh");
        }
    }
}
