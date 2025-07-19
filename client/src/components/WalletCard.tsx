import { useLanguage } from '@/hooks/useLanguage';

interface WalletCardProps {
  balance: number;
  co2Saved: number;
  vehicleId: string;
}

export function WalletCard({ balance, co2Saved, vehicleId }: WalletCardProps) {
  const { t } = useLanguage();

  return (
    <div className="px-4 mb-6">
      <div className="wallet-card-bg rounded-3xl shadow-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-4 right-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="mb-6">
            <p className="text-sm opacity-90 mb-1">{t('wallet.currentBalance')}</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold">₹{balance}</span>
              <span className="text-sm opacity-75">INR</span>
            </div>
          </div>

          <div className="absolute top-6 right-6 text-right">
            <p className="text-xs opacity-75 mb-1">{t('wallet.co2Saved')}</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-semibold">{co2Saved.toFixed(1)}</span>
              <span className="text-xs opacity-75">kg</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">{vehicleId}</span>
            </div>
            
            <button 
              className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-30 transition-all duration-200" 
              disabled
            >
              {t('wallet.withdrawSoon')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
