using Microsoft.EntityFrameworkCore;
using Mp3Manager.Api.Data;
using Mp3Manager.Api.Models;

namespace Mp3Manager.Api.Services;

public class PlaylistService
{
    private readonly AppDbContext _db;

    public PlaylistService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Song>> GenerateAsync(GeneratePlaylistRequest request)
    {
        int lower = request.DurationMinutes * 60;
        int upper = lower + 59;

        bool hasArtistFilter = request.Artists.Count > 0;
        bool hasGenreFilter = request.Genres.Count > 0;

        var artists = request.Artists.Select(a => a.ToLower()).ToHashSet();
        var genres = request.Genres.Select(g => g.ToLower()).ToHashSet();

        var allSongs = await _db.Songs.ToListAsync();
        var shuffled = allSongs.OrderBy(_ => Guid.NewGuid()).ToList();

        var matching = shuffled.Where(s =>
        {
            bool artistOk = !hasArtistFilter || (s.Artist != null && artists.Contains(s.Artist.ToLower()));
            bool genreOk = !hasGenreFilter || (s.Genre != null && genres.Contains(s.Genre.ToLower()));
            return artistOk && genreOk;
        }).ToList();

        var playlist = new List<Song>();
        int total = 0;

        // Fill with matching songs first
        foreach (var song in matching)
        {
            if (total + song.Duration <= upper)
            {
                playlist.Add(song);
                total += song.Duration;
            }
        }

        // If still under lower bound, fill with any remaining songs
        if (total < lower)
        {
            var usedIds = playlist.Select(s => s.Id).ToHashSet();
            var remaining = shuffled.Where(s => !usedIds.Contains(s.Id)).ToList();

            foreach (var song in remaining)
            {
                if (total + song.Duration <= upper)
                {
                    playlist.Add(song);
                    total += song.Duration;
                }
            }
        }

        return playlist;
    }
}
