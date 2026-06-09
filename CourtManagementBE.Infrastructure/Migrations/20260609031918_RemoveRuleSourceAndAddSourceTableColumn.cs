using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class RemoveRuleSourceAndAddSourceTableColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountingRuleSources");

            migrationBuilder.AddColumn<string>(
                name: "SourceTable",
                table: "AccountingRules",
                type: "varchar(100)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SourceTable",
                table: "AccountingRules");

            migrationBuilder.CreateTable(
                name: "AccountingRuleSources",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(50)", nullable: false),
                    RuleId = table.Column<string>(type: "varchar(50)", nullable: false),
                    SourceTable = table.Column<string>(type: "varchar(100)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountingRuleSources", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccountingRuleSources_RuleId",
                table: "AccountingRuleSources",
                column: "RuleId");
        }
    }
}
