namespace Mp3Manager.Api.Models;

public class Playlist
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<PlaylistSong> Songs { get; set; } = new();
}
