namespace Mp3Manager.Api.Models;

public class UpdateSongRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Artist { get; set; }
    public string? AlbumArtist { get; set; }
    public string? Genre { get; set; }
    public string? Language { get; set; }
    public string? Year { get; set; }
}
