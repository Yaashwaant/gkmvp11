import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Car, Users, Leaf, Award, TrendingUp, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/hooks/useLanguage';

interface User {
  id: number;
  name: string;
  vehicleNumber: string;
  phone: string;
  createdAt: string;
}

interface Reward {
  id: number;
  vehicleNumber: string;
  km: number;
  co2Saved: number;
  rewardGiven: number;
  submittedAt: string;
  blockchainTxHash: string;
}

interface Stats {
  totalUsers: number;
  totalRewards: number;
  totalCO2Saved: number;
  totalDistanceCovered: number;
  totalReadings: number;
}

export default function Home() {
  const { t } = useLanguage();

  // Fetch real user data
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  // Fetch real stats
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['/api/admin/stats'],
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useQuery<Reward[]>({
    queryKey: ['/api/admin/recent-rewards'],
  });

  const isLoading = usersLoading || statsLoading || activityLoading;

  return (
    <div className="max-w-6xl mx-auto bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/40 min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm p-6 border-b border-white/20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            GreenKarma Wallet
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            Blockchain-powered carbon rewards for EV drivers
          </p>
          <p className="text-gray-600">
            Preventing cross-app fraud with transparent blockchain verification
          </p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Live Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/70 backdrop-blur-sm border border-white/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : stats?.totalUsers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border border-white/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">CO₂ Saved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : `${Math.round(stats?.totalCO2Saved || 0)}kg`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border border-white/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Rewards</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : `₹${Math.round(stats?.totalRewards || 0)}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border border-white/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Readings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : stats?.totalReadings || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users */}
        <Card className="bg-white/70 backdrop-blur-sm border border-white/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>New Eco Warriors</span>
              <Badge variant="secondary" className="ml-auto">
                {users?.length || 0} registered
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading users...</div>
            ) : users && users.length > 0 ? (
              <div className="space-y-3">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Car className="h-3 w-3" />
                          <span>{user.vehicleNumber}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      New
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No users registered yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/70 backdrop-blur-sm border border-white/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading activity...</div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Car className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{reward.vehicleNumber}</p>
                        <p className="text-sm text-gray-600">
                          {reward.km.toLocaleString()} km • Saved {reward.co2Saved}kg CO₂
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+₹{reward.rewardGiven}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(reward.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No activity yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blockchain Status */}
        <Card className="bg-white/70 backdrop-blur-sm border border-white/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>Blockchain Status</span>
              <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
                Live on Polygon Mumbai
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Network</p>
                <p className="text-gray-900">Polygon Mumbai Testnet (Free)</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Fraud Prevention</p>
                <p className="text-gray-900">Cross-app duplicate detection active</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Transaction Cost</p>
                <p className="text-gray-900 text-green-600 font-medium">$0.00 (Free)</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Security</p>
                <p className="text-gray-900">Public blockchain verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Ready to Start Earning?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join the blockchain-powered carbon credit revolution. Upload your odometer readings, 
              earn rewards, and help prevent fraud across all carbon reward platforms.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8">
                Register Now
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/wallet">
              <Button variant="outline" size="lg" className="px-8">
                View Demo Wallet
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}