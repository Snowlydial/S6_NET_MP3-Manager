using Microsoft.EntityFrameworkCore;
using Mp3Manager.Api.Models;

namespace Mp3Manager.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Song> Songs => Set<Song>();
}
