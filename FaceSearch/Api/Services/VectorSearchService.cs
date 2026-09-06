using FaceSearch.Api.Models;

namespace FaceSearch.Api.Services
{
    public class VectorSearchService : IVectorSearchService
    {
        double IVectorSearchService.CalculateSimilarity(float[] first, float[] second, string metric)
        {
            throw new NotImplementedException();
        }

        Task<List<FaceMatch>> IVectorSearchService.SearchAsync(float[] embedding, FaceSearchOptions options, FaceSearchFilters? filters, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
