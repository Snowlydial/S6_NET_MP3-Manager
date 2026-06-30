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

        List<Song> playlist = await _playlistService.GenerateAsync(request);
        return Ok(playlist);
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save([FromBody] SavePlaylistRequest request)
    {
        if (request.SongIds.Count == 0)
            return BadRequest("No songs provided");

        Playlist playlist = await _playlistService.SavePlaylist(request.Name, request.SongIds);
        return Ok(playlist);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        List<Playlist> playlists = await _playlistService.GetAllPlaylists();
        return Ok(playlists);
    }

    [HttpPost("download")]
    public async Task<IActionResult> Download([FromBody] DownloadPlaylistRequest request)
    {
        if (request.SongIds.Count == 0)
            return BadRequest("No songs provided");

        MemoryStream stream = await _playlistService.BuildZip(request.SongIds);
        return File(stream, "application/zip", "playlist.zip");
    }
}
