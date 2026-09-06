using FaceSearch.Api.Models;

namespace FaceSearch.Api.Services;

public interface IFaceEmbeddingProvider
{
    Task<List<FaceResult>> GenerateAsync(
        ImageInput image,
        FaceProcessingOptions options,
        EmbeddingOptions embeddingOptions,
        CancellationToken cancellationToken);

    Task<float[]> GenerateSingleAsync(
        ImageInput image,
        CancellationToken cancellationToken);
}