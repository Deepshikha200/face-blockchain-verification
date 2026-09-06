export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceDetectionResult {
  hasFace: boolean;
  faceCount: number; // 0, 1, or 2+
  confidence?: number;
  box?: FaceBox;
  faces?: FaceBox[];
  error?: string;
  details?: string;
  faceEmbeddingVector?: number[];
  faceHash?: string; // Deterministic hash of single detected face
}

export interface GoogleReverseRequest {
  image?: string; // base64 / data URL
  fileHash?: string;
  fileName?: string;
}

export interface GoogleReverseResponse {
  success: boolean;
  blockchainHash: string;
  queryUrl?: string;
  searchTitle?: string;
  matchedSocialPost?: {
    platform: string;
    url: string;
    author: string;
    matchConfidence: number;
  };
  timestamp: string;
  message?: string;
}

export interface FaceSearchRequest {
  blockchainHash: string;
  faceEmbeddingVector: number[];
  image?: string; // base64 / data URL or file reference
  fileName?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  timestamp?: string;
}

export interface FaceSearchResponse {
  success: boolean;
  matchFound: boolean;
  similarityScore: number;
  blockchainHash: string;
  transactionHash: string;
  network: string;
  contractAddress: string;
  matchedProfile?: {
    name: string;
    platform: string;
    postUrl: string;
    verifiedAt: string;
  };
  timestamp: string;
  message: string;
}
