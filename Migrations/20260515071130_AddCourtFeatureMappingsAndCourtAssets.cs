using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddCourtFeatureMappingsAndCourtAssets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "CourtFeatures",
                type: "varchar(50)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "CourtAssets",
                columns: table => new
                {
                    CourtAssetID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourtID = table.Column<int>(type: "int", nullable: false),
                    AssetCode = table.Column<string>(type: "varchar(30)", nullable: false),
                    AssetName = table.Column<string>(type: "nvarchar(200)", nullable: false),
                    Category = table.Column<string>(type: "varchar(50)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    Condition = table.Column<string>(type: "varchar(30)", nullable: false),
                    PurchaseDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    PurchasePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LastMaintenanceDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    NextMaintenanceDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(500)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreateDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(100)", nullable: false),
                    ModifiedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ModifiedBy = table.Column<string>(type: "varchar(100)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourtAssets", x => x.CourtAssetID);
                });

            migrationBuilder.CreateTable(
                name: "CourtFeatureMappings",
                columns: table => new
                {
                    CourtFeatureMappingID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourtID = table.Column<int>(type: "int", nullable: false),
                    CourtFeatureID = table.Column<int>(type: "int", nullable: false),
                    CreateDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(100)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourtFeatureMappings", x => x.CourtFeatureMappingID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourtAssets_Category",
                table: "CourtAssets",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_CourtAssets_Condition",
                table: "CourtAssets",
                column: "Condition");

            migrationBuilder.CreateIndex(
                name: "IX_CourtAssets_CourtID_AssetCode",
                table: "CourtAssets",
                columns: new[] { "CourtID", "AssetCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourtFeatureMappings_CourtID_CourtFeatureID",
                table: "CourtFeatureMappings",
                columns: new[] { "CourtID", "CourtFeatureID" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CourtAssets");

            migrationBuilder.DropTable(
                name: "CourtFeatureMappings");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "CourtFeatures");
        }
    }
}
