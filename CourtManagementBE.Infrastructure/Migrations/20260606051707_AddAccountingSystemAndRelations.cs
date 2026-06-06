using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountingSystemAndRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BusinessPartnerId",
                table: "Customers",
                type: "varchar(50)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AccountingRuleConditions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(50)", nullable: false),
                    RuleId = table.Column<string>(type: "varchar(50)", nullable: false),
                    SourceTable = table.Column<string>(type: "varchar(100)", nullable: false),
                    FieldName = table.Column<string>(type: "varchar(100)", nullable: false),
                    Operator = table.Column<string>(type: "varchar(50)", nullable: false),
                    ExpectedValue = table.Column<string>(type: "nvarchar(200)", nullable: false),
                    LogicalGroup = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountingRuleConditions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AccountingRules",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(50)", nullable: false),
                    TransactionType = table.Column<string>(type: "varchar(100)", nullable: false),
                    DebitAccount = table.Column<string>(type: "varchar(50)", nullable: false),
                    CreditAccount = table.Column<string>(type: "varchar(50)", nullable: false),
                    OriginalSource = table.Column<string>(type: "varchar(100)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountingRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AccountingRuleSources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RuleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SourceTable = table.Column<string>(type: "varchar(100)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(100)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountingRuleSources", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AccountReceivables",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(50)", nullable: false),
                    PartnerId = table.Column<string>(type: "varchar(50)", nullable: false),
                    OriginalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaidAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OutstandingAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "varchar(50)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountReceivables", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BusinessPartners",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(50)", nullable: false),
                    PartnerCode = table.Column<string>(type: "varchar(50)", nullable: false),
                    PartnerName = table.Column<string>(type: "nvarchar(200)", nullable: false),
                    PartnerType = table.Column<string>(type: "varchar(50)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessPartners", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChartOfAccounts",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(50)", nullable: false),
                    AccountCode = table.Column<string>(type: "varchar(50)", nullable: false),
                    AccountName = table.Column<string>(type: "nvarchar(200)", nullable: false),
                    AccountType = table.Column<string>(type: "varchar(50)", nullable: false),
                    ParentAccountId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Level = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChartOfAccounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JournalEntries",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(50)", nullable: false),
                    VoucherNo = table.Column<string>(type: "varchar(50)", nullable: false),
                    EntryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DocumentType = table.Column<string>(type: "varchar(50)", nullable: false),
                    SourceTable = table.Column<string>(type: "varchar(100)", nullable: false),
                    SourceId = table.Column<string>(type: "varchar(100)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "varchar(50)", nullable: false, defaultValue: "Draft")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JournalEntries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JournalEntryLines",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(50)", nullable: false),
                    JournalEntryId = table.Column<string>(type: "varchar(50)", nullable: false),
                    AccountCode = table.Column<string>(type: "varchar(50)", nullable: false),
                    DebitAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreditAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PartnerId = table.Column<string>(type: "varchar(50)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JournalEntryLines", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Customers_BusinessPartnerId",
                table: "Customers",
                column: "BusinessPartnerId",
                unique: true,
                filter: "[BusinessPartnerId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingRuleConditions_RuleId",
                table: "AccountingRuleConditions",
                column: "RuleId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingRuleSources_RuleId",
                table: "AccountingRuleSources",
                column: "RuleId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountReceivables_PartnerId",
                table: "AccountReceivables",
                column: "PartnerId");

            migrationBuilder.CreateIndex(
                name: "IX_BusinessPartners_PartnerCode",
                table: "BusinessPartners",
                column: "PartnerCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChartOfAccounts_AccountCode",
                table: "ChartOfAccounts",
                column: "AccountCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_VoucherNo",
                table: "JournalEntries",
                column: "VoucherNo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_AccountCode",
                table: "JournalEntryLines",
                column: "AccountCode");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_JournalEntryId",
                table: "JournalEntryLines",
                column: "JournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_PartnerId",
                table: "JournalEntryLines",
                column: "PartnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_BusinessPartners_BusinessPartnerId",
                table: "Customers",
                column: "BusinessPartnerId",
                principalTable: "BusinessPartners",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_BusinessPartners_BusinessPartnerId",
                table: "Customers");

            migrationBuilder.DropTable(
                name: "AccountingRuleConditions");

            migrationBuilder.DropTable(
                name: "AccountingRules");

            migrationBuilder.DropTable(
                name: "AccountingRuleSources");

            migrationBuilder.DropTable(
                name: "AccountReceivables");

            migrationBuilder.DropTable(
                name: "BusinessPartners");

            migrationBuilder.DropTable(
                name: "ChartOfAccounts");

            migrationBuilder.DropTable(
                name: "JournalEntries");

            migrationBuilder.DropTable(
                name: "JournalEntryLines");

            migrationBuilder.DropIndex(
                name: "IX_Customers_BusinessPartnerId",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "BusinessPartnerId",
                table: "Customers");
        }
    }
}
