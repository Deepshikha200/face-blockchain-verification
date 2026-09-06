using ComplexModelApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace ComplexModelApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubmissionController : ControllerBase
{
    private readonly ILogger<SubmissionController> _logger;

    public SubmissionController(ILogger<SubmissionController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Accepts the complex model payload. Swap ComplexRequestModel's
    /// properties for the real schema once it's confirmed — this method
    /// signature and the wiring around it can stay as-is.
    /// </summary>
    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Post(
        [FromBody] ComplexRequestModel model,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        _logger.LogInformation("Received submission with Id={Id}", model.Id);

        // TODO: replace with real processing logic once the model shape is finalized.
        await Task.CompletedTask;

        return Ok(new
        {
            received = true,
            id = model.Id
        });
    }
}
