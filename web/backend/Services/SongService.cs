using Microsoft.EntityFrameworkCore;
using Mp3Manager.Api.Data;
using Mp3Manager.Api.Models;

namespace Mp3Manager.Api.Services;

public class SongService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public SongService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<Song> SaveSong(IFormFile file, string title, string? artist, 
        string? albumArtist, string? genre, string? language, int duration, string? year)
    {
        var uploadsPath = Path.Combine(AppContext.BaseDirectory, _config["UploadsPath"] ?? "uploads");
        Directory.CreateDirectory(uploadsPath);

        var fileName = Path.GetFileName(file.FileName);
        var filePath = Path.Combine(uploadsPath, fileName);

        var existing = await _db.Songs.FirstOrDefaultAsync(s => s.FilePath == Path.GetFullPath(filePath));
        if (existing != null) return existing;

        using (var stream = System.IO.File.Create(filePath))
            await file.CopyToAsync(stream);

        var song = new Song
        {
            Title = title,
            Artist = string.IsNullOrWhiteSpace(artist) ? null : artist,
            AlbumArtist = string.IsNullOrWhiteSpace(albumArtist) ? null : albumArtist,
            Genre = string.IsNullOrWhiteSpace(genre) ? null : genre,
            Language = string.IsNullOrWhiteSpace(language) ? null : language,
            Duration = duration,
            Year = string.IsNullOrWhiteSpace(year) ? null : year,
            FilePath = Path.GetFullPath(filePath),
        };

        _db.Songs.Add(song);
        await _db.SaveChangesAsync();
        return song;
    }
}