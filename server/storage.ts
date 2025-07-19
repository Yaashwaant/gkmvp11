import { users, rewards, blockchainRegistry, globalFraudDatabase, type User, type InsertUser, type Reward, type InsertReward } from "@shared/schema";
import { db } from './db';
import { eq } from 'drizzle-orm';
import { blockchainRegistry as blockchain } from './blockchain';

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

  // Blockchain operations
  createUserBlockchain(vehicleNumber: string, userId: number): Promise<void>;
  validateOdometerReading(vehicleNumber: string, reading: number, validationData: any): Promise<{
    isValid: boolean;
    blockHash?: string;
    fraudAlert?: string;
  }>;
  getBlockchainSummary(vehicleNumber: string): Promise<any>;

  // Global fraud database operations
  storeGlobalFraudEntry(entry: {
    vehicleNumber: string;
    reading: number;
    appSource: string;
    blockchainTxHash: string;
    timestamp: Date;
    readingHash: string;
  }): Promise<void>;
  getGlobalFraudEntry(readingHash: string): Promise<any>;
  getGlobalFraudEntryByTxHash(txHash: string): Promise<any>;
  
  // Admin operations
  getUsers(): Promise<User[]>;
  getRewards(): Promise<Reward[]>;
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
      rcImageUrl: insertUser.rcImageUrl || null,
      id, 
      registeredAt: new Date() 
    };
    this.users.set(id, user);
    
    // Create blockchain for the user
    await blockchain.createUserChain(user.vehicleNumber, user.id);
    
    return user;
  }

  async createUserBlockchain(vehicleNumber: string, userId: number): Promise<void> {
    await blockchain.createUserChain(vehicleNumber, userId);
  }

  async validateOdometerReading(vehicleNumber: string, reading: number, validationData: any): Promise<{
    isValid: boolean;
    blockHash?: string;
    fraudAlert?: string;
  }> {
    return await blockchain.addOdometerReading(
      vehicleNumber,
      reading,
      validationData.imageHash || '',
      validationData.location || '',
      validationData.validationProof || {}
    );
  }

  async getBlockchainSummary(vehicleNumber: string): Promise<any> {
    return blockchain.getUserChainSummary(vehicleNumber);
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
      txHash: insertReward.txHash || null,
      location: insertReward.location || null,
      ocrConfidence: insertReward.ocrConfidence || null,
      validationStatus: insertReward.validationStatus || "pending",
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

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values());
  }

  async storeGlobalFraudEntry(entry: {
    vehicleNumber: string;
    reading: number;
    appSource: string;
    blockchainTxHash: string;
    timestamp: Date;
    readingHash: string;
  }): Promise<void> {
    // Memory storage - just store in console for now
    console.log('Global fraud entry stored:', entry);
  }

  async getGlobalFraudEntry(readingHash: string): Promise<any> {
    // Memory storage - return null for now
    return null;
  }

  async getGlobalFraudEntryByTxHash(txHash: string): Promise<any> {
    // Memory storage - return null for now
    return null;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByVehicleNumber(vehicleNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.vehicleNumber, vehicleNumber));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    // Create blockchain for the user
    await this.createUserBlockchain(user.vehicleNumber, user.id);
    
    return user;
  }

  async createUserBlockchain(vehicleNumber: string, userId: number): Promise<void> {
    // Create blockchain in memory
    const userChain = await blockchain.createUserChain(vehicleNumber, userId);
    
    // Store blockchain data in database
    await db.insert(blockchainRegistry).values({
      vehicleNumber,
      userId,
      chainData: JSON.stringify(userChain.chain),
      fraudScore: userChain.fraudScore,
      isActive: userChain.isActive,
      lastValidReading: userChain.lastValidReading
    });
  }

  async validateOdometerReading(vehicleNumber: string, reading: number, validationData: any): Promise<{
    isValid: boolean;
    blockHash?: string;
    fraudAlert?: string;
  }> {
    const result = await blockchain.addOdometerReading(
      vehicleNumber,
      reading,
      validationData.imageHash || '',
      validationData.location || '',
      validationData.validationProof || {}
    );

    // Update blockchain registry in database if successful
    if (result.success) {
      const chainSummary = blockchain.getUserChainSummary(vehicleNumber);
      if (chainSummary) {
        await db
          .update(blockchainRegistry)
          .set({
            chainData: JSON.stringify(blockchain.exportChain(vehicleNumber)?.chain || []),
            fraudScore: chainSummary.fraudScore,
            lastValidReading: chainSummary.lastValidReading,
            updatedAt: new Date()
          })
          .where(eq(blockchainRegistry.vehicleNumber, vehicleNumber));
      }
    }

    return result;
  }

  async getBlockchainSummary(vehicleNumber: string): Promise<any> {
    return blockchain.getUserChainSummary(vehicleNumber);
  }

  async getRewardsByVehicleNumber(vehicleNumber: string): Promise<Reward[]> {
    return await db.select().from(rewards).where(eq(rewards.vehicleNumber, vehicleNumber));
  }

  async getLastRewardByVehicleNumber(vehicleNumber: string): Promise<Reward | undefined> {
    const [reward] = await db
      .select()
      .from(rewards)
      .where(eq(rewards.vehicleNumber, vehicleNumber))
      .orderBy(desc(rewards.timestamp))
      .limit(1);
    return reward || undefined;
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const [reward] = await db
      .insert(rewards)
      .values(insertReward)
      .returning();
    return reward;
  }

  async getTotalRewardsByVehicleNumber(vehicleNumber: string): Promise<{
    totalBalance: number;
    totalCo2Saved: number;
    monthlyReward: number;
    totalDistance: number;
  }> {
    const userRewards = await this.getRewardsByVehicleNumber(vehicleNumber);
    
    const totalBalance = userRewards.reduce((sum, reward) => sum + reward.rewardGiven, 0);
    const totalCo2Saved = userRewards.reduce((sum, reward) => sum + reward.co2Saved, 0);
    
    // Calculate monthly reward (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyReward = userRewards
      .filter(reward => {
        const rewardDate = new Date(reward.timestamp);
        return rewardDate.getMonth() === currentMonth && rewardDate.getFullYear() === currentYear;
      })
      .reduce((sum, reward) => sum + reward.rewardGiven, 0);

    // Calculate total distance
    const sortedRewards = userRewards.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let totalDistance = 0;
    for (let i = 1; i < sortedRewards.length; i++) {
      const prevKm = sortedRewards[i - 1].km;
      const currentKm = sortedRewards[i].km;
      if (currentKm > prevKm) {
        totalDistance += currentKm - prevKm;
      }
    }

    return { totalBalance, totalCo2Saved, monthlyReward, totalDistance };
  }

  async storeGlobalFraudEntry(entry: {
    vehicleNumber: string;
    reading: number;
    appSource: string;
    blockchainTxHash: string;
    timestamp: Date;
    readingHash: string;
  }): Promise<void> {
    await db.insert(globalFraudDatabase).values({
      vehicleNumber: entry.vehicleNumber,
      odometerReading: entry.reading,
      appSource: entry.appSource,
      blockHash: entry.blockchainTxHash,
      appSignature: entry.readingHash,
      timestamp: entry.timestamp
    });
  }

  async getGlobalFraudEntry(readingHash: string): Promise<any> {
    const [entry] = await db
      .select()
      .from(globalFraudDatabase)
      .where(eq(globalFraudDatabase.appSignature, readingHash));
    return entry || null;
  }

  async getGlobalFraudEntryByTxHash(txHash: string): Promise<any> {
    const [entry] = await db
      .select()
      .from(globalFraudDatabase)
      .where(eq(globalFraudDatabase.blockHash, txHash));
    return entry || null;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getRewards(): Promise<Reward[]> {
    return await db.select().from(rewards);
  }
}

// Use database storage instead of memory storage
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
