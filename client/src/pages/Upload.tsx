import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { CameraCapture } from '@/components/CameraCapture';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { extractOdometerReading } from '@/lib/ocr';
import { apiRequest } from '@/lib/queryClient';

const DEMO_VEHICLE = 'DEMO4774';

export default function Upload() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrReading, setOcrReading] = useState<number | null>(null);
  const [manualReading, setManualReading] = useState<string>('');
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [showCamera, setShowCamera] = useState(true);

  // Auto-start camera when component mounts
  useEffect(() => {
    setShowCamera(true);
  }, []);

  const uploadMutation = useMutation({
    mutationFn: async (data: {
      vehicleNumber: string;
      odometerImageUrl: string;
      km: number;
    }) => {
      const response = await apiRequest('POST', '/api/upload-odometer', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Odometer reading uploaded successfully!',
      });
      
      // Reset form
      setCapturedImage(null);
      setOcrReading(null);
      setManualReading('');
      
      // Invalidate wallet data to refresh balance
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to upload reading',
        variant: 'destructive',
      });
    },
  });

  const handleImageCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setShowCamera(false);
    setIsProcessingOCR(true);
    
    try {
      const reading = await extractOdometerReading(imageData);
      setOcrReading(reading);
      if (reading) {
        setManualReading(reading.toString());
      }
    } catch (error) {
      console.error('OCR failed:', error);
      toast({
        title: 'OCR Processing Failed',
        description: 'Please enter the reading manually',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleSubmit = () => {
    const reading = parseInt(manualReading, 10);
    
    if (!reading || reading <= 0) {
      toast({
        title: t('common.error'),
        description: 'Please enter a valid kilometer reading',
        variant: 'destructive',
      });
      return;
    }

    if (!capturedImage) {
      toast({
        title: t('common.error'),
        description: 'Please capture an odometer image first',
        variant: 'destructive',
      });
      return;
    }

    uploadMutation.mutate({
      vehicleNumber: DEMO_VEHICLE,
      odometerImageUrl: capturedImage,
      km: reading,
    });
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/40 min-h-screen relative">
      {!showCamera && <Header />}
      
      <div className={showCamera ? "" : "px-4 pb-24"}>
        {showCamera ? (
          <div className="fixed inset-0 bg-black z-50">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4 pt-8">
              <div className="flex items-center justify-between text-white">
                <button 
                  onClick={() => window.history.back()}
                  className="p-2 rounded-full bg-black/30 backdrop-blur-sm"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="text-center">
                  <h1 className="text-lg font-semibold">Scan Odometer</h1>
                  <p className="text-sm text-gray-300">Position within the frame</p>
                </div>
                
                <div className="w-10 h-10"></div> {/* Spacer */}
              </div>
            </div>

            {/* Camera with UPI-style overlay */}
            <div className="relative h-full">
              <CameraCapture 
                onCapture={handleImageCapture}
                isProcessing={isProcessingOCR || uploadMutation.isPending}
                fullScreen={true}
              />
              
              {/* UPI-style scanner overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Dark overlay with cut-out */}
                <div className="absolute inset-0 bg-black/60">
                  <div className="absolute inset-x-8 top-1/2 transform -translate-y-1/2 h-40 bg-transparent border-2 border-white rounded-xl shadow-2xl">
                    {/* Corner indicators */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                  </div>
                </div>
                
                {/* Instruction text */}
                <div className="absolute bottom-32 left-0 right-0 text-center text-white px-8">
                  <p className="text-lg font-medium mb-2">Position odometer reading in frame</p>
                  <p className="text-sm text-gray-300">Make sure the numbers are clearly visible</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 bg-white z-50">
            {/* Header */}
            <div className="bg-white shadow-sm p-4 border-b">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setShowCamera(true)}
                  className="p-2 rounded-full bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <h1 className="text-lg font-semibold">Confirm Reading</h1>
                
                <div className="w-10 h-10"></div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Captured image preview */}
              {capturedImage && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <img 
                    src={capturedImage} 
                    alt="Captured odometer" 
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
              )}

              <div>
                <Label className="text-base font-medium">{t('upload.vehicleNumber')}</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-xl">
                  <span className="text-lg font-mono">{DEMO_VEHICLE}</span>
                </div>
              </div>

              {capturedImage && (
                <div>
                  <Label htmlFor="km-reading" className="text-base font-medium">{t('upload.enterKm')}</Label>
                  <Input
                    id="km-reading"
                    type="number"
                    value={manualReading}
                    onChange={(e) => setManualReading(e.target.value)}
                    placeholder="Enter kilometer reading"
                    className="mt-2 text-2xl font-mono text-center py-4 border-2 rounded-xl"
                  />
                  {ocrReading && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-green-700 font-medium">Auto-detected: {ocrReading} km</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom action */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
              {capturedImage && manualReading && (
                <Button 
                  onClick={handleSubmit}
                  disabled={uploadMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 rounded-xl text-lg"
                  size="lg"
                >
                  {uploadMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {t('upload.processing')}
                    </div>
                  ) : (
                    t('upload.submit')
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {!showCamera && <BottomNavigation />}
    </div>
  );
}
