namespace Mp3Manager.Api.Models;

public class PlaylistSong
{
    public int Id { get; set; }
    public int PlaylistId { get; set; }
    public int SongId { get; set; }
    public Song Song { get; set; } = null!;
}
