namespace Mp3Manager.Api.Models;

public class SavePlaylistRequest
{
    public string Name { get; set; } = string.Empty;
    public List<int> SongIds { get; set; } = new();
}
