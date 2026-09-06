using System.ComponentModel.DataAnnotations;

namespace ComplexModelApi.Models;

/// <summary>
/// Placeholder shape for the incoming payload. Replace these properties
/// (including nested types, if any) once the real model is confirmed —
/// the controller doesn't need to change, just this class.
/// </summary>
public class ComplexRequestModel
{
    [Required]
    public string? Id { get; set; }

    public Dictionary<string, object>? Data { get; set; }
}
