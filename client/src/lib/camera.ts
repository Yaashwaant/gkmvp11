export class CameraError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CameraError';
  }
}

export async function startCamera(): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new CameraError('Camera not supported on this device');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Use back camera on mobile
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    return stream;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new CameraError('Camera permission denied');
      } else if (error.name === 'NotFoundError') {
        throw new CameraError('No camera found');
      } else if (error.name === 'NotReadableError') {
        throw new CameraError('Camera is being used by another application');
      }
    }
    throw new CameraError('Failed to access camera');
  }
}

export function stopCamera(stream: MediaStream): void {
  stream.getTracks().forEach(track => track.stop());
}

export function captureImage(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const context = canvas.getContext('2d');
  if (!context) {
    throw new CameraError('Failed to get canvas context');
  }
  
  context.drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8);
}
