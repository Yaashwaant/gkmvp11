import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  rcImageUrl: text("rc_image_url"),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  vehicleNumber: text("vehicle_number").notNull(),
  odometerImageUrl: text("odometer_image_url").notNull(),
  km: integer("km").notNull(),
  co2Saved: real("co2_saved").notNull(),
  rewardGiven: real("reward_given").notNull(),
  txHash: text("tx_hash"),
  location: text("location"), // JSON string for lat,lng,accuracy
  ocrConfidence: real("ocr_confidence"), 
  validationStatus: text("validation_status").notNull().default("pending"), // pending, approved, rejected
  blockHash: text("block_hash"), // Blockchain hash
  deviceFingerprint: text("device_fingerprint"), // Device fingerprint for fraud detection
  imageHash: text("image_hash"), // Hash of the image for integrity
  fraudScore: real("fraud_score").default(0), // Fraud detection score
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Blockchain registry table
export const blockchainRegistry = pgTable("blockchain_registry", {
  id: serial("id").primaryKey(),
  vehicleNumber: text("vehicle_number").notNull().unique(),
  userId: integer("user_id").notNull(),
  chainData: text("chain_data").notNull(), // JSON string of the blockchain
  fraudScore: real("fraud_score").default(0),
  isActive: boolean("is_active").default(true),
  lastValidReading: integer("last_valid_reading").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Global fraud database table
export const globalFraudDatabase = pgTable("global_fraud_database", {
  id: serial("id").primaryKey(),
  vehicleNumber: text("vehicle_number").notNull(),
  odometerReading: integer("odometer_reading").notNull(),
  appSource: text("app_source").notNull(), // Which app reported this reading
  blockHash: text("block_hash").notNull(),
  appSignature: text("app_signature").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  registeredAt: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;
