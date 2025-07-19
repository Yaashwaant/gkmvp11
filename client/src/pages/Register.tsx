import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, ArrowRight, User, Phone, Car } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { apiRequest } from '@/lib/queryClient';
import { insertUserSchema } from '@shared/schema';
import { CameraCapture } from '@/components/CameraCapture';

const formSchema = insertUserSchema.extend({
  phone: z.string().min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  vehicleNumber: z.string().min(4, 'Vehicle number is required')
    .regex(/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/, 'Enter valid vehicle number (e.g., MH12AB1234)')
});

export default function Register() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rcImage, setRcImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      vehicleNumber: '',
      rcImageUrl: undefined,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest('POST', '/api/register', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful!",
        description: "Welcome to GreenKarma Wallet. Start earning rewards for your eco-friendly driving.",
      });
      // Store user vehicle number in localStorage for session
      if (data.user && data.user.vehicleNumber) {
        localStorage.setItem('currentVehicleNumber', data.user.vehicleNumber);
        localStorage.setItem('currentUserName', data.user.name);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      // Navigate to wallet page
      window.location.href = '/wallet';
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const dataToSubmit = {
      ...values,
      rcImageUrl: rcImage || undefined,
    };
    registerMutation.mutate(dataToSubmit);
  };

  const handleRcCapture = (imageData: string) => {
    setRcImage(imageData);
    setShowCamera(false);
    form.setValue('rcImageUrl', imageData);
  };

  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* Camera Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4 pt-8">
          <div className="flex items-center justify-between text-white">
            <button 
              onClick={() => setShowCamera(false)}
              className="p-2 rounded-full bg-black/30 backdrop-blur-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center">
              <h1 className="text-lg font-semibold">Scan RC Document</h1>
              <p className="text-sm text-gray-300">Position document within the frame</p>
            </div>
            
            <div className="w-10 h-10"></div>
          </div>
        </div>

        {/* Camera with overlay */}
        <div className="relative h-full">
          <CameraCapture 
            onCapture={handleRcCapture}
            fullScreen={true}
          />
          
          {/* Document scanner overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-black/60">
              <div className="absolute inset-x-4 top-1/2 transform -translate-y-1/2 h-60 bg-transparent border-2 border-white rounded-2xl shadow-2xl">
                {/* Corner indicators */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>
              </div>
            </div>
            
            <div className="absolute bottom-32 left-0 right-0 text-center text-white px-8">
              <p className="text-lg font-medium mb-2">Position RC document in frame</p>
              <p className="text-sm text-gray-300">Optional - helps verify your vehicle</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/40 min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm p-4 border-b border-white/20">
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Join GreenKarma
          </h1>
          <p className="text-gray-600 mt-1">Start earning rewards for eco-friendly driving</p>
        </div>
      </div>

      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-green-600" />
                Personal Information
              </h2>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          {...field} 
                          className="bg-white/50 border-gray-200 focus:border-green-500 focus:ring-green-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="10-digit mobile number" 
                          {...field} 
                          type="tel"
                          className="bg-white/50 border-gray-200 focus:border-green-500 focus:ring-green-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2 text-blue-600" />
                Vehicle Information
              </h2>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="vehicleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="MH12AB1234" 
                          {...field} 
                          className="bg-white/50 border-gray-200 focus:border-green-500 focus:ring-green-200 font-mono text-center uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* RC Document Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">RC Document (Optional)</Label>
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCamera(true)}
                      className="flex-1 h-12 border-dashed border-gray-300 hover:border-blue-500"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {rcImage ? 'Retake RC Photo' : 'Scan RC Document'}
                    </Button>
                  </div>
                  
                  {rcImage && (
                    <div className="mt-2 bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-green-700 text-sm font-medium flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        RC document captured successfully
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={registerMutation.isPending}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[0.99]"
                size="lg"
              >
                {registerMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Register & Start Earning
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Skip Option */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-3">Want to explore first?</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/wallet'}
            className="border-gray-300 hover:bg-gray-50"
          >
            Skip & View Demo Wallet
          </Button>
        </div>
      </div>
    </div>
  );
}