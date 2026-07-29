using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Evently.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddStripeSessionId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StripeSessionId",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_StripeSessionId",
                table: "Bookings",
                column: "StripeSessionId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bookings_StripeSessionId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "StripeSessionId",
                table: "Bookings");
        }
    }
}
