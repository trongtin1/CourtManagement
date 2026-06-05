using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddCourtFeatureMappingNavigationRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_CourtFeatureMappings_CourtFeatureID",
                table: "CourtFeatureMappings",
                column: "CourtFeatureID");

            migrationBuilder.AddForeignKey(
                name: "FK_CourtFeatureMappings_CourtFeatures_CourtFeatureID",
                table: "CourtFeatureMappings",
                column: "CourtFeatureID",
                principalTable: "CourtFeatures",
                principalColumn: "CourtFeatureID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CourtFeatureMappings_Courts_CourtID",
                table: "CourtFeatureMappings",
                column: "CourtID",
                principalTable: "Courts",
                principalColumn: "CourtID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourtFeatureMappings_CourtFeatures_CourtFeatureID",
                table: "CourtFeatureMappings");

            migrationBuilder.DropForeignKey(
                name: "FK_CourtFeatureMappings_Courts_CourtID",
                table: "CourtFeatureMappings");

            migrationBuilder.DropIndex(
                name: "IX_CourtFeatureMappings_CourtFeatureID",
                table: "CourtFeatureMappings");
        }
    }
}
