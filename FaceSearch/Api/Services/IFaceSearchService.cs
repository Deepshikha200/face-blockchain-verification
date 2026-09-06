using FaceSearch.Api.Models;

namespace FaceSearch.Api.Services;

public interface IFaceSearchService
{
    Task<FaceEncodeResponse> EncodeAsync(
        FaceEncodeRequest request,
        CancellationToken cancellationToken);

    Task<FaceCompareResponse> CompareAsync(
        FaceCompareRequest request,
        CancellationToken cancellationToken);

    Task<FaceSearchResponse> SearchAsync(
        FaceSearchRequest request,
        CancellationToken cancellationToken);

    Task<IndexJobResponse> IndexPhotosAsync(
        PhotoIndexRequest request,
        CancellationToken cancellationToken);
}

public sealed class IndexJobResponse
{
    public string JobId { get; set; } = string.Empty;

    public string Status { get; set; } = "queued";
}

