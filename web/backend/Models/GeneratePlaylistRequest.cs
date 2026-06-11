namespace Mp3Manager.Api.Models;

public class GeneratePlaylistRequest
{
    public int DurationMinutes { get; set; }
    public List<string> Artists { get; set; } = new();
    public List<string> ExcludedArtists { get; set; } = new();
    public List<string> Genres { get; set; } = new();
    public List<string> ExcludedGenres { get; set; } = new();
}
