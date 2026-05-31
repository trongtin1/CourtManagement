using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingStatusesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Bookings",
                type: "varchar(50)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(20)");

            migrationBuilder.CreateTable(
                name: "BookingStatuses",
                columns: table => new
                {
                    BookingStatusID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "varchar(50)", nullable: false),
                    StatusName = table.Column<string>(type: "varchar(100)", nullable: false),
                    LabelName = table.Column<string>(type: "nvarchar(200)", nullable: false),
                    IsTerminal = table.Column<bool>(type: "bit", nullable: false),
                    CanReschedule = table.Column<bool>(type: "bit", nullable: false),
                    ColorCode = table.Column<string>(type: "varchar(20)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingStatuses", x => x.BookingStatusID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookingStatuses_Code",
                table: "BookingStatuses",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookingStatuses");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Bookings",
                type: "varchar(20)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(50)");
        }
    }
}
