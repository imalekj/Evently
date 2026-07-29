using Evently.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Evently.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.FullName).HasMaxLength(150).IsRequired();
            e.Property(u => u.Email).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.HasIndex(c => c.Name).IsUnique();
            e.Property(c => c.Name).HasMaxLength(100).IsRequired();
        });

        modelBuilder.Entity<Event>(e =>
        {
            e.Property(ev => ev.Title).HasMaxLength(200).IsRequired();
            e.Property(ev => ev.Location).HasMaxLength(250).IsRequired();
            e.Property(ev => ev.Price).HasColumnType("decimal(10,2)");

            e.HasOne(ev => ev.Category)
                .WithMany(c => c.Events)
                .HasForeignKey(ev => ev.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(ev => ev.Organizer)
                .WithMany(u => u.Events)
                .HasForeignKey(ev => ev.OrganizerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Booking>(e =>
        {
            e.HasIndex(b => b.TicketCode).IsUnique();
            e.HasIndex(b => b.StripeSessionId).IsUnique();
            e.Property(b => b.TotalPrice).HasColumnType("decimal(10,2)");

            e.HasOne(b => b.Event)
                .WithMany(ev => ev.Bookings)
                .HasForeignKey(b => b.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Music" },
            new Category { Id = 2, Name = "Technology" },
            new Category { Id = 3, Name = "Sports" },
            new Category { Id = 4, Name = "Business" },
            new Category { Id = 5, Name = "Arts & Culture" },
            new Category { Id = 6, Name = "Food & Drink" },
            new Category { Id = 7, Name = "Education" },
            new Category { Id = 8, Name = "Other" }
        );
    }
}
