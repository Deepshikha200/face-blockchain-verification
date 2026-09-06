export interface ImageDimensions {
  width: number;
  height: number;
}

export interface UploadedFaceImage {
  file: File;
  previewUrl: string;
  dimensions?: ImageDimensions;
  uploadedAt: Date;
}

export interface ValidationError {
  type: 'INVALID_TYPE' | 'EXCEEDS_SIZE' | 'CORRUPT_IMAGE' | 'UNKNOWN';
  message: string;
  details?: string;
}

export interface FaceImageUploadProps {
  onContinue?: (data: UploadedFaceImage) => void;
  onImageSelect?: (data: UploadedFaceImage | null) => void;
  maxSizeBytes?: number; // default: 10MB
  acceptedFormats?: string[]; // default: ['image/jpeg', 'image/png', 'image/jpg']
  acceptedExtensions?: string[]; // default: ['.jpg', '.jpeg', '.png']
  title?: string;
  subtitle?: string;
  disabled?: boolean;
  className?: string;
}

export type PipelineStep = 'upload' | 'search' | 'blockchain';
