using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingCombosJoinTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Combos_ComboID",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_ComboID",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ComboID",
                table: "Bookings");

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

            migrationBuilder.CreateTable(
                name: "BookingCombos",
                columns: table => new
                {
                    BookingComboID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ComboID = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModifiedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BookingsBookingID = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingCombos", x => x.BookingComboID);
                    table.ForeignKey(
                        name: "FK_BookingCombos_Bookings_BookingsBookingID",
                        column: x => x.BookingsBookingID,
                        principalTable: "Bookings",
                        principalColumn: "BookingID");
                });

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookingServices_Bookings_BookingsBookingID",
                table: "BookingServices");

            migrationBuilder.DropForeignKey(
                name: "FK_BookingSlots_Bookings_BookingsBookingID",
                table: "BookingSlots");

            migrationBuilder.DropTable(
                name: "BookingCombos");

            migrationBuilder.DropIndex(
                name: "IX_BookingSlots_BookingsBookingID",
                table: "BookingSlots");

            migrationBuilder.DropIndex(
                name: "IX_BookingServices_BookingsBookingID",
                table: "BookingServices");

            migrationBuilder.DropColumn(
                name: "BookingsBookingID",
                table: "BookingSlots");

            migrationBuilder.DropColumn(
                name: "BookingsBookingID",
                table: "BookingServices");

            migrationBuilder.AddColumn<int>(
                name: "ComboID",
                table: "Bookings",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ComboID",
                table: "Bookings",
                column: "ComboID");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Combos_ComboID",
                table: "Bookings",
                column: "ComboID",
                principalTable: "Combos",
                principalColumn: "ComboID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
