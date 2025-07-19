import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Header } from '@/components/Header';
import { CameraCapture } from '@/components/CameraCapture';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { apiRequest } from '@/lib/queryClient';

export default function Register() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleNumber: '',
  });
  const [rcImage, setRcImage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'form' | 'rc-capture'>('form');

  const registerMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      vehicleNumber: string;
      rcImageUrl?: string;
    }) => {
      const response = await apiRequest('POST', '/api/register', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Vehicle registered successfully!',
      });
      navigate('/wallet');
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Registration failed',
        variant: 'destructive',
      });
    },
  });

  const handleFormSubmit = () => {
    if (!formData.name || !formData.phone || !formData.vehicleNumber) {
      toast({
        title: t('common.error'),
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setCurrentStep('rc-capture');
  };

  const handleRcCapture = (imageData: string) => {
    setRcImage(imageData);
  };

  const handleRegister = () => {
    registerMutation.mutate({
      ...formData,
      rcImageUrl: rcImage || undefined,
    });
  };

  const handleSkip = () => {
    navigate('/wallet');
  };

  if (currentStep === 'rc-capture') {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
        <Header />
        
        <div className="px-4 pb-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('register.rcPhoto')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CameraCapture 
                onCapture={handleRcCapture}
                isProcessing={registerMutation.isPending}
              />
              
              {rcImage && (
                <div className="mt-4 space-y-2">
                  <Button 
                    onClick={handleRegister}
                    disabled={registerMutation.isPending}
                    className="w-full"
                  >
                    {registerMutation.isPending ? 'Registering...' : t('register.register')}
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep('form')}
                    variant="outline"
                    className="w-full"
                  >
                    Back
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <Header />
      
      <div className="px-4 pb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('register.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">{t('register.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">{t('register.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 9876543210"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="vehicle">{t('register.vehicleNumber')}</Label>
              <Input
                id="vehicle"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value.toUpperCase() }))}
                placeholder="MH01AB1234"
                className="mt-1"
              />
            </div>

            <div className="space-y-2 pt-4">
              <Button onClick={handleFormSubmit} className="w-full">
                Next: Capture RC
              </Button>
              <Button onClick={handleSkip} variant="outline" className="w-full">
                {t('register.skip')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
