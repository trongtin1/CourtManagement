using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class RemoveStringServiceTypeAndAddNavigation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ServiceType",
                table: "Services");

            migrationBuilder.CreateIndex(
                name: "IX_Services_ServiceTypeID",
                table: "Services",
                column: "ServiceTypeID");

            migrationBuilder.AddForeignKey(
                name: "FK_Services_ServiceTypes_ServiceTypeID",
                table: "Services",
                column: "ServiceTypeID",
                principalTable: "ServiceTypes",
                principalColumn: "ServiceTypeID",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Services_ServiceTypes_ServiceTypeID",
                table: "Services");

            migrationBuilder.DropIndex(
                name: "IX_Services_ServiceTypeID",
                table: "Services");

            migrationBuilder.AddColumn<string>(
                name: "ServiceType",
                table: "Services",
                type: "varchar(50)",
                nullable: false,
                defaultValue: "");
        }
    }
}
