import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/hooks/useLanguage';
import type { Reward } from '@shared/schema';

const DEMO_VEHICLE = 'DEMO4774';

export default function History() {
  const { t } = useLanguage();
  
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['/api/reward-history', DEMO_VEHICLE],
  });

  const rewards: Reward[] = historyData?.rewards || [];

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <Header />
        <div className="px-4 pb-24 space-y-4">
          <Skeleton className="h-8 w-32" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/40 min-h-screen relative">
      <Header />
      
      <div className="px-4 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {t('history.title')}
        </h1>
        
        {rewards.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No reward history found
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rewards.map((reward) => (
              <Card key={reward.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      ₹{reward.rewardGiven.toFixed(2)}
                    </CardTitle>
                    <span className="text-sm text-gray-500">
                      {new Date(reward.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">{t('history.km')}:</span>
                      <span className="ml-2 font-medium">{reward.km.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('history.co2')}:</span>
                      <span className="ml-2 font-medium">{reward.co2Saved.toFixed(1)} kg</span>
                    </div>
                  </div>
                  
                  {reward.odometerImageUrl && (
                    <div className="mt-3">
                      <img 
                        src={reward.odometerImageUrl} 
                        alt="Odometer reading"
                        className="w-full h-24 object-cover rounded border"
                      />
                    </div>
                  )}
                  
                  {reward.txHash && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => {
                        // Open blockchain explorer (mock URL for demo)
                        window.open(`https://polygonscan.com/tx/${reward.txHash}`, '_blank');
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t('history.viewTx')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}
