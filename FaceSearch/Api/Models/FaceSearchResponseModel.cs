namespace FaceSearch.Api.Models;

public sealed class BoundingBox
{
    public double X { get; set; }
    public double Y { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }
}

public sealed class FacePose
{
    public double Yaw { get; set; }
    public double Pitch { get; set; }
    public double Roll { get; set; }
}

public sealed class FaceQuality
{
    public double Overall { get; set; }
    public double? Blur { get; set; }
    public double? Brightness { get; set; }
    public FacePose? Pose { get; set; }
}

public sealed class FaceEmbedding
{
    public int Dimensions { get; set; }

    // Consider making this nullable and only returning it
    // when explicitly requested.
    public float[]? Values { get; set; }
}

public sealed class FaceResult
{
    public string FaceId { get; set; } = string.Empty;

    public FaceEmbedding? Embedding { get; set; }

    public BoundingBox BoundingBox { get; set; } = new();

    public double DetectionConfidence { get; set; }

    public FaceQuality? Quality { get; set; }
}

public sealed class FaceEncodeResponse
{
    public string RequestId { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public string ModelVersion { get; set; } = string.Empty;

    public List<FaceResult> Faces { get; set; } = [];
}

//Search response

public sealed class FaceMatch
{
    public string PhotoId { get; set; } = string.Empty;

    public string FaceId { get; set; } = string.Empty;

    public double Similarity { get; set; }

    public BoundingBox? Location { get; set; }

    public PhotoMetadata? Metadata { get; set; }
}

public sealed class FaceSearchQueryInfo
{
    public bool FaceDetected { get; set; }

    public double Quality { get; set; }
}

public sealed class FaceSearchResponse
{
    public string RequestId { get; set; } = string.Empty;

    public FaceSearchQueryInfo Query { get; set; } = new();

    public List<FaceMatch> Results { get; set; } = [];
}

//Compare response

public sealed class FaceCompareResult
{
    public double Similarity { get; set; }

    public double Threshold { get; set; }

    public bool Match { get; set; }
}

public sealed class FaceCompareResponse
{
    public string RequestId { get; set; } = string.Empty;

    public FaceCompareResult Result { get; set; } = new();
}