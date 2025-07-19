import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRewardSchema } from "@shared/schema";
import { z } from "zod";
import { generateImageHash, generateDeviceFingerprint, extractImageMetadata, validateLocationAccuracy } from "./utils/crypto";
import { publicBlockchain } from "./blockchain/publicChain";

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

  // Upload odometer reading with blockchain validation
  app.post("/api/upload-odometer", async (req, res) => {
    try {
      const rewardData = insertRewardSchema.parse(req.body);
      const { imageData, location, ocrConfidence } = req.body;
      
      // Verify vehicle exists
      const user = await storage.getUserByVehicleNumber(rewardData.vehicleNumber);
      if (!user) {
        return res.status(404).json({ 
          message: "Vehicle not found" 
        });
      }

      // Generate validation data for blockchain
      const imageHash = generateImageHash(imageData || rewardData.odometerImageUrl);
      const deviceFingerprint = generateDeviceFingerprint(
        req.headers['user-agent'] || '', 
        req.ip || ''
      );
      const imageMetadata = extractImageMetadata(imageData || '');
      const locationAccuracy = validateLocationAccuracy(location || '{}');

      const validationProof = {
        ocrConfidence: parseFloat(ocrConfidence || '0.8'),
        locationAccuracy,
        timeStamp: new Date(),
        deviceFingerprint,
        imageMetadata
      };

      const validationData = {
        imageHash,
        location: location || '',
        validationProof
      };

      // Public blockchain fraud prevention check
      const publicChainResult = await publicBlockchain.registerReading(
        rewardData.vehicleNumber,
        rewardData.km,
        new Date(),
        'GreenKarma-v1.0'
      );

      if (!publicChainResult.success) {
        return res.status(400).json({ 
          message: "Cross-app fraud detected: " + publicChainResult.error,
          fraudAlert: true,
          crossAppDuplicate: true
        });
      }

      // Local blockchain validation
      const blockchainResult = await storage.validateOdometerReading(
        rewardData.vehicleNumber,
        rewardData.km,
        validationData
      );

      if (!blockchainResult.isValid) {
        return res.status(400).json({ 
          message: "Fraud detected: " + blockchainResult.fraudAlert,
          fraudAlert: true,
          localFraud: true
        });
      }
      
      // Check for duplicate readings (prevent gaming)
      const lastReward = await storage.getLastRewardByVehicleNumber(rewardData.vehicleNumber);
      if (lastReward && rewardData.km <= lastReward.km) {
        return res.status(400).json({ 
          message: "Invalid odometer reading. Must be greater than last reading." 
        });
      }
      
      // Calculate CO2 saved and reward
      const kmDiff = lastReward ? rewardData.km - lastReward.km : 100;
      const co2Saved = kmDiff * 0.12; // 120g CO2 per km saved
      const rewardAmount = co2Saved * 2; // ₹2 per kg CO2
      
      // Create reward with blockchain data
      const reward = await storage.createReward({
        ...rewardData,
        co2Saved,
        rewardGiven: rewardAmount,
        txHash: publicChainResult.txHash || `0x${Math.random().toString(16).substr(2, 40)}`,
        blockHash: blockchainResult.blockHash,
        deviceFingerprint,
        imageHash,
        fraudScore: 0, // Valid reading gets 0 fraud score
      });
      
      res.json({ 
        reward,
        blockchain: {
          network: 'Polygon Mumbai Testnet (Free)',
          txHash: publicChainResult.txHash,
          explorerUrl: `https://mumbai.polygonscan.com/tx/${publicChainResult.txHash}`,
          verified: true,
          crossAppProtected: true,
          cost: '$0.00',
          fraudScore: 0
        }
      });
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

  // Admin endpoint to check public blockchain network status
  app.get("/api/admin/blockchain-status", async (req, res) => {
    try {
      const networkStatus = publicBlockchain.getNetworkStatus();
      res.json({ networkStatus });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Verify a transaction on public blockchain
  app.get("/api/verify-transaction/:txHash", async (req, res) => {
    try {
      const { txHash } = req.params;
      const verification = await publicBlockchain.verifyTransaction(txHash);
      res.json(verification);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
