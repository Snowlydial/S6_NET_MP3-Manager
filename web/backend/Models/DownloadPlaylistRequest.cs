namespace Mp3Manager.Api.Models;

public class DownloadPlaylistRequest
{
    public List<int> SongIds { get; set; } = new();
}
