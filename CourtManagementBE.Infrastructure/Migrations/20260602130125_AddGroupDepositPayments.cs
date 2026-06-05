using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupDepositPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "BookingID",
                table: "Payments",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<int>(
                name: "BookingGroupID",
                table: "Payments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_BookingGroupID",
                table: "Payments",
                column: "BookingGroupID");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_BookingGroups_BookingGroupID",
                table: "Payments",
                column: "BookingGroupID",
                principalTable: "BookingGroups",
                principalColumn: "BookingGroupID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_BookingGroups_BookingGroupID",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_BookingGroupID",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "BookingGroupID",
                table: "Payments");

            migrationBuilder.AlterColumn<Guid>(
                name: "BookingID",
                table: "Payments",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);
        }
    }
}
