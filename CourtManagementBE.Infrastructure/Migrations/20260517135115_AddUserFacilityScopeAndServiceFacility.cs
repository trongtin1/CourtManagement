using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddUserFacilityScopeAndServiceFacility : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Services_ServiceCode",
                table: "Services");

            migrationBuilder.AddColumn<int>(
                name: "FacilityID",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Users",
                type: "varchar(50)",
                nullable: false,
                defaultValue: "SuperAdmin");

            migrationBuilder.AddColumn<int>(
                name: "FacilityID",
                table: "Services",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_FacilityID",
                table: "Users",
                column: "FacilityID");

            migrationBuilder.CreateIndex(
                name: "IX_Services_FacilityID_ServiceCode",
                table: "Services",
                columns: new[] { "FacilityID", "ServiceCode" },
                unique: true,
                filter: "[FacilityID] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_FacilityID",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Services_FacilityID_ServiceCode",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "FacilityID",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FacilityID",
                table: "Services");

            migrationBuilder.CreateIndex(
                name: "IX_Services_ServiceCode",
                table: "Services",
                column: "ServiceCode",
                unique: true);
        }
    }
}
