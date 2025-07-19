import { useState } from 'react';
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
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      <Header />
      
      <div className="px-4 pb-24">
        <Card>
          <CardHeader>
            <CardTitle>{t('upload.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>{t('upload.vehicleNumber')}</Label>
              <Input value={DEMO_VEHICLE} disabled className="mt-1" />
            </div>

            <div>
              <Label className="mb-2 block">Odometer Photo</Label>
              <CameraCapture 
                onCapture={handleImageCapture}
                isProcessing={isProcessingOCR || uploadMutation.isPending}
              />
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
                  className="mt-1"
                />
                {ocrReading && (
                  <p className="text-sm text-green-600 mt-1">
                    OCR detected: {ocrReading} km
                  </p>
                )}
              </div>
            )}

            {capturedImage && manualReading && (
              <Button 
                onClick={handleSubmit}
                disabled={uploadMutation.isPending}
                className="w-full"
              >
                {uploadMutation.isPending ? t('upload.processing') : t('upload.submit')}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
