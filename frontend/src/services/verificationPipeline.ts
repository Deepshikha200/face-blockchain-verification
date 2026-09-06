import type { FaceDetectionResult, GoogleReverseResponse, FaceSearchResponse } from '../types/api';
import { detectFaceFromImage, loadImageElement, generateFaceEmbedding, NO_FACE_ERROR_MESSAGE } from './faceDetectionService';
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
 * Execution order:
 * Image Upload/Capture → Face Detection → Blockchain Hash → Face Embedding Vector → POST Face Search API
 */
export async function executeVerificationPipeline(
  file: File,
  precomputedDetection?: FaceDetectionResult,
  onProgress?: (state: PipelineProgressState) => void
): Promise<PipelineResult> {
  // Step 1: Face Detection
  onProgress?.({
    step: 'detection',
    subStepIndex: 1,
  });

  const detection = precomputedDetection || (await detectFaceFromImage(file));

  if (!detection.hasFace) {
    const errorMsg = detection.error || NO_FACE_ERROR_MESSAGE;
    onProgress?.({
      step: 'error',
      subStepIndex: 1,
      error: errorMsg,
    });
    throw new Error(errorMsg);
  }

  // Step 2: Blockchain Hash via Google Reverse API Integration
  onProgress?.({
    step: 'reverse',
    subStepIndex: 2,
    detection,
  });

  const reverseData = await getBlockchainHashFromGoogleReverse(file, file.name);
  const blockchainHash = reverseData.blockchainHash;

  if (!blockchainHash) {
    throw new Error('Failed to generate blockchain hash from Google Reverse API integration.');
  }

  // Step 3: Face Embedding Vector Generation (128 Dimensions)
  onProgress?.({
    step: 'embedding',
    subStepIndex: 1,
    detection,
    reverseData,
  });

  let faceEmbedding = detection.faceEmbeddingVector;
  if (!faceEmbedding || faceEmbedding.length === 0) {
    try {
      const img = await loadImageElement(file);
      faceEmbedding = generateFaceEmbedding(img, detection.box);
    } catch (err) {
      throw new Error(`Face embedding generation failed: ${(err as Error).message}`);
    }
  }

  // Step 4: POST Face Search API Call
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

  // Pipeline Completion
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
