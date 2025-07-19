import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { WalletCard } from '@/components/WalletCard';
import { StatsCards } from '@/components/StatsCards';
import { RecentActivity } from '@/components/RecentActivity';
import { EcoWarriorBadge } from '@/components/EcoWarriorBadge';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Skeleton } from '@/components/ui/skeleton';

// Get current user's vehicle number from localStorage or fallback to demo
const getCurrentVehicleNumber = () => {
  return localStorage.getItem('currentVehicleNumber') || 'DEMO4774';
};

const getCurrentUserName = () => {
  return localStorage.getItem('currentUserName') || 'Demo User';
};

export default function Wallet() {
  const currentVehicle = getCurrentVehicleNumber();
  const currentUserName = getCurrentUserName();

  const { data: walletData, isLoading } = useQuery({
    queryKey: [`/api/wallet/${currentVehicle}`],
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
      vehicleId: walletData?.user?.vehicleNumber || currentVehicle,
      status: 'active' as const,
      timestamp: new Date(),
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/40 min-h-screen relative">
      <Header />
      
      <WalletCard 
        balance={walletData?.totalBalance || 0}
        co2Saved={walletData?.totalCo2Saved || 0}
        vehicleId={walletData?.user?.vehicleNumber || currentVehicle}
      />
      
      <StatsCards 
        monthlyReward={walletData?.monthlyReward || 0}
        totalDistance={walletData?.totalDistance || 0}
      />
      
      <RecentActivity activities={activities} />
      
      <EcoWarriorBadge 
        co2Saved={walletData?.totalCo2Saved || 0}
        progress={Math.min(((walletData?.totalCo2Saved || 0) / 50) * 100, 100)}
      />
      
      <BottomNavigation />
    </div>
  );
}
