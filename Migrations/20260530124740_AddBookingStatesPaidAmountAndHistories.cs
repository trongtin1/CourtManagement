using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingStatesPaidAmountAndHistories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PaidAmount",
                table: "Bookings",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "BookingHistories",
                columns: table => new
                {
                    BookingHistoryID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<string>(type: "varchar(50)", nullable: false),
                    OldValue = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NewValue = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", nullable: false),
                    PerformedBy = table.Column<string>(type: "varchar(100)", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingHistories", x => x.BookingHistoryID);
                    table.ForeignKey(
                        name: "FK_BookingHistories_Bookings_BookingID",
                        column: x => x.BookingID,
                        principalTable: "Bookings",
                        principalColumn: "BookingID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookingHistories_BookingID",
                table: "BookingHistories",
                column: "BookingID");

            migrationBuilder.CreateIndex(
                name: "IX_BookingHistories_CreatedAt",
                table: "BookingHistories",
                column: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookingHistories");

            migrationBuilder.DropColumn(
                name: "PaidAmount",
                table: "Bookings");
        }
    }
}
