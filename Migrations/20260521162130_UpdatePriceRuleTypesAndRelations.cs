using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePriceRuleTypesAndRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsLoadDefault",
                table: "PriceRuleTypes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsMapping",
                table: "PriceRuleTypes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddForeignKey(
                name: "FK_CourtDefaultPriceRules_PriceRuleTypes_PriceRuleTypeID",
                table: "CourtDefaultPriceRules",
                column: "PriceRuleTypeID",
                principalTable: "PriceRuleTypes",
                principalColumn: "PriceRuleTypeID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourtDefaultPriceRules_PriceRuleTypes_PriceRuleTypeID",
                table: "CourtDefaultPriceRules");

            migrationBuilder.DropColumn(
                name: "IsLoadDefault",
                table: "PriceRuleTypes");

            migrationBuilder.DropColumn(
                name: "IsMapping",
                table: "PriceRuleTypes");
        }
    }
}
