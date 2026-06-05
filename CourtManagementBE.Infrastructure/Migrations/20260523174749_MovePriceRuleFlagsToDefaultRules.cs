using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class MovePriceRuleFlagsToDefaultRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsLoadDefault",
                table: "PriceRuleTypes");

            migrationBuilder.DropColumn(
                name: "IsMapping",
                table: "PriceRuleTypes");

            migrationBuilder.AddColumn<bool>(
                name: "IsLoadDefault",
                table: "CourtDefaultPriceRules",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsMapping",
                table: "CourtDefaultPriceRules",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsLoadDefault",
                table: "CourtDefaultPriceRules");

            migrationBuilder.DropColumn(
                name: "IsMapping",
                table: "CourtDefaultPriceRules");

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
        }
    }
}
