using FaceSearch.Api.Models;

namespace FaceSearch.Api.Services
{

    public interface IVectorSearchService
    {
        Task<List<FaceMatch>> SearchAsync(
            float[] embedding,
            FaceSearchOptions options,
            FaceSearchFilters? filters,
            CancellationToken cancellationToken);

        double CalculateSimilarity(
            float[] first,
            float[] second,
            string metric);
    }
}
