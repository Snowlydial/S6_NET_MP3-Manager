using Microsoft.EntityFrameworkCore;
using Mp3Manager.Api.Data;
using Mp3Manager.Api.Models;

namespace Mp3Manager.Api.Services;

public class AuthService
{
    private readonly AppDbContext _db;

    public AuthService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<User?> Register(string username, string password)
    {
        bool exists = await _db.Users.AnyAsync(u => u.Username == username);
        if (exists) return null;

        User user = new User
        {
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }

    public async Task<User?> Login(string username, string password)
    {
        User? user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return null;

        bool valid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        if (!valid) return null;

        return user;
    }
}
