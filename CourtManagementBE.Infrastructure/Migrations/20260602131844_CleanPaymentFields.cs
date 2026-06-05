using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class CleanPaymentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Payments_TransactionID",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "PaymentGateway",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "PaymentMethodID",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "PaymentStatusID",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "RefundReasonID",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "TransactionID",
                table: "Payments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentGateway",
                table: "Payments",
                type: "varchar(30)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethodID",
                table: "Payments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PaymentStatusID",
                table: "Payments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RefundReasonID",
                table: "Payments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TransactionID",
                table: "Payments",
                type: "varchar(100)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_TransactionID",
                table: "Payments",
                column: "TransactionID");
        }
    }
}
