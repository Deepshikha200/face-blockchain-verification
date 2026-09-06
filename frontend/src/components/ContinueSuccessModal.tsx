import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Hash,
  ExternalLink,
  ArrowLeft,
  Search,
  Cpu,
  Fingerprint,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import type { UploadedFaceImage, PipelineStep } from '../types/upload';
import type { GoogleReverseResponse, FaceSearchResponse } from '../types/api';
import { formatFileSize } from '../utils/formatters';
import { executeVerificationPipeline } from '../services/verificationPipeline';

interface ContinueSuccessModalProps {
  image: UploadedFaceImage | null;
  isOpen: boolean;
  onClose: () => void;
  onStepChange?: (step: PipelineStep) => void;
}

export const ContinueSuccessModal: React.FC<ContinueSuccessModalProps> = ({
  image,
  isOpen,
  onClose,
  onStepChange,
}) => {
  const [overrideHash, setOverrideHash] = useState<string | null>(null);
  const [pipelineRunning, setPipelineRunning] = useState<boolean>(false);
  const [pipelineCompleted, setPipelineCompleted] = useState<boolean>(false);
  const [activeSubStep, setActiveSubStep] = useState<number>(1);
  const [reverseData, setReverseData] = useState<GoogleReverseResponse | null>(null);
  const [searchResponse, setSearchResponse] = useState<FaceSearchResponse | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  const hash =
    overrideHash ||
    image?.blockchainHash ||
    (image?.file ? 'Ready for Google Reverse API blockchain hash...' : 'Computing SHA-256 fingerprint...');

  const handleClose = () => {
    setOverrideHash(null);
    setPipelineRunning(false);
    setPipelineCompleted(false);
    setActiveSubStep(1);
    setPipelineError(null);
    setReverseData(null);
    setSearchResponse(null);
    onClose();
  };

  if (!isOpen || !image) return null;

  const handleStartPipeline = async () => {
    if (pipelineRunning) return;

    setPipelineRunning(true);
    setPipelineError(null);
    setActiveSubStep(1);
    onStepChange?.('search');

    try {
      // Execute the required async flow:
      // Image Upload/Capture → Face Detection → Blockchain Hash (via Google Reverse API) → Face Embedding Vector → POST Face Search API
      const result = await executeVerificationPipeline(
        image.file,
        image.faceDetection,
        (progress) => {
          if (progress.subStepIndex) {
            setActiveSubStep(progress.subStepIndex);
          }
          if (progress.reverseData) {
            setReverseData(progress.reverseData);
            setOverrideHash(progress.reverseData.blockchainHash);
          }
          if (progress.searchResponse) {
            setSearchResponse(progress.searchResponse);
          }
        }
      );

      setReverseData(result.reverseData);
      setOverrideHash(result.reverseData.blockchainHash);
      setSearchResponse(result.searchResponse);
      setPipelineCompleted(true);
      setActiveSubStep(3);
      onStepChange?.('blockchain');
    } catch (err) {
      const msg = (err as Error).message || 'Pipeline verification encountered an error.';
      setPipelineError(msg);
    } finally {
      setPipelineRunning(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Face Image Accepted</h3>
              <p className="text-xs text-slate-400">
                Payload validated and prepared for pipeline execution
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4">
          {/* Summary Box */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <img
              src={image.previewUrl}
              alt="Face Preview"
              className="w-16 h-16 rounded-xl object-cover border border-slate-700"
            />
            <div className="min-w-0 flex-1 text-xs space-y-1">
              <div className="text-slate-200 font-semibold truncate">{image.file.name}</div>
              <div className="text-slate-400">
                Size: <span className="text-slate-300 font-medium">{formatFileSize(image.file.size)}</span>
                {image.dimensions && (
                  <span>
                    {' '}• {image.dimensions.width} × {image.dimensions.height} px
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>
                  {image.faceDetection?.hasFace
                    ? 'Biometric face detected (128D embedding vector ready)'
                    : 'Biometric scan encoding validated'}
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Hash */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-indigo-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
                <Hash className="w-3.5 h-3.5" />
                <span>Image SHA-256 Digest (Blockchain Payload):</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Keccak-ready</span>
            </div>
            <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-indigo-200 break-all select-all border border-slate-800">
              {hash}
            </div>
          </div>

          {/* Pipeline Error Banner if any */}
          {pipelineError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-200 text-xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-rose-300">Pipeline Execution Error</div>
                <p className="mt-0.5 text-rose-200/90">{pipelineError}</p>
              </div>
            </div>
          )}

          {/* Pipeline Stage Preview */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Subsequent Pipeline Stages
            </h4>

            <div className="space-y-2">
              {/* Step 1: Face Detection & 128D Embedding */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  activeSubStep === 1 && pipelineRunning
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                    : activeSubStep > 1 || pipelineCompleted
                    ? 'bg-slate-900/60 border-emerald-500/30 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-semibold text-slate-200">1. Face Detection & 128D Embedding</div>
                    <div className="text-[11px] text-slate-400">
                      {activeSubStep > 1 || pipelineCompleted
                        ? '128D facial feature vector extracted & normalized'
                        : 'Extracts face coordinates & vector embeddings'}
                    </div>
                  </div>
                </div>
                {activeSubStep > 1 || pipelineCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : pipelineRunning && activeSubStep === 1 ? (
                  <span className="text-[10px] text-indigo-300 animate-pulse">Running...</span>
                ) : null}
              </div>

              {/* Step 2: Google Reverse API */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  activeSubStep === 2 && pipelineRunning
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                    : activeSubStep > 2 || pipelineCompleted
                    ? 'bg-slate-900/60 border-emerald-500/30 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-violet-400" />
                  <div>
                    <div className="font-semibold text-slate-200">2. Reverse Image & Social Search</div>
                    <div className="text-[11px] text-slate-400">
                      {reverseData?.matchedSocialPost
                        ? `Discovered match: ${reverseData.matchedSocialPost.author} (${reverseData.matchedSocialPost.platform})`
                        : 'Discovers matching public social post source'}
                    </div>
                  </div>
                </div>
                {activeSubStep > 2 || pipelineCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : activeSubStep === 2 && pipelineRunning ? (
                  <span className="text-[10px] text-violet-300 animate-pulse">Searching...</span>
                ) : null}
              </div>

              {/* Step 3: Blockchain Attestation & POST Face Search API */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  pipelineCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                    : activeSubStep === 3 && pipelineRunning
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-slate-200">3. Polygon Amoy Smart Contract Attestation</div>
                    <div className="text-[11px] text-slate-400">
                      {searchResponse?.transactionHash
                        ? `Tx: ${searchResponse.transactionHash.slice(0, 10)}...${searchResponse.transactionHash.slice(-8)} (Score: ${Math.round((searchResponse.similarityScore || 0.96) * 100)}%)`
                        : 'Publishes tamper-proof hash proof to testnet'}
                    </div>
                  </div>
                </div>
                {pipelineCompleted ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                    Verified On-Chain
                  </span>
                ) : activeSubStep === 3 && pipelineRunning ? (
                  <span className="text-[10px] text-indigo-300 animate-pulse">Attesting...</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Upload</span>
          </button>

          {!pipelineRunning ? (
            <button
              type="button"
              onClick={handleStartPipeline}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {pipelineCompleted ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-run Pipeline</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Simulate Full Pipeline</span>
                </>
              )}
            </button>
          ) : (
            <div className="text-xs text-indigo-400 font-medium animate-pulse">
              Pipeline processing active...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
