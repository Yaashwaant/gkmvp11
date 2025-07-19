import { createHash } from 'crypto';

export function generateImageHash(imageData: string): string {
  return createHash('sha256').update(imageData).digest('hex');
}

export function generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
  const fingerprint = `${userAgent}-${ipAddress}-${Date.now()}`;
  return createHash('md5').update(fingerprint).digest('hex');
}

export function extractImageMetadata(imageBase64: string): string {
  try {
    // Extract basic metadata from base64 image
    const header = imageBase64.substring(0, 100);
    const metadata = {
      format: header.includes('jpeg') ? 'JPEG' : header.includes('png') ? 'PNG' : 'Unknown',
      size: imageBase64.length,
      timestamp: new Date().toISOString(),
      software: 'Browser-Capture' // Assume browser capture unless otherwise detected
    };
    return JSON.stringify(metadata);
  } catch {
    return JSON.stringify({ error: 'Could not extract metadata' });
  }
}

export function validateLocationAccuracy(location: string): number {
  try {
    const locationData = JSON.parse(location);
    return locationData.accuracy || 1000; // Default to poor accuracy if not provided
  } catch {
    return 1000; // Poor accuracy for invalid location data
  }
}