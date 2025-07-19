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
