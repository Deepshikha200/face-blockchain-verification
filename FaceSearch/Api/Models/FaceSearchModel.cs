namespace FaceSearch.Api.Models;

public sealed class ImageInput
{
    public string Data { get; set; } = string.Empty;
    public string MimeType { get; set; } = "image/jpeg";
}

public sealed class FaceProcessingOptions
{
    public bool DetectMultiple { get; set; } = true;
    public int MaxFaces { get; set; } = 10;
    public bool Align { get; set; } = true;
    public bool QualityCheck { get; set; } = true;
}

public sealed class EmbeddingOptions
{
    public string Model { get; set; } = "face-recognition-v1";
    public int Dimensions { get; set; } = 512;
    public bool Normalize { get; set; } = true;
    public bool ReturnEmbedding { get; set; } = false;
}

public sealed class FaceEncodeRequest
{
    public ImageInput Image { get; set; } = new();
    public FaceProcessingOptions Options { get; set; } = new();
    public EmbeddingOptions Embedding { get; set; } = new();
}

//SearchModel
public sealed class FaceSearchOptions
{
    public string Collection { get; set; } = string.Empty;

    public int TopK { get; set; } = 20;

    public double Threshold { get; set; } = 0.78;

    public string Metric { get; set; } = "cosine";
}

public sealed class FaceSearchFilters
{
    public DateTime? DateFrom { get; set; }

    public DateTime? DateTo { get; set; }

    public string? AlbumId { get; set; }
}

public sealed class FaceSearchRequest
{
    public ImageInput Image { get; set; } = new();

    public FaceSearchOptions Search { get; set; } = new();

    public FaceSearchFilters? Filters { get; set; }
}

//CompareModel
public sealed class FaceCompareOptions
{
    public string Metric { get; set; } = "cosine";

    public double Threshold { get; set; } = 0.75;
}

public sealed class FaceCompareRequest
{
    public ImageInput Probe { get; set; } = new();

    public ImageInput Candidate { get; set; } = new();

    public FaceCompareOptions Options { get; set; } = new();
}

//PhotoIndexingModels
public sealed class PhotoMetadata
{
    public string? AlbumId { get; set; }

    public DateTime? CapturedAt { get; set; }

    public Dictionary<string, object>? Custom { get; set; }
}

public sealed class PhotoIndexItem
{
    public string PhotoId { get; set; } = string.Empty;

    public ImageInput Image { get; set; } = new();

    public PhotoMetadata? Metadata { get; set; }
}

public sealed class PhotoIndexRequest
{
    public string Collection { get; set; } = string.Empty;

    public List<PhotoIndexItem> Photos { get; set; } = [];
}