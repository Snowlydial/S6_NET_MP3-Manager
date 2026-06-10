using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mp3Manager.Api.Data;
using Mp3Manager.Api.Models;

namespace Mp3Manager.Api.Controllers;

[ApiController]
[Route("api/songs")]
public class SongsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public SongsController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file, [FromForm] string title, [FromForm] string? artist,
        [FromForm] string? genre, [FromForm] string? language, [FromForm] int duration, [FromForm] string? year)
    {
        var uploadsPath = _config["UploadsPath"] ?? "uploads";
        Directory.CreateDirectory(uploadsPath);

        var fileName = Path.GetFileName(file.FileName);
        var filePath = Path.Combine(uploadsPath, fileName);

        using (var stream = System.IO.File.Create(filePath))
            await file.CopyToAsync(stream);

        var song = new Song
        {
            Title = title,
            Artist = string.IsNullOrWhiteSpace(artist) ? null : artist,
            Genre = string.IsNullOrWhiteSpace(genre) ? null : genre,
            Language = string.IsNullOrWhiteSpace(language) ? null : language,
            Duration = duration,
            Year = string.IsNullOrWhiteSpace(year) ? null : year,
            FilePath = Path.GetFullPath(filePath),
        };

        _db.Songs.Add(song);
        await _db.SaveChangesAsync();

        return Ok(song);
    }

    [HttpGet("{id}/stream")]
    public IActionResult Stream(int id)
    {
        var song = _db.Songs.Find(id);
        if (song == null) return NotFound();
        if (!System.IO.File.Exists(song.FilePath)) return NotFound("File not found on disk");

        var stream = System.IO.File.OpenRead(song.FilePath);
        return File(stream, "audio/mpeg", enableRangeProcessing: true);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var songs = await _db.Songs.OrderBy(s => s.Title).ToListAsync();
        return Ok(songs);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var song = await _db.Songs.FindAsync(id);
        if (song == null) return NotFound();

        if (System.IO.File.Exists(song.FilePath))
            System.IO.File.Delete(song.FilePath);

        _db.Songs.Remove(song);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
