import type { FaceDetectionResult, GoogleReverseResponse, FaceSearchResponse } from '../types/api';
import {
  detectFaceFromImage,
  loadImageElement,
  generateFaceEmbedding,
  generateFaceOnlyHash,
  NO_FACE_ERROR_MESSAGE,
  MULTIPLE_FACES_ERROR_MESSAGE,
} from './faceDetectionService';
import { getBlockchainHashFromGoogleReverse } from './googleReverseService';
import { postFaceSearch } from './faceSearchService';

export interface PipelineProgressState {
  step: 'detection' | 'reverse' | 'embedding' | 'search' | 'complete' | 'error';
  subStepIndex: number; // 1 = Detection & Embedding, 2 = Reverse Search, 3 = Blockchain
  detection?: FaceDetectionResult;
  reverseData?: GoogleReverseResponse;
  faceEmbedding?: number[];
  searchResponse?: FaceSearchResponse;
  error?: string;
}

export interface PipelineResult {
  detection: FaceDetectionResult;
  reverseData: GoogleReverseResponse;
  faceEmbedding: number[];
  searchResponse: FaceSearchResponse;
}

/**
 * End-to-End Biometric & Blockchain Verification Pipeline Orchestrator
 *
 * Strict Execution Flow:
 * Upload/Capture Image
 *   ↓
 * Detect Face
 *   ↓
 * Validate Number of Faces (0 -> error & stop; 2+ -> error & stop; 1 -> proceed)
 *   ↓
 * Extract Face Mapping / Features & 128D Embedding
 *   ↓
 * Generate Face-Only Hash (strictly from face representation, no full-image hashing)
 *   ↓
 * Google Reverse API with Face Hash
 *   ↓
 * POST Face Search API with Face Hash + Face Embedding Vector
 */
export async function executeVerificationPipeline(
  file: File,
  precomputedDetection?: FaceDetectionResult,
  onProgress?: (state: PipelineProgressState) => void
): Promise<PipelineResult> {
  // Step 1: Face Detection & Strict Face Count Validation
  onProgress?.({
    step: 'detection',
    subStepIndex: 1,
  });

  const detection = precomputedDetection || (await detectFaceFromImage(file));

  // Case 1: No visible face
  if (!detection.hasFace || detection.faceCount === 0) {
    const errorMsg = detection.error || NO_FACE_ERROR_MESSAGE;
    onProgress?.({
      step: 'error',
      subStepIndex: 1,
      error: errorMsg,
    });
    throw new Error(errorMsg);
  }

  // Case 2: Multiple faces detected (2+)
  if (detection.faceCount > 1) {
    const errorMsg = detection.error || MULTIPLE_FACES_ERROR_MESSAGE;
    onProgress?.({
      step: 'error',
      subStepIndex: 1,
      error: errorMsg,
    });
    throw new Error(errorMsg);
  }

  // Case 3: Exactly ONE face detected
  let faceEmbedding = detection.faceEmbeddingVector;
  let faceHash = detection.faceHash;

  if (!faceEmbedding || faceEmbedding.length === 0 || !faceHash) {
    try {
      const img = await loadImageElement(file);
      faceEmbedding = faceEmbedding || generateFaceEmbedding(img, detection.box);
      faceHash = faceHash || (await generateFaceOnlyHash(img, detection.box!, faceEmbedding));
      detection.faceEmbeddingVector = faceEmbedding;
      detection.faceHash = faceHash;
    } catch (err) {
      throw new Error(`Face representation extraction failed: ${(err as Error).message}`);
    }
  }

  // Step 2: Blockchain Hash via Google Reverse API using Face-Only Hash
  onProgress?.({
    step: 'reverse',
    subStepIndex: 2,
    detection,
  });

  const reverseData = await getBlockchainHashFromGoogleReverse(faceHash, file, file.name);
  const blockchainHash = reverseData.blockchainHash;

  if (!blockchainHash) {
    throw new Error('Failed to generate blockchain hash from Google Reverse API integration.');
  }

  // Step 3: Face Embedding Vector Confirmation
  onProgress?.({
    step: 'embedding',
    subStepIndex: 1,
    detection,
    reverseData,
    faceEmbedding,
  });

  // Step 4: POST Face Search API with Face Hash + 128D Embedding Vector
  onProgress?.({
    step: 'search',
    subStepIndex: 3,
    detection,
    reverseData,
    faceEmbedding,
  });

  const searchResponse = await postFaceSearch({
    blockchainHash,
    faceEmbeddingVector: faceEmbedding,
    fileName: file.name,
    timestamp: new Date().toISOString(),
  });

  // Complete
  onProgress?.({
    step: 'complete',
    subStepIndex: 3,
    detection,
    reverseData,
    faceEmbedding,
    searchResponse,
  });

  return {
    detection,
    reverseData,
    faceEmbedding,
    searchResponse,
  };
}
