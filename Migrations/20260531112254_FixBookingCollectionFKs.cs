using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class FixBookingCollectionFKs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookingCombos_Bookings_BookingsBookingID",
                table: "BookingCombos");

            migrationBuilder.DropForeignKey(
                name: "FK_BookingServices_Bookings_BookingsBookingID",
                table: "BookingServices");

            migrationBuilder.DropForeignKey(
                name: "FK_BookingSlots_Bookings_BookingsBookingID",
                table: "BookingSlots");

            migrationBuilder.DropIndex(
                name: "IX_BookingSlots_BookingsBookingID",
                table: "BookingSlots");

            migrationBuilder.DropIndex(
                name: "IX_BookingServices_BookingsBookingID",
                table: "BookingServices");

            migrationBuilder.DropIndex(
                name: "IX_BookingCombos_BookingsBookingID",
                table: "BookingCombos");

            migrationBuilder.DropColumn(
                name: "BookingsBookingID",
                table: "BookingSlots");

            migrationBuilder.DropColumn(
                name: "BookingsBookingID",
                table: "BookingServices");

            migrationBuilder.DropColumn(
                name: "BookingsBookingID",
                table: "BookingCombos");

            migrationBuilder.CreateIndex(
                name: "IX_BookingSlots_BookingID",
                table: "BookingSlots",
                column: "BookingID");

            migrationBuilder.CreateIndex(
                name: "IX_BookingServices_BookingID",
                table: "BookingServices",
                column: "BookingID");

            migrationBuilder.CreateIndex(
                name: "IX_BookingCombos_BookingID",
                table: "BookingCombos",
                column: "BookingID");

            migrationBuilder.AddForeignKey(
                name: "FK_BookingCombos_Bookings_BookingID",
                table: "BookingCombos",
                column: "BookingID",
                principalTable: "Bookings",
                principalColumn: "BookingID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BookingServices_Bookings_BookingID",
                table: "BookingServices",
                column: "BookingID",
                principalTable: "Bookings",
                principalColumn: "BookingID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BookingSlots_Bookings_BookingID",
                table: "BookingSlots",
                column: "BookingID",
                principalTable: "Bookings",
                principalColumn: "BookingID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookingCombos_Bookings_BookingID",
                table: "BookingCombos");

            migrationBuilder.DropForeignKey(
                name: "FK_BookingServices_Bookings_BookingID",
                table: "BookingServices");

            migrationBuilder.DropForeignKey(
                name: "FK_BookingSlots_Bookings_BookingID",
                table: "BookingSlots");

            migrationBuilder.DropIndex(
                name: "IX_BookingSlots_BookingID",
                table: "BookingSlots");

            migrationBuilder.DropIndex(
                name: "IX_BookingServices_BookingID",
                table: "BookingServices");

            migrationBuilder.DropIndex(
                name: "IX_BookingCombos_BookingID",
                table: "BookingCombos");

            migrationBuilder.AddColumn<Guid>(
                name: "BookingsBookingID",
                table: "BookingSlots",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "BookingsBookingID",
                table: "BookingServices",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "BookingsBookingID",
                table: "BookingCombos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BookingSlots_BookingsBookingID",
                table: "BookingSlots",
                column: "BookingsBookingID");

            migrationBuilder.CreateIndex(
                name: "IX_BookingServices_BookingsBookingID",
                table: "BookingServices",
                column: "BookingsBookingID");

            migrationBuilder.CreateIndex(
                name: "IX_BookingCombos_BookingsBookingID",
                table: "BookingCombos",
                column: "BookingsBookingID");

            migrationBuilder.AddForeignKey(
                name: "FK_BookingCombos_Bookings_BookingsBookingID",
                table: "BookingCombos",
                column: "BookingsBookingID",
                principalTable: "Bookings",
                principalColumn: "BookingID");

            migrationBuilder.AddForeignKey(
                name: "FK_BookingServices_Bookings_BookingsBookingID",
                table: "BookingServices",
                column: "BookingsBookingID",
                principalTable: "Bookings",
                principalColumn: "BookingID");

            migrationBuilder.AddForeignKey(
                name: "FK_BookingSlots_Bookings_BookingsBookingID",
                table: "BookingSlots",
                column: "BookingsBookingID",
                principalTable: "Bookings",
                principalColumn: "BookingID");
        }
    }
}
