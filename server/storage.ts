import { users, rewards, type User, type InsertUser, type Reward, type InsertReward } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByVehicleNumber(vehicleNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Reward operations
  getRewardsByVehicleNumber(vehicleNumber: string): Promise<Reward[]>;
  getLastRewardByVehicleNumber(vehicleNumber: string): Promise<Reward | undefined>;
  createReward(reward: InsertReward): Promise<Reward>;
  getTotalRewardsByVehicleNumber(vehicleNumber: string): Promise<{
    totalBalance: number;
    totalCo2Saved: number;
    monthlyReward: number;
    totalDistance: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rewards: Map<number, Reward>;
  private currentUserId: number;
  private currentRewardId: number;

  constructor() {
    this.users = new Map();
    this.rewards = new Map();
    this.currentUserId = 1;
    this.currentRewardId = 1;
    
    // Add demo user
    this.users.set(1, {
      id: 1,
      name: "Demo User",
      phone: "+91 9876543210",
      vehicleNumber: "DEMO4774",
      rcImageUrl: null,
      registeredAt: new Date(),
    });
    this.currentUserId = 2;
    
    // Add demo rewards
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    this.rewards.set(1, {
      id: 1,
      vehicleNumber: "DEMO4774",
      odometerImageUrl: "demo_odometer.jpg",
      km: 15000,
      co2Saved: 12.0,
      rewardGiven: 24.0,
      txHash: "0x123...abc",
      timestamp: thisMonth,
    });
    this.currentRewardId = 2;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByVehicleNumber(vehicleNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.vehicleNumber === vehicleNumber,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      registeredAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getRewardsByVehicleNumber(vehicleNumber: string): Promise<Reward[]> {
    return Array.from(this.rewards.values())
      .filter((reward) => reward.vehicleNumber === vehicleNumber)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getLastRewardByVehicleNumber(vehicleNumber: string): Promise<Reward | undefined> {
    const rewards = await this.getRewardsByVehicleNumber(vehicleNumber);
    return rewards[0];
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = this.currentRewardId++;
    const reward: Reward = { 
      ...insertReward, 
      id, 
      timestamp: new Date() 
    };
    this.rewards.set(id, reward);
    return reward;
  }

  async getTotalRewardsByVehicleNumber(vehicleNumber: string): Promise<{
    totalBalance: number;
    totalCo2Saved: number;
    monthlyReward: number;
    totalDistance: number;
  }> {
    const rewards = await this.getRewardsByVehicleNumber(vehicleNumber);
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalBalance = rewards.reduce((sum, reward) => sum + reward.rewardGiven, 0);
    const totalCo2Saved = rewards.reduce((sum, reward) => sum + reward.co2Saved, 0);
    const monthlyReward = rewards
      .filter(reward => reward.timestamp >= thisMonth)
      .reduce((sum, reward) => sum + reward.rewardGiven, 0);
    
    // Calculate total distance from last reading (assuming first reading is baseline)
    const lastReward = rewards[0];
    const totalDistance = lastReward ? lastReward.km : 0;
    
    return {
      totalBalance,
      totalCo2Saved,
      monthlyReward,
      totalDistance,
    };
  }
}

export const storage = new MemStorage();
