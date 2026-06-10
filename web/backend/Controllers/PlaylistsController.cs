using System.IO.Compression;
using Microsoft.AspNetCore.Mvc;
using Mp3Manager.Api.Data;
using Mp3Manager.Api.Models;
using Mp3Manager.Api.Services;

namespace Mp3Manager.Api.Controllers;

[ApiController]
[Route("api/playlists")]
public class PlaylistsController : ControllerBase
{
    private readonly PlaylistService _playlistService;
    private readonly AppDbContext _db;

    public PlaylistsController(PlaylistService playlistService, AppDbContext db)
    {
        _playlistService = playlistService;
        _db = db;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] GeneratePlaylistRequest request)
    {
        if (request.DurationMinutes <= 0)
            return BadRequest("DurationMinutes must be greater than 0");

        var playlist = await _playlistService.GenerateAsync(request);
        return Ok(playlist);
    }

    [HttpPost("download")]
    public async Task<IActionResult> Download([FromBody] DownloadPlaylistRequest request)
    {
        if (request.SongIds.Count == 0)
            return BadRequest("No songs provided");

        var songs = _db.Songs
            .Where(s => request.SongIds.Contains(s.Id))
            .ToList();

        var memoryStream = new MemoryStream();
        using (var zip = new ZipArchive(memoryStream, ZipArchiveMode.Create, leaveOpen: true))
        {
            foreach (var song in songs)
            {
                if (!System.IO.File.Exists(song.FilePath)) continue;

                var entryName = Path.GetFileName(song.FilePath);
                var entry = zip.CreateEntry(entryName);
                using var entryStream = entry.Open();
                using var fileStream = System.IO.File.OpenRead(song.FilePath);
                await fileStream.CopyToAsync(entryStream);
            }
        }

        memoryStream.Position = 0;
        return File(memoryStream, "application/zip", "playlist.zip");
    }
}
