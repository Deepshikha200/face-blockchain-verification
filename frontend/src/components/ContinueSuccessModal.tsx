import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Hash,
  ExternalLink,
  ArrowLeft,
  Search,
  Cpu,
  Fingerprint,
} from 'lucide-react';
import type { UploadedFaceImage } from '../types/upload';
import { calculateSHA256, formatFileSize } from '../utils/formatters';

interface ContinueSuccessModalProps {
  image: UploadedFaceImage | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContinueSuccessModal: React.FC<ContinueSuccessModalProps> = ({
  image,
  isOpen,
  onClose,
}) => {
  const [hash, setHash] = useState<string>('Computing SHA-256 fingerprint...');
  const [pipelineSimulating, setPipelineSimulating] = useState<boolean>(false);
  const [activeSubStep, setActiveSubStep] = useState<number>(1);

  useEffect(() => {
    if (image?.file) {
      calculateSHA256(image.file).then((digest) => {
        setHash(digest);
      });
    }
  }, [image]);

  if (!isOpen || !image) return null;

  const handleStartSimulation = () => {
    setPipelineSimulating(true);
    setActiveSubStep(1);
    setTimeout(() => {
      setActiveSubStep(2);
    }, 1500);
    setTimeout(() => {
      setActiveSubStep(3);
    }, 3000);
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
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg text-xs hover:bg-slate-800 transition-colors"
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
                <span>Biometric scan encoding validated</span>
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

          {/* Pipeline Stage Preview */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Subsequent Pipeline Stages
            </h4>

            <div className="space-y-2">
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  activeSubStep === 1
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-semibold text-slate-200">1. Face Detection & 128D Embedding</div>
                    <div className="text-[11px] text-slate-400">Extracts face coordinates & vector embeddings</div>
                  </div>
                </div>
                {activeSubStep > 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : pipelineSimulating ? (
                  <span className="text-[10px] text-indigo-300 animate-pulse">Running...</span>
                ) : null}
              </div>

              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  activeSubStep === 2
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-violet-400" />
                  <div>
                    <div className="font-semibold text-slate-200">2. Reverse Image & Social Search</div>
                    <div className="text-[11px] text-slate-400">Discovers matching public social post source</div>
                  </div>
                </div>
                {activeSubStep > 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : activeSubStep === 2 && pipelineSimulating ? (
                  <span className="text-[10px] text-violet-300 animate-pulse">Searching...</span>
                ) : null}
              </div>

              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  activeSubStep === 3
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-slate-200">3. Polygon Amoy Smart Contract Attestation</div>
                    <div className="text-[11px] text-slate-400">Publishes tamper-proof hash proof to testnet</div>
                  </div>
                </div>
                {activeSubStep === 3 && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                    Verified On-Chain
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Upload</span>
          </button>

          {!pipelineSimulating ? (
            <button
              type="button"
              onClick={handleStartSimulation}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Simulate Full Pipeline</span>
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
