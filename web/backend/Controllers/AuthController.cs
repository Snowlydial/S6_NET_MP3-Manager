using Microsoft.AspNetCore.Mvc;
using Mp3Manager.Api.Models;
using Mp3Manager.Api.Services;

namespace Mp3Manager.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        User? user = await _authService.Register(request.Username, request.Password);
        if (user == null)
            return Conflict("Username already taken");

        return Ok(new { user.Id, user.Username });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        User? user = await _authService.Login(request.Username, request.Password);
        if (user == null)
            return Unauthorized("Invalid username or password");

        return Ok(new { user.Id, user.Username });
    }
}
