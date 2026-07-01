namespace Mp3Manager.Api.Models;

public class FusePlaylistRequest
{
    public string Name { get; set; } = string.Empty;
    public List<int> PlaylistIds { get; set; } = new();
}
