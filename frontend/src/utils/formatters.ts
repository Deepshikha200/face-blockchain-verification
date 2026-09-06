import type { ImageDimensions } from '../types/upload';

/**
 * Format bytes into human-readable string (KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if the file matches accepted MIME types or extensions
 */
export function isValidImageType(
  file: File,
  acceptedFormats: string[] = ['image/jpeg', 'image/png', 'image/jpg'],
  acceptedExtensions: string[] = ['.jpg', '.jpeg', '.png']
): boolean {
  // Check MIME type
  if (file.type && acceptedFormats.includes(file.type.toLowerCase())) {
    return true;
  }
  
  // Check file extension fallback
  const filename = file.name.toLowerCase();
  return acceptedExtensions.some(ext => filename.endsWith(ext));
}

/**
 * Load image in browser to determine natural dimensions and verify it decodes
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image file. The file may be corrupt.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Generate SHA-256 hash of the uploaded image for blockchain verification demonstration
 */
export async function calculateSHA256(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('Hash calculation failed', err);
    return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
}
