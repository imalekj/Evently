using System.ComponentModel.DataAnnotations;
using Evently.Api.Models;

namespace Evently.Api.DTOs;

public record RegisterDto(
    [Required, MaxLength(150)] string FullName,
    [Required, EmailAddress, MaxLength(200)] string Email,
    [Required, MinLength(6)] string Password
);

public record LoginDto(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record UserDto(Guid Id, string FullName, string Email, UserRole Role);

public record AuthResponseDto(string Token, UserDto User);
