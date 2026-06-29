using System.IO.Compression;
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

        HashSet<string> artists         = request.Artists.Select(a => a.ToLower()).ToHashSet();
        HashSet<string> excludedArtists = request.ExcludedArtists.Select(a => a.ToLower()).ToHashSet();
        HashSet<string> genres          = request.Genres.Select(g => g.ToLower()).ToHashSet();
        HashSet<string> excludedGenres  = request.ExcludedGenres.Select(g => g.ToLower()).ToHashSet();

        List<Song> allSongs = await _db.Songs.ToListAsync();
        List<Song> shuffled = allSongs.OrderBy(_ => Guid.NewGuid()).ToList();

        // Remove excluded songs from the entire pool first
        List<Song> pool = shuffled.Where(s =>
        {
            bool artistExcluded = s.Artist != null && excludedArtists.Contains(s.Artist.ToLower());
            bool genreExcluded  = s.Genre  != null && excludedGenres.Contains(s.Genre.ToLower());
            return !artistExcluded && !genreExcluded;
        }).ToList();

        List<Song> matching = pool.Where(s =>
        {
            bool artistOk = !hasArtistFilter || (s.Artist != null && artists.Contains(s.Artist.ToLower()));
            bool genreOk  = !hasGenreFilter  || (s.Genre  != null && genres.Contains(s.Genre.ToLower()));
            return artistOk && genreOk;
        }).ToList();

        List<Song> playlist = new List<Song>();
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

        // If still under lower bound, fill with remaining non-excluded songs
        if (total < lower)
        {
            HashSet<int> usedIds   = playlist.Select(s => s.Id).ToHashSet();
            List<Song> remaining = pool.Where(s => !usedIds.Contains(s.Id)).ToList();

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

    public async Task<MemoryStream> BuildZip(List<int> songIds)
    {
        List<Song> songs = _db.Songs
            .Where(s => songIds.Contains(s.Id))
            .ToList();

        MemoryStream memoryStream = new MemoryStream();
        using (ZipArchive zip = new ZipArchive(memoryStream, ZipArchiveMode.Create, leaveOpen: true))
        {
            foreach (Song song in songs)
            {
                if (!System.IO.File.Exists(song.FilePath)) continue;
                ZipArchiveEntry entry = zip.CreateEntry(Path.GetFileName(song.FilePath));
                using Stream entryStream = entry.Open();
                using FileStream fileStream = System.IO.File.OpenRead(song.FilePath);
                await fileStream.CopyToAsync(entryStream);
            }
        }

        memoryStream.Position = 0;
        return memoryStream;
    }
}
