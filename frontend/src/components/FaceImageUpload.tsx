import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileCheck2,
  X,
  ScanLine,
} from 'lucide-react';
import type {
  FaceImageUploadProps,
  UploadedFaceImage,
  ValidationError,
} from '../types/upload';
import {
  formatFileSize,
  isValidImageType,
  getImageDimensions,
} from '../utils/formatters';
import {
  detectFaceFromImage,
  NO_FACE_ERROR_MESSAGE,
  MULTIPLE_FACES_ERROR_MESSAGE,
} from '../services/faceDetectionService';

const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const DEFAULT_FORMATS = ['image/jpeg', 'image/png', 'image/jpg'];
const DEFAULT_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

export const FaceImageUpload: React.FC<FaceImageUploadProps> = ({
  onContinue,
  onImageSelect,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  acceptedFormats = DEFAULT_FORMATS,
  acceptedExtensions = DEFAULT_EXTENSIONS,
  title = 'Upload Face Image',
  subtitle = 'Provide a high-quality front-facing photo for facial recognition and tamper-proof blockchain attestation.',
  disabled = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedFaceImage | null>(null);
  const [error, setError] = useState<ValidationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  // Clean up object URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (uploadedImage?.previewUrl) {
        URL.revokeObjectURL(uploadedImage.previewUrl);
      }
    };
  }, [uploadedImage]);

  // Handle incoming file with validation
  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      // 1. File Type Validation
      if (!isValidImageType(file, acceptedFormats, acceptedExtensions)) {
        setError({
          type: 'INVALID_TYPE',
          message: 'Unsupported file format.',
          details: `Please upload a valid ${acceptedExtensions.join(', ').toUpperCase()} image file.`,
        });
        return;
      }

      // 2. File Size Validation
      if (file.size > maxSizeBytes) {
        const formattedMax = formatFileSize(maxSizeBytes);
        const formattedActual = formatFileSize(file.size);
        setError({
          type: 'EXCEEDS_SIZE',
          message: `File size exceeds the ${formattedMax} limit.`,
          details: `Your image is ${formattedActual}. Please compress or choose a smaller image.`,
        });
        return;
      }

      // 3. Image decodability & dimension extraction
      setIsLoading(true);
      try {
        const dimensions = await getImageDimensions(file);

        // 4. Face Detection: verify image contains exactly ONE human face before continuing
        const faceResult = await detectFaceFromImage(file);
        if (!faceResult.hasFace || faceResult.faceCount !== 1) {
          const isMultiple = faceResult.faceCount > 1;
          setError({
            type: isMultiple ? 'MULTIPLE_FACES_DETECTED' : 'NO_FACE_DETECTED',
            message: isMultiple ? MULTIPLE_FACES_ERROR_MESSAGE : NO_FACE_ERROR_MESSAGE,
            details: faceResult.details || (isMultiple
              ? 'Please upload an image containing only one face.'
              : 'Biometric analysis did not locate any facial features or contours in this image.'),
          });

          // Stop the flow: revoke any existing preview and reset selection
          if (uploadedImage?.previewUrl) {
            URL.revokeObjectURL(uploadedImage.previewUrl);
          }
          setUploadedImage(null);
          onImageSelect?.(null);
          return;
        }

        const previewUrl = URL.createObjectURL(file);

        const newImage: UploadedFaceImage = {
          file,
          previewUrl,
          dimensions,
          uploadedAt: new Date(),
          faceDetection: faceResult,
          faceHash: faceResult.faceHash,
          blockchainHash: faceResult.faceHash,
          faceEmbeddingVector: faceResult.faceEmbeddingVector,
        };

        // Revoke previous URL if any
        if (uploadedImage?.previewUrl) {
          URL.revokeObjectURL(uploadedImage.previewUrl);
        }

        setUploadedImage(newImage);
        onImageSelect?.(newImage);
      } catch (err) {
        console.error('Failed to load image:', err);
        setError({
          type: 'CORRUPT_IMAGE',
          message: 'Could not decode image.',
          details: 'The uploaded file appears to be corrupted or not an interpretable image.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [acceptedFormats, acceptedExtensions, maxSizeBytes, onImageSelect, uploadedImage]
  );

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only turn off if leaving the main container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      processFile(droppedFile);
    }
  };

  // Native input change handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      processFile(selectedFile);
    }
    // Reset native input so selecting the same file again triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove current image
  const handleRemoveImage = () => {
    if (uploadedImage?.previewUrl) {
      URL.revokeObjectURL(uploadedImage.previewUrl);
    }
    setUploadedImage(null);
    setError(null);
    onImageSelect?.(null);
  };

  // Trigger file picker
  const triggerFilePicker = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  // Continue handler
  const handleContinue = () => {
    if (!uploadedImage || disabled) return;
    onContinue?.(uploadedImage);
  };

  return (
    <div
      className={`w-full max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl shadow-black/60 transition-all ${className}`}
    >
      {/* Header Info */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Biometric Verification Step 1</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        id="face-image-input"
        accept={acceptedExtensions.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
        aria-label="Upload Face Image File"
      />

      {/* Error Alert Message */}
      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3.5 text-rose-200 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 text-left">
            <h4 className="text-sm font-semibold text-rose-300">{error.message}</h4>
            {error.details && (
              <p className="text-xs text-rose-200/80 mt-0.5 leading-normal">{error.details}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Upload / Preview Area */}
      {!uploadedImage ? (
        /* ================= UPLOAD DROPZONE ================= */
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFilePicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              triggerFilePicker();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Drag and drop or click to upload face image"
          className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01] shadow-lg shadow-indigo-500/10'
              : 'border-slate-700/80 hover:border-indigo-500/60 hover:bg-slate-850/50 bg-slate-950/40'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {/* Subtle Decorative Grid Pattern */}
          <div className="absolute inset-0 rounded-2xl opacity-10 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative flex flex-col items-center justify-center">
            {/* Upload Icon with Animated Glow */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                isDragging
                  ? 'bg-indigo-600 text-white scale-110 shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-500/20'
                  : 'bg-slate-800/80 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-indigo-500/25'
              }`}
            >
              {isLoading ? (
                <RefreshCw className="w-8 h-8 animate-spin text-white" />
              ) : isDragging ? (
                <ScanLine className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
              ) : (
                <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:-translate-y-0.5" />
              )}
            </div>

            {/* Main Action Text */}
            <div className="space-y-1.5 mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-100 group-hover:text-indigo-200 transition-colors">
                {isDragging ? 'Drop your face photo here' : 'Drag & drop face image here'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                or click the button below to browse from your device
              </p>
            </div>

            {/* "Upload Face Image" CTA Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerFilePicker();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all active:scale-95 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Upload Face Image</span>
            </button>

            {/* Formats and Size Specification */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-medium text-slate-300">
                Supported formats: JPG, JPEG, PNG
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-medium text-slate-300">
                Max file size: {formatFileSize(maxSizeBytes)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ================= FACE IMAGE PREVIEW ================= */
        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative rounded-2xl bg-slate-950/70 border border-slate-800 p-4 sm:p-6 overflow-hidden">
            {/* Top Status Bar */}
            <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-semibold text-emerald-400">
                  Face Image Loaded & Ready
                </span>
              </div>

              {/* Action Buttons: Replace & Remove */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                  title="Select a different image"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Replace Image</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/20 transition-colors cursor-pointer"
                  title="Remove this image"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Remove</span>
                </button>
              </div>
            </div>

            {/* Preview Frame with Biometric Reticle */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Image Preview Container */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/60 shadow-inner group">
                <img
                  src={uploadedImage.previewUrl}
                  alt="Uploaded Face Preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Biometric Scanning Overlay & Corner Reticles */}
                <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
                  {/* Top corners */}
                  <div className="flex justify-between">
                    <div className="w-3.5 h-3.5 border-t-2 border-l-2 border-indigo-400" />
                    <div className="w-3.5 h-3.5 border-t-2 border-r-2 border-indigo-400" />
                  </div>

                  {/* Horizontal animated laser line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-scan-line" />

                  {/* Bottom corners */}
                  <div className="flex justify-between">
                    <div className="w-3.5 h-3.5 border-b-2 border-l-2 border-indigo-400" />
                    <div className="w-3.5 h-3.5 border-b-2 border-r-2 border-indigo-400" />
                  </div>
                </div>

                {/* Badge overlay */}
                <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-center text-slate-300 font-mono border border-slate-700/50 truncate">
                  Face Detection Ready
                </div>
              </div>

              {/* Metadata Details */}
              <div className="flex-1 w-full space-y-3">
                <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">File Name:</span>
                    <span
                      className="font-medium text-slate-200 truncate max-w-[180px] sm:max-w-[240px]"
                      title={uploadedImage.file.name}
                    >
                      {uploadedImage.file.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">File Size:</span>
                    <span className="font-medium text-slate-200">
                      {formatFileSize(uploadedImage.file.size)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Format:</span>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
                      {uploadedImage.file.type || 'Image'}
                    </span>
                  </div>

                  {uploadedImage.dimensions && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Resolution:</span>
                      <span className="font-mono text-slate-300">
                        {uploadedImage.dimensions.width} × {uploadedImage.dimensions.height} px
                      </span>
                    </div>
                  )}
                </div>

                {/* Verification checklist pills */}
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Valid format verified ({acceptedExtensions.join(', ').toUpperCase()})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Payload within {formatFileSize(maxSizeBytes)} limit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Ready for web reverse search & blockchain hash creation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines Accordion / Tips */}
      <div className="mt-6 pt-5 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span className="font-medium text-slate-300">Best practice guidelines:</span>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/50 text-slate-300">
              Direct front view
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/50 text-slate-300">
              Clear ambient lighting
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/50 text-slate-300">
              No face covering
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action / Continue Bar */}
      <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          {uploadedImage ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1.5 justify-center sm:justify-start">
              <CheckCircle2 className="w-4 h-4" />
              Face image verified. Click continue to initiate pipeline.
            </span>
          ) : (
            <span>Please select or drop a face image to continue.</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!uploadedImage || disabled}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
            uploadedImage && !disabled
              ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
          }`}
          aria-label="Continue to next verification step"
        >
          <span>Continue</span>
          <ArrowRight className={`w-4 h-4 ${uploadedImage ? 'animate-pulse' : ''}`} />
        </button>
      </div>
    </div>
  );
};
