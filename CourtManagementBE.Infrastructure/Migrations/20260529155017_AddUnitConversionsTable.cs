using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddUnitConversionsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UnitConversions",
                columns: table => new
                {
                    UnitConversionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServiceID = table.Column<int>(type: "int", nullable: true),
                    SourceUnitID = table.Column<int>(type: "int", nullable: false),
                    TargetUnitID = table.Column<int>(type: "int", nullable: false),
                    Factor = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnitConversions", x => x.UnitConversionID);
                    table.ForeignKey(
                        name: "FK_UnitConversions_Services_ServiceID",
                        column: x => x.ServiceID,
                        principalTable: "Services",
                        principalColumn: "ServiceID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UnitConversions_Units_SourceUnitID",
                        column: x => x.SourceUnitID,
                        principalTable: "Units",
                        principalColumn: "UnitID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UnitConversions_Units_TargetUnitID",
                        column: x => x.TargetUnitID,
                        principalTable: "Units",
                        principalColumn: "UnitID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UnitConversions_ServiceID",
                table: "UnitConversions",
                column: "ServiceID");

            migrationBuilder.CreateIndex(
                name: "IX_UnitConversions_SourceUnitID",
                table: "UnitConversions",
                column: "SourceUnitID");

            migrationBuilder.CreateIndex(
                name: "IX_UnitConversions_TargetUnitID",
                table: "UnitConversions",
                column: "TargetUnitID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UnitConversions");
        }
    }
}
