using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingConstraintsToSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BufferDurationMinutes",
                table: "SystemSettings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MaxBookingDurationMinutes",
                table: "SystemSettings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MinAllowableGapMinutes",
                table: "SystemSettings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MinBookingDurationMinutes",
                table: "SystemSettings",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BufferDurationMinutes",
                table: "SystemSettings");

            migrationBuilder.DropColumn(
                name: "MaxBookingDurationMinutes",
                table: "SystemSettings");

            migrationBuilder.DropColumn(
                name: "MinAllowableGapMinutes",
                table: "SystemSettings");

            migrationBuilder.DropColumn(
                name: "MinBookingDurationMinutes",
                table: "SystemSettings");
        }
    }
}
