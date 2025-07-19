import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  TreePine, 
  Droplets, 
  Car,
  Award,
  TrendingUp,
  Target,
  MapPin,
  Calendar
} from 'lucide-react';
import { calculateEcoImpact, generateAchievements, calculateEcoRank, type UserStats } from '@/lib/analytics';
import { useLanguage } from '@/hooks/useLanguage';

const DEMO_VEHICLE = 'DEMO4774';

export default function Analytics() {
  const { t } = useLanguage();

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: [`/api/wallet/${DEMO_VEHICLE}`],
    staleTime: 60000, // 1 minute
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: [`/api/reward-history/${DEMO_VEHICLE}`],
    staleTime: 60000,
  });

  if (walletLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Header showBackButton title="Analytics" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!walletData || !historyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Header showBackButton title="Analytics" />
        <div className="p-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p>No data available</p>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const { totalBalance, totalCo2Saved, totalDistance } = walletData;
  const rewards = historyData.rewards || [];

  // Calculate enhanced analytics
  const ecoImpact = calculateEcoImpact(totalCo2Saved);
  const ecoRank = calculateEcoRank(totalCo2Saved);
  const achievements = generateAchievements(totalDistance, totalCo2Saved, rewards.length, 7);
  
  // Monthly comparison
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthRewards = rewards.filter(r => new Date(r.timestamp) >= thisMonth);
  const lastMonthRewards = rewards.filter(r => {
    const date = new Date(r.timestamp);
    return date >= lastMonth && date <= lastMonthEnd;
  });

  const monthlyGrowth = {
    distance: thisMonthRewards.reduce((sum, r) => sum + (r.km || 0), 0),
    co2: thisMonthRewards.reduce((sum, r) => sum + r.co2Saved, 0),
    rewards: thisMonthRewards.reduce((sum, r) => sum + r.rewardGiven, 0),
  };

  const lastMonthTotals = {
    co2: lastMonthRewards.reduce((sum, r) => sum + r.co2Saved, 0),
    rewards: lastMonthRewards.reduce((sum, r) => sum + r.rewardGiven, 0),
  };

  const growthPercentage = lastMonthTotals.co2 > 0 
    ? Math.round(((monthlyGrowth.co2 - lastMonthTotals.co2) / lastMonthTotals.co2) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header showBackButton title="EcoInsights" />
      
      <div className="p-4 space-y-6 pb-24">
        {/* Eco Rank & Impact Overview */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{ecoRank}</CardTitle>
                <p className="text-green-100">Your eco status</p>
              </div>
              <Award className="h-12 w-12 text-green-200" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalCo2Saved.toFixed(1)}</div>
                <p className="text-sm text-gray-600">kg CO₂ Saved</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">₹{totalBalance}</div>
                <p className="text-sm text-gray-600">Total Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Environmental Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <TreePine className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold">{ecoImpact.equivalent.treesPlanted}</div>
                <p className="text-xs text-gray-600">Trees Planted Equivalent</p>
              </div>
              <div className="text-center">
                <Car className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <div className="text-lg font-bold">{ecoImpact.equivalent.coalAvoided}</div>
                <p className="text-xs text-gray-600">kg Coal Avoided</p>
              </div>
              <div className="text-center">
                <Droplets className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold">{ecoImpact.equivalent.waterSaved}</div>
                <p className="text-xs text-gray-600">Liters Water Saved</p>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Eco Performance</span>
                <Badge variant={ecoImpact.comparedToAverage.category === 'excellent' ? 'default' : 'secondary'}>
                  {ecoImpact.comparedToAverage.percentage}% vs Average
                </Badge>
              </div>
              <Progress 
                value={Math.min(ecoImpact.comparedToAverage.percentage, 100)} 
                className="h-3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Monthly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {monthlyGrowth.co2.toFixed(1)}kg
                </div>
                <p className="text-sm text-gray-600">CO₂ Saved This Month</p>
                {growthPercentage !== 0 && (
                  <div className={`flex items-center text-sm mt-1 ${
                    growthPercentage > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {growthPercentage > 0 ? '+' : ''}{growthPercentage}% vs last month
                  </div>
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{monthlyGrowth.rewards.toFixed(0)}
                </div>
                <p className="text-sm text-gray-600">Earned This Month</p>
                <div className="text-sm text-gray-500 mt-1">
                  {thisMonthRewards.length} trips recorded
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        {achievements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Achievements ({achievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{achievement.title}</div>
                      <div className="text-sm text-gray-600">{achievement.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trip Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              Trip Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-purple-600">{rewards.length}</div>
                <p className="text-sm text-gray-600">Total Trips</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">
                  {rewards.length > 0 ? Math.round(totalDistance / rewards.length) : 0}
                </div>
                <p className="text-sm text-gray-600">Avg Trip (km)</p>
              </div>
            </div>
            
            {rewards.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Consistency Score</span>
                  <span className="text-sm text-gray-600">
                    {Math.min(rewards.length * 10, 100)}%
                  </span>
                </div>
                <Progress value={Math.min(rewards.length * 10, 100)} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              Next Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {totalCo2Saved < 100 && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-semibold">Green Guardian</div>
                  <div className="text-sm text-gray-600">Save 100kg of CO₂</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{Math.round((totalCo2Saved / 100) * 100)}%</div>
                  <Progress value={(totalCo2Saved / 100) * 100} className="w-16 h-2 mt-1" />
                </div>
              </div>
            )}
            
            {totalDistance < 5000 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-semibold">Road Warrior</div>
                  <div className="text-sm text-gray-600">Travel 5000km with EV</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{Math.round((totalDistance / 5000) * 100)}%</div>
                  <Progress value={(totalDistance / 5000) * 100} className="w-16 h-2 mt-1" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}