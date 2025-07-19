export interface UserStats {
  totalDistance: number;
  totalCo2Saved: number;
  totalRewards: number;
  averageTrip: number;
  monthlyStats: MonthlyStats;
  ecoRank: string;
  achievements: Achievement[];
}

export interface MonthlyStats {
  currentMonth: {
    distance: number;
    co2Saved: number;
    rewards: number;
    trips: number;
  };
  previousMonth: {
    distance: number;
    co2Saved: number;
    rewards: number;
    trips: number;
  };
  growth: {
    distanceGrowth: number;
    co2Growth: number;
    rewardGrowth: number;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  progress?: number;
  target?: number;
}

export interface EcoImpact {
  co2SavedKg: number;
  equivalent: {
    treesPlanted: number;
    coalAvoided: number; // kg
    waterSaved: number; // liters
  };
  comparedToAverage: {
    percentage: number;
    category: 'poor' | 'average' | 'good' | 'excellent';
  };
}

export function calculateEcoImpact(co2SavedKg: number): EcoImpact {
  // Environmental impact calculations based on research
  const treesPlanted = Math.round(co2SavedKg / 22); // 1 tree absorbs ~22kg CO2/year
  const coalAvoided = Math.round(co2SavedKg * 0.45); // 1kg CO2 = ~0.45kg coal
  const waterSaved = Math.round(co2SavedKg * 2.3); // Energy saved = water saved

  // Compare to average EV driver (assuming 50kg CO2 saved per month)
  const averageMonthly = 50;
  const percentage = Math.round((co2SavedKg / averageMonthly) * 100);
  
  let category: 'poor' | 'average' | 'good' | 'excellent';
  if (percentage < 50) category = 'poor';
  else if (percentage < 100) category = 'average';
  else if (percentage < 150) category = 'good';
  else category = 'excellent';

  return {
    co2SavedKg,
    equivalent: {
      treesPlanted,
      coalAvoided,
      waterSaved
    },
    comparedToAverage: {
      percentage,
      category
    }
  };
}

export function generateAchievements(
  totalDistance: number,
  totalCo2Saved: number,
  totalTrips: number,
  consecutiveDays: number
): Achievement[] {
  const achievements: Achievement[] = [];
  
  // Distance achievements
  if (totalDistance >= 1000) {
    achievements.push({
      id: 'distance_1000',
      title: 'Long Hauler',
      description: 'Traveled 1000+ km with EV',
      icon: '🛣️',
      unlockedAt: new Date()
    });
  }
  
  if (totalDistance >= 5000) {
    achievements.push({
      id: 'distance_5000',
      title: 'Road Warrior',
      description: 'Traveled 5000+ km with EV',
      icon: '🏆',
      unlockedAt: new Date()
    });
  }
  
  // CO2 achievements
  if (totalCo2Saved >= 100) {
    achievements.push({
      id: 'co2_100',
      title: 'Green Guardian',
      description: 'Saved 100+ kg of CO2',
      icon: '🌱',
      unlockedAt: new Date()
    });
  }
  
  if (totalCo2Saved >= 500) {
    achievements.push({
      id: 'co2_500',
      title: 'Climate Hero',
      description: 'Saved 500+ kg of CO2',
      icon: '🌍',
      unlockedAt: new Date()
    });
  }
  
  // Trip achievements
  if (totalTrips >= 10) {
    achievements.push({
      id: 'trips_10',
      title: 'Frequent Driver',
      description: 'Completed 10+ eco trips',
      icon: '🚗',
      unlockedAt: new Date()
    });
  }
  
  // Consistency achievements
  if (consecutiveDays >= 7) {
    achievements.push({
      id: 'streak_7',
      title: 'Weekly Warrior',
      description: '7-day eco driving streak',
      icon: '🔥',
      unlockedAt: new Date()
    });
  }
  
  return achievements;
}

export function calculateEcoRank(totalCo2Saved: number): string {
  if (totalCo2Saved < 50) return 'Eco Beginner';
  if (totalCo2Saved < 100) return 'Green Driver';
  if (totalCo2Saved < 250) return 'Eco Warrior';
  if (totalCo2Saved < 500) return 'Climate Champion';
  return 'Earth Guardian';
}

export function generateRecommendations(
  userStats: UserStats,
  averageDistance: number
): string[] {
  const recommendations: string[] = [];
  
  if (userStats.averageTrip < 20) {
    recommendations.push('Try combining short trips to maximize your eco impact!');
  }
  
  if (userStats.totalDistance < averageDistance * 0.8) {
    recommendations.push('Consider using your EV more often to increase your green impact.');
  }
  
  if (userStats.monthlyStats.growth.co2Growth < 0) {
    recommendations.push('Your CO2 savings decreased this month. Plan longer eco-friendly trips!');
  }
  
  const nextAchievement = getNextAchievement(userStats);
  if (nextAchievement) {
    recommendations.push(`You're ${nextAchievement.progress}% towards "${nextAchievement.title}"!`);
  }
  
  return recommendations;
}

function getNextAchievement(userStats: UserStats): Achievement | null {
  // Return next achievable milestone
  if (userStats.totalDistance < 1000) {
    return {
      id: 'distance_1000',
      title: 'Long Hauler',
      description: 'Travel 1000 km with EV',
      icon: '🛣️',
      unlockedAt: new Date(),
      progress: Math.round((userStats.totalDistance / 1000) * 100),
      target: 1000
    };
  }
  
  if (userStats.totalCo2Saved < 100) {
    return {
      id: 'co2_100',
      title: 'Green Guardian',
      description: 'Save 100 kg of CO2',
      icon: '🌱',
      unlockedAt: new Date(),
      progress: Math.round((userStats.totalCo2Saved / 100) * 100),
      target: 100
    };
  }
  
  return null;
}