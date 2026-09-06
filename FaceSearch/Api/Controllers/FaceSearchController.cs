using FaceSearch.Api.Models;
using FaceSearch.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FaceSearch.Api.Controllers;

[ApiController]
[Route("v1/faces")]
public sealed class FaceSearchController : ControllerBase
{
    private readonly IFaceSearchService _faceSearchService;

    public FaceSearchController(IFaceSearchService faceSearchService)
    {
        _faceSearchService = faceSearchService;
    }

    [HttpPost("map")]
    public async Task<IActionResult> FaceMap(
        [FromBody] FaceMappingRequest request)
    {
        // Validate request

        // Store face mapping

        // Store descriptor in vector index

        return Ok(new
        {
            success = true,
            photoId = request.PhotoId,
            faceCount = request.Faces.Count
        }); 
    }

    /// <summary>
    /// Extract face embeddings from an image.
    /// </summary>
    [HttpPost("encode")]
    [ProducesResponseType(typeof(FaceEncodeResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<FaceEncodeResponse>> Encode(
        [FromBody] FaceEncodeRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _faceSearchService.EncodeAsync(
            request,
            cancellationToken);

        return Ok(response);
    }

    /// <summary>
    /// Compare two faces and return their similarity.
    /// </summary>
    [HttpPost("compare")]
    [ProducesResponseType(typeof(FaceCompareResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<FaceCompareResponse>> Compare(
        [FromBody] FaceCompareRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _faceSearchService.CompareAsync(
            request,
            cancellationToken);

        return Ok(response);
    }

    /// <summary>
    /// Search an indexed collection for matching faces.
    /// </summary>
    [HttpPost("search")]
    [ProducesResponseType(typeof(FaceSearchResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<FaceSearchResponse>> Search(
        [FromBody] FaceSearchRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _faceSearchService.SearchAsync(
            request,
            cancellationToken);

        return Ok(response);
    }

    /// <summary>
    /// Index one or more photos.
    /// </summary>
    [HttpPost("/v1/photos/index")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    public async Task<IActionResult> IndexPhotos(
        [FromBody] PhotoIndexRequest request,
        CancellationToken cancellationToken)
    {
        var job = await _faceSearchService.IndexPhotosAsync(
            request,
            cancellationToken);

        return Accepted(new
        {
            jobId = job.JobId,
            status = job.Status,
            totalPhotos = request.Photos.Count
        });
    }
}