using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingGroupsAndEnumStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookingStatuses");

            migrationBuilder.RenameColumn(
                name: "BookingStatusID",
                table: "Bookings",
                newName: "BookingGroupID");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EndTime",
                table: "Bookings",
                type: "time(7)",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "StartTime",
                table: "Bookings",
                type: "time(7)",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.CreateTable(
                name: "BookingGroups",
                columns: table => new
                {
                    BookingGroupID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupType = table.Column<string>(type: "varchar(30)", nullable: false),
                    CustomerID = table.Column<int>(type: "int", nullable: true),
                    FacilityID = table.Column<int>(type: "int", nullable: true),
                    ComboID = table.Column<int>(type: "int", nullable: true),
                    GroupName = table.Column<string>(type: "nvarchar(200)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaidAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "varchar(20)", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", nullable: false),
                    CreatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(100)", nullable: false),
                    ModifiedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ModifiedBy = table.Column<string>(type: "varchar(100)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingGroups", x => x.BookingGroupID);
                    table.ForeignKey(
                        name: "FK_BookingGroups_Combos_ComboID",
                        column: x => x.ComboID,
                        principalTable: "Combos",
                        principalColumn: "ComboID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BookingGroups_Customers_CustomerID",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BookingGroups_Facilities_FacilityID",
                        column: x => x.FacilityID,
                        principalTable: "Facilities",
                        principalColumn: "FacilityID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RecurringConfigs",
                columns: table => new
                {
                    BookingGroupID = table.Column<int>(type: "int", nullable: false),
                    CourtID = table.Column<int>(type: "int", nullable: false),
                    DaysOfWeek = table.Column<string>(type: "varchar(20)", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time(7)", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "time(7)", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringConfigs", x => x.BookingGroupID);
                    table.ForeignKey(
                        name: "FK_RecurringConfigs_BookingGroups_BookingGroupID",
                        column: x => x.BookingGroupID,
                        principalTable: "BookingGroups",
                        principalColumn: "BookingGroupID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecurringConfigs_Courts_CourtID",
                        column: x => x.CourtID,
                        principalTable: "Courts",
                        principalColumn: "CourtID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_BookingGroupID",
                table: "Bookings",
                column: "BookingGroupID");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_CancellationReasonID",
                table: "Bookings",
                column: "CancellationReasonID");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ComboID",
                table: "Bookings",
                column: "ComboID");

            migrationBuilder.CreateIndex(
                name: "IX_BookingGroups_ComboID",
                table: "BookingGroups",
                column: "ComboID");

            migrationBuilder.CreateIndex(
                name: "IX_BookingGroups_CustomerID",
                table: "BookingGroups",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_BookingGroups_FacilityID",
                table: "BookingGroups",
                column: "FacilityID");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringConfigs_CourtID",
                table: "RecurringConfigs",
                column: "CourtID");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_BookingGroups_BookingGroupID",
                table: "Bookings",
                column: "BookingGroupID",
                principalTable: "BookingGroups",
                principalColumn: "BookingGroupID",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_CancellationReasons_CancellationReasonID",
                table: "Bookings",
                column: "CancellationReasonID",
                principalTable: "CancellationReasons",
                principalColumn: "CancellationReasonID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Combos_ComboID",
                table: "Bookings",
                column: "ComboID",
                principalTable: "Combos",
                principalColumn: "ComboID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Courts_CourtID",
                table: "Bookings",
                column: "CourtID",
                principalTable: "Courts",
                principalColumn: "CourtID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Customers_CustomerID",
                table: "Bookings",
                column: "CustomerID",
                principalTable: "Customers",
                principalColumn: "CustomerID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_BookingGroups_BookingGroupID",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_CancellationReasons_CancellationReasonID",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Combos_ComboID",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Courts_CourtID",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Customers_CustomerID",
                table: "Bookings");

            migrationBuilder.DropTable(
                name: "RecurringConfigs");

            migrationBuilder.DropTable(
                name: "BookingGroups");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_BookingGroupID",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_CancellationReasonID",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_ComboID",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "Bookings");

            migrationBuilder.RenameColumn(
                name: "BookingGroupID",
                table: "Bookings",
                newName: "BookingStatusID");

            migrationBuilder.CreateTable(
                name: "BookingStatuses",
                columns: table => new
                {
                    BookingStatusID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CanCancel = table.Column<bool>(type: "bit", nullable: false),
                    Code = table.Column<string>(type: "varchar(50)", nullable: false),
                    ColorCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsFinal = table.Column<bool>(type: "bit", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
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
    }
}
