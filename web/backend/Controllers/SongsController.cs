using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mp3Manager.Api.Data;
using Mp3Manager.Api.Models;
using Mp3Manager.Api.Services;

namespace Mp3Manager.Api.Controllers;

[ApiController]
[Route("api/songs")]
public class SongsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly SongService _songService;

    public SongsController(AppDbContext db, SongService songService)
    {
        _db = db;
        _songService = songService;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file, [FromForm] string title, 
        [FromForm] string? artist, [FromForm] string? albumArtist, [FromForm] string? genre, 
        [FromForm] string? language, [FromForm] int duration, [FromForm] string? year)
    {
        Song song = await _songService.SaveSong(file, title, artist, albumArtist, genre, language, duration, year);
        return Ok(song);
    }

    [HttpGet("{id}/stream")]
    public IActionResult Stream(int id)
    {
        Song? song = _db.Songs.Find(id);
        if (song == null) return NotFound();
        if (!System.IO.File.Exists(song.FilePath)) return NotFound("File not found on disk");

        FileStream stream = System.IO.File.OpenRead(song.FilePath);
        return File(stream, "audio/mpeg", enableRangeProcessing: true);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        List<Song> songs = await _db.Songs.OrderBy(s => s.Title).ToListAsync();
        return Ok(songs);
    }

    [HttpGet("filters")]
    public async Task<IActionResult> GetFilters()
    {
        List<string> artists = await _db.Songs
            .Where(s => s.Artist != null)
            .Select(s => s.Artist!)
            .Union(
                _db.Songs
                    .Where(s => s.AlbumArtist != null)
                    .Select(s => s.AlbumArtist!)
            )
            .Distinct()
            .OrderBy(a => a)
            .ToListAsync();

        List<string> genres = await _db.Songs
            .Where(s => s.Genre != null)
            .Select(s => s.Genre!)
            .Distinct()
            .OrderBy(g => g)
            .ToListAsync();

        return Ok(new { artists, genres });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        Song? song = await _db.Songs.FindAsync(id);
        if (song == null) return NotFound();

        if (System.IO.File.Exists(song.FilePath))
            System.IO.File.Delete(song.FilePath);

        _db.Songs.Remove(song);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
