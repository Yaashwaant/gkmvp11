import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRewardSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User registration
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if vehicle number already exists
      const existingUser = await storage.getUserByVehicleNumber(userData.vehicleNumber);
      if (existingUser) {
        return res.status(400).json({ 
          message: "Vehicle number already registered" 
        });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Upload odometer reading
  app.post("/api/upload-odometer", async (req, res) => {
    try {
      const rewardData = insertRewardSchema.parse(req.body);
      
      // Verify vehicle exists
      const user = await storage.getUserByVehicleNumber(rewardData.vehicleNumber);
      if (!user) {
        return res.status(404).json({ 
          message: "Vehicle not found" 
        });
      }
      
      // Check for duplicate readings (prevent gaming)
      const lastReward = await storage.getLastRewardByVehicleNumber(rewardData.vehicleNumber);
      if (lastReward && rewardData.km <= lastReward.km) {
        return res.status(400).json({ 
          message: "Invalid odometer reading. Must be greater than last reading." 
        });
      }
      
      // Calculate CO2 saved and reward (simplified calculation)
      const kmDiff = lastReward ? rewardData.km - lastReward.km : 100; // Default 100km for first reading
      const co2Saved = kmDiff * 0.12; // 120g CO2 per km saved (EV vs ICE)
      const rewardAmount = co2Saved * 2; // ₹2 per kg CO2
      
      const reward = await storage.createReward({
        ...rewardData,
        co2Saved,
        rewardGiven: rewardAmount,
        txHash: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock transaction hash
      });
      
      res.json({ reward });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user wallet data
  app.get("/api/wallet/:vehicleNumber", async (req, res) => {
    try {
      const { vehicleNumber } = req.params;
      
      console.log('Getting wallet data for vehicle:', vehicleNumber);
      const user = await storage.getUserByVehicleNumber(vehicleNumber);
      console.log('User found:', user);
      
      if (!user) {
        return res.status(404).json({ 
          message: "Vehicle not found" 
        });
      }
      
      const totals = await storage.getTotalRewardsByVehicleNumber(vehicleNumber);
      
      res.json({
        user,
        ...totals,
      });
    } catch (error) {
      console.error('Wallet API error:', error);
      res.status(500).json({ message: "Internal server error", details: error.message });
    }
  });

  // Get reward history
  app.get("/api/reward-history/:vehicleNumber", async (req, res) => {
    try {
      const { vehicleNumber } = req.params;
      
      const rewards = await storage.getRewardsByVehicleNumber(vehicleNumber);
      res.json({ rewards });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user by vehicle number
  app.get("/api/user/:vehicleNumber", async (req, res) => {
    try {
      const { vehicleNumber } = req.params;
      
      const user = await storage.getUserByVehicleNumber(vehicleNumber);
      if (!user) {
        return res.status(404).json({ 
          message: "Vehicle not found" 
        });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
