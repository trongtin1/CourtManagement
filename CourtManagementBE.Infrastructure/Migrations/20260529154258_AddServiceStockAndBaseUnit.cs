using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceStockAndBaseUnit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsTrackStock",
                table: "Services",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "StockQuantity",
                table: "Services",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Services_UnitID",
                table: "Services",
                column: "UnitID");

            migrationBuilder.CreateIndex(
                name: "IX_CourtAssets_UnitID",
                table: "CourtAssets",
                column: "UnitID");

            migrationBuilder.AddForeignKey(
                name: "FK_CourtAssets_Units_UnitID",
                table: "CourtAssets",
                column: "UnitID",
                principalTable: "Units",
                principalColumn: "UnitID",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Services_Units_UnitID",
                table: "Services",
                column: "UnitID",
                principalTable: "Units",
                principalColumn: "UnitID",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourtAssets_Units_UnitID",
                table: "CourtAssets");

            migrationBuilder.DropForeignKey(
                name: "FK_Services_Units_UnitID",
                table: "Services");

            migrationBuilder.DropIndex(
                name: "IX_Services_UnitID",
                table: "Services");

            migrationBuilder.DropIndex(
                name: "IX_CourtAssets_UnitID",
                table: "CourtAssets");

            migrationBuilder.DropColumn(
                name: "IsTrackStock",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "StockQuantity",
                table: "Services");
        }
    }
}
