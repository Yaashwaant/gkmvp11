import { useState, useRef, useEffect } from 'react';
import { Camera, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startCamera, stopCamera, captureImage, CameraError } from '@/lib/camera';
import { useLanguage } from '@/hooks/useLanguage';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  isProcessing?: boolean;
}

export function CameraCapture({ onCapture, isProcessing = false }: CameraCaptureProps) {
  const { t } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stopCamera(stream);
      }
    };
  }, [stream]);

  const handleStartCamera = async () => {
    try {
      setError(null);
      const mediaStream = await startCamera();
      setStream(mediaStream);
      setIsActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      if (error instanceof CameraError) {
        setError(error.message);
      } else {
        setError('Failed to start camera');
      }
    }
  };

  const handleCapture = () => {
    if (videoRef.current && stream) {
      try {
        const imageData = captureImage(videoRef.current);
        setCapturedImage(imageData);
        stopCamera(stream);
        setStream(null);
        setIsActive(false);
      } catch (error) {
        setError('Failed to capture image');
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    handleStartCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={handleStartCamera} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (capturedImage) {
    return (
      <div className="space-y-4">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={capturedImage} 
            alt="Captured odometer" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleRetake} 
            variant="outline" 
            className="flex-1"
            disabled={isProcessing}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('upload.retake')}
          </Button>
          <Button 
            onClick={handleConfirm} 
            className="flex-1"
            disabled={isProcessing}
          >
            <Check className="w-4 h-4 mr-2" />
            {isProcessing ? t('upload.processing') : t('common.submit')}
          </Button>
        </div>
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="space-y-4">
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
        <Button onClick={handleCapture} className="w-full">
          <Camera className="w-4 h-4 mr-2" />
          Capture
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center p-8">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Camera className="w-12 h-12 text-gray-400" />
      </div>
      <p className="text-gray-600 mb-4">Position your phone camera over the odometer</p>
      <Button onClick={handleStartCamera} className="w-full">
        <Camera className="w-4 h-4 mr-2" />
        {t('upload.takePhoto')}
      </Button>
    </div>
  );
}
