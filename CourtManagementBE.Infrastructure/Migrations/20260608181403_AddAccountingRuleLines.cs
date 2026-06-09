using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountingRuleLines : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountingRuleSources");

            migrationBuilder.DropColumn(
                name: "CreditAccount",
                table: "AccountingRules");

            migrationBuilder.DropColumn(
                name: "DebitAccount",
                table: "AccountingRules");

            migrationBuilder.DropColumn(
                name: "OriginalSource",
                table: "AccountingRules");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "AccountingRuleConditions");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "AccountingRuleConditions");

            migrationBuilder.DropColumn(
                name: "SourceTable",
                table: "AccountingRuleConditions");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "AccountingRules",
                type: "nvarchar(500)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "AccountingRules",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "AccountingRules",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RuleName",
                table: "AccountingRules",
                type: "nvarchar(200)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "LogicalGroup",
                table: "AccountingRuleConditions",
                type: "varchar(20)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "AccountingRuleConditions",
                type: "int",
                nullable: false,
                defaultValue: 0);

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

            migrationBuilder.CreateTable(
                name: "AccountingRuleLines",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(50)", nullable: false),
                    RuleId = table.Column<string>(type: "varchar(50)", nullable: false),
                    AccountCode = table.Column<string>(type: "varchar(50)", nullable: false),
                    EntryType = table.Column<string>(type: "varchar(20)", nullable: false),
                    ValueSource = table.Column<string>(type: "varchar(100)", nullable: false),
                    DescriptionTemplate = table.Column<string>(type: "nvarchar(500)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountingRuleLines", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccountingRuleLines_RuleId",
                table: "AccountingRuleLines",
                column: "RuleId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingRuleSources_RuleId",
                table: "AccountingRuleSources",
                column: "RuleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountingRuleLines");

            migrationBuilder.DropTable(
                name: "AccountingRuleSources");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "AccountingRules");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "AccountingRules");

            migrationBuilder.DropColumn(
                name: "RuleName",
                table: "AccountingRules");

            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "AccountingRuleConditions");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "AccountingRules",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)");

            migrationBuilder.AddColumn<string>(
                name: "CreditAccount",
                table: "AccountingRules",
                type: "varchar(50)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DebitAccount",
                table: "AccountingRules",
                type: "varchar(50)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OriginalSource",
                table: "AccountingRules",
                type: "varchar(100)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "LogicalGroup",
                table: "AccountingRuleConditions",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(20)");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "AccountingRuleConditions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "AccountingRuleConditions",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SourceTable",
                table: "AccountingRuleConditions",
                type: "varchar(100)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "AccountingRuleSources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RuleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SourceTable = table.Column<string>(type: "varchar(100)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(100)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
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
