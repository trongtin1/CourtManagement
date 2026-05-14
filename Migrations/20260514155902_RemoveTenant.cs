using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTenant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropIndex(
                name: "IX_Services_TenantID_ServiceCode",
                table: "Services");

            migrationBuilder.DropIndex(
                name: "IX_Customers_TenantID_Phone",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_TenantID_BookingDate",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "TenantID",
                table: "TimeSlots");

            migrationBuilder.DropColumn(
                name: "TenantID",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "TenantID",
                table: "Facilities");

            migrationBuilder.DropColumn(
                name: "TenantID",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "TenantID",
                table: "Bookings");

            migrationBuilder.CreateIndex(
                name: "IX_Services_ServiceCode",
                table: "Services",
                column: "ServiceCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_Phone",
                table: "Customers",
                column: "Phone");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_BookingDate",
                table: "Bookings",
                column: "BookingDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Services_ServiceCode",
                table: "Services");

            migrationBuilder.DropIndex(
                name: "IX_Customers_Phone",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_BookingDate",
                table: "Bookings");

            migrationBuilder.AddColumn<int>(
                name: "TenantID",
                table: "TimeSlots",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TenantID",
                table: "Services",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TenantID",
                table: "Facilities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TenantID",
                table: "Customers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TenantID",
                table: "Bookings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    TenantID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Domain = table.Column<string>(type: "varchar(100)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    TenantName = table.Column<string>(type: "nvarchar(200)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.TenantID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Services_TenantID_ServiceCode",
                table: "Services",
                columns: new[] { "TenantID", "ServiceCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantID_Phone",
                table: "Customers",
                columns: new[] { "TenantID", "Phone" });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_TenantID_BookingDate",
                table: "Bookings",
                columns: new[] { "TenantID", "BookingDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Domain",
                table: "Tenants",
                column: "Domain",
                unique: true);
        }
    }
}
