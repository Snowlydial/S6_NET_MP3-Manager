namespace Mp3Manager.Api.Models;

public class Song
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Artist { get; set; }
    public string? AlbumArtist { get; set; }
    public string? Genre { get; set; }
    public string? Language { get; set; }
    public int Duration { get; set; } // seconds
    public string? Year { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
