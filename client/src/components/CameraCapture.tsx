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
  const [isVideoReady, setIsVideoReady] = useState(false);
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
      console.log('Starting camera...');
      setError(null);
      setIsVideoReady(false);
      const mediaStream = await startCamera();
      console.log('Camera stream obtained:', mediaStream);
      setStream(mediaStream);
      setIsActive(true);
      
      if (videoRef.current) {
        console.log('Setting video source...');
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        const video = videoRef.current;
        const handleLoadedData = () => {
          console.log('Video loaded successfully');
          setIsVideoReady(true);
          video.removeEventListener('loadeddata', handleLoadedData);
        };
        
        video.addEventListener('loadeddata', handleLoadedData);
        
        // Also try to play the video
        try {
          await video.play();
          console.log('Video playing');
        } catch (playError) {
          console.warn('Video autoplay failed:', playError);
          // Try to play without await
          video.play().catch(e => console.warn('Final play attempt failed:', e));
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      if (error instanceof CameraError) {
        setError(error.message);
      } else {
        setError(`Failed to start camera: ${error}`);
      }
    }
  };

  // Auto-start camera when component mounts
  useEffect(() => {
    if (!isActive && !stream && !capturedImage) {
      console.log('Auto-starting camera on mount');
      handleStartCamera();
    }
  }, []); // Only run on mount

  const handleCapture = () => {
    if (videoRef.current && stream && isVideoReady) {
      try {
        // Check if video has content
        if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
          throw new Error('Video not ready for capture');
        }
        
        const imageData = captureImage(videoRef.current);
        setCapturedImage(imageData);
        stopCamera(stream);
        setStream(null);
        setIsActive(false);
        setIsVideoReady(false);
      } catch (error) {
        console.error('Capture error:', error);
        setError(`Failed to capture image: ${error}`);
      }
    } else {
      setError('Camera not ready. Please wait and try again.');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsVideoReady(false);
    handleStartCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-700 mb-4 font-medium">{error}</p>
        <Button 
          onClick={handleStartCamera} 
          variant="outline" 
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
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
        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            onLoadedData={() => setIsVideoReady(true)}
            onError={(e) => setError(`Video error: ${e.currentTarget.error?.message || 'Unknown error'}`)}
          />
          
          {!isVideoReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
              <div className="text-center text-white">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm">Loading camera...</p>
              </div>
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleCapture} 
          disabled={!isVideoReady}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          <Camera className="w-5 h-5 mr-2" />
          {isVideoReady ? 'Capture Odometer' : 'Preparing Camera...'}
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center p-8">
      <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Camera className="w-16 h-16 text-green-600" />
      </div>
      <p className="text-gray-700 mb-6 text-lg">Position your phone camera over the odometer</p>
      <Button 
        onClick={handleStartCamera} 
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 rounded-xl shadow-lg"
        size="lg"
      >
        <Camera className="w-5 h-5 mr-2" />
        {t('upload.takePhoto')}
      </Button>
    </div>
  );
}
