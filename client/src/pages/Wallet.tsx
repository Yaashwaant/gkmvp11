import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { WalletCard } from '@/components/WalletCard';
import { StatsCards } from '@/components/StatsCards';
import { RecentActivity } from '@/components/RecentActivity';
import { EcoWarriorBadge } from '@/components/EcoWarriorBadge';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Skeleton } from '@/components/ui/skeleton';

const DEMO_VEHICLE = 'DEMO4774';

export default function Wallet() {
  const { data: walletData, isLoading } = useQuery({
    queryKey: ['/api/wallet', DEMO_VEHICLE],
  });

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <Header />
        <div className="px-4 space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const activities = [
    {
      id: 1,
      type: 'reward',
      vehicleId: walletData?.user?.vehicleNumber || DEMO_VEHICLE,
      status: 'active' as const,
      timestamp: new Date(),
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      <Header />
      
      <WalletCard 
        balance={walletData?.totalBalance || 24}
        co2Saved={walletData?.totalCo2Saved || 12.0}
        vehicleId={walletData?.user?.vehicleNumber || DEMO_VEHICLE}
      />
      
      <StatsCards 
        monthlyReward={walletData?.monthlyReward || 10}
        totalDistance={walletData?.totalDistance || 100}
      />
      
      <RecentActivity activities={activities} />
      
      <EcoWarriorBadge 
        co2Saved={walletData?.totalCo2Saved || 12.0}
        progress={60}
      />
      
      <BottomNavigation />
    </div>
  );
}
