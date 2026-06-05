using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class RemoveComboIDAndGroupNameFromBookingGroups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookingGroups_Combos_ComboID",
                table: "BookingGroups");

            migrationBuilder.DropIndex(
                name: "IX_BookingGroups_ComboID",
                table: "BookingGroups");

            migrationBuilder.DropColumn(
                name: "ComboID",
                table: "BookingGroups");

            migrationBuilder.DropColumn(
                name: "GroupName",
                table: "BookingGroups");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ComboID",
                table: "BookingGroups",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GroupName",
                table: "BookingGroups",
                type: "nvarchar(200)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_BookingGroups_ComboID",
                table: "BookingGroups",
                column: "ComboID");

            migrationBuilder.AddForeignKey(
                name: "FK_BookingGroups_Combos_ComboID",
                table: "BookingGroups",
                column: "ComboID",
                principalTable: "Combos",
                principalColumn: "ComboID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
