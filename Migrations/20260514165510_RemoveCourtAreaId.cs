using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CourtManagementBE.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCourtAreaId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AreaID",
                table: "Courts");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AreaID",
                table: "Courts",
                type: "int",
                nullable: true);
        }
    }
}
