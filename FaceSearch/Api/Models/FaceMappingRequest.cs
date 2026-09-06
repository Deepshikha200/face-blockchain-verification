namespace FaceSearch.Api.Models
{
    public class FaceMappingRequest
    {
        public string PhotoId { get; set; } = string.Empty;

        public List<FaceMapping> Faces { get; set; } = [];
    }

    public class FaceMapping
    {
        public double Confidence { get; set; }

        public FaceBoundingBox BoundingBox { get; set; } = new();

        public List<FaceLandmark> Landmarks { get; set; } = [];

        public float[] Descriptor { get; set; } = [];
    }

    public class FaceBoundingBox
    {
        public double X { get; set; }
        public double Y { get; set; }
        public double Width { get; set; }
        public double Height { get; set; }
    }

    public class FaceLandmark
    {
        public double X { get; set; }
        public double Y { get; set; }
        public string? Type { get; set; }
    }
}
