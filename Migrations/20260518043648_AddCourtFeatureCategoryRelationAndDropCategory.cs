using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddCourtFeatureCategoryRelationAndDropCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "CourtFeatures");

            migrationBuilder.CreateIndex(
                name: "IX_CourtFeatures_CourtFeatureCategoryID",
                table: "CourtFeatures",
                column: "CourtFeatureCategoryID");

            migrationBuilder.AddForeignKey(
                name: "FK_CourtFeatures_CourtFeatureCategories_CourtFeatureCategoryID",
                table: "CourtFeatures",
                column: "CourtFeatureCategoryID",
                principalTable: "CourtFeatureCategories",
                principalColumn: "CourtFeatureCategoryID",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourtFeatures_CourtFeatureCategories_CourtFeatureCategoryID",
                table: "CourtFeatures");

            migrationBuilder.DropIndex(
                name: "IX_CourtFeatures_CourtFeatureCategoryID",
                table: "CourtFeatures");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "CourtFeatures",
                type: "varchar(50)",
                nullable: false,
                defaultValue: "");
        }
    }
}
