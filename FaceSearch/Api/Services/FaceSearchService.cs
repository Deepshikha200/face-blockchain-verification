using FaceSearch.Api.Models;

namespace FaceSearch.Api.Services;

public sealed class FaceSearchService : IFaceSearchService
{
    private readonly IFaceEmbeddingProvider _embeddingProvider;
    private readonly IVectorSearchService _vectorSearch;

    public FaceSearchService(
        IFaceEmbeddingProvider embeddingProvider,
        IVectorSearchService vectorSearch)
    {
        _embeddingProvider = embeddingProvider;
        _vectorSearch = vectorSearch;
    }

    public async Task<FaceEncodeResponse> EncodeAsync(
        FaceEncodeRequest request,
        CancellationToken cancellationToken)
    {
        var faces = await _embeddingProvider.GenerateAsync(
            request.Image,
            request.Options,
            request.Embedding,
            cancellationToken);

        return new FaceEncodeResponse
        {
            RequestId = Guid.NewGuid().ToString("N"),
            Model = request.Embedding.Model,
            ModelVersion = "1.0",
            Faces = faces
        };
    }

    public async Task<FaceCompareResponse> CompareAsync(
        FaceCompareRequest request,
        CancellationToken cancellationToken)
    {
        var probe = await _embeddingProvider.GenerateSingleAsync(
            request.Probe,
            cancellationToken);

        var candidate = await _embeddingProvider.GenerateSingleAsync(
            request.Candidate,
            cancellationToken);

        var similarity = _vectorSearch.CalculateSimilarity(
            probe,
            candidate,
            request.Options.Metric);

        return new FaceCompareResponse
        {
            RequestId = Guid.NewGuid().ToString("N"),

            Result = new FaceCompareResult
            {
                Similarity = similarity,
                Threshold = request.Options.Threshold,
                Match = similarity >= request.Options.Threshold
            }
        };
    }

    public async Task<FaceSearchResponse> SearchAsync(
        FaceSearchRequest request,
        CancellationToken cancellationToken)
    {
        var embedding = await _embeddingProvider.GenerateSingleAsync(
            request.Image,
            cancellationToken);

        var results = await _vectorSearch.SearchAsync(
            embedding,
            request.Search,
            request.Filters,
            cancellationToken);

        return new FaceSearchResponse
        {
            RequestId = Guid.NewGuid().ToString("N"),

            Query = new FaceSearchQueryInfo
            {
                FaceDetected = true,
                Quality = 0.95
            },

            Results = results
        };
    }

    public Task<IndexJobResponse> IndexPhotosAsync(
        PhotoIndexRequest request,
        CancellationToken cancellationToken)
    {
        // Push to a background queue in the real implementation.

        return Task.FromResult(new IndexJobResponse
        {
            JobId = Guid.NewGuid().ToString("N"),
            Status = "queued"
        });
    }
}