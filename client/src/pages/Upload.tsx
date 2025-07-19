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
      <Header />
      
      <div className="px-4 pb-24">
        {showCamera ? (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('upload.title')}</h1>
              <p className="text-gray-600">Position your odometer within the frame</p>
            </div>
            
            <div className="relative">
              <CameraCapture 
                onCapture={handleImageCapture}
                isProcessing={isProcessingOCR || uploadMutation.isPending}
              />
              
              {/* Overlay rectangle guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-32 border-4 border-green-500 rounded-lg bg-transparent shadow-lg">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Align odometer here
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center">Confirm Reading</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>{t('upload.vehicleNumber')}</Label>
                <Input value={DEMO_VEHICLE} disabled className="mt-1 bg-gray-50" />
              </div>

              {capturedImage && (
                <div>
                  <Label htmlFor="km-reading">{t('upload.enterKm')}</Label>
                  <Input
                    id="km-reading"
                    type="number"
                    value={manualReading}
                    onChange={(e) => setManualReading(e.target.value)}
                    placeholder="Enter kilometer reading"
                    className="mt-1 text-lg font-medium"
                  />
                  {ocrReading && (
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      OCR detected: {ocrReading} km
                    </p>
                  )}
                </div>
              )}

              <div className="flex space-x-3">
                <Button 
                  onClick={() => setShowCamera(true)}
                  variant="outline"
                  className="flex-1"
                >
                  Retake Photo
                </Button>
                {capturedImage && manualReading && (
                  <Button 
                    onClick={handleSubmit}
                    disabled={uploadMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                  >
                    {uploadMutation.isPending ? t('upload.processing') : t('upload.submit')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}
