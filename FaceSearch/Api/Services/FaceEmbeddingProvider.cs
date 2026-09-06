using FaceSearch.Api.Models;

namespace FaceSearch.Api.Services
{
    public class FaceEmbeddingProvider: IFaceEmbeddingProvider
    {
        public FaceEmbeddingProvider()
        {
            
        }

        Task<List<FaceResult>> IFaceEmbeddingProvider.GenerateAsync(ImageInput image, FaceProcessingOptions options, EmbeddingOptions embeddingOptions, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        Task<float[]> IFaceEmbeddingProvider.GenerateSingleAsync(ImageInput image, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
