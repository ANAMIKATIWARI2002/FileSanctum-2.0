import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("viewer"), // viewer, contributor, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Storage nodes table
export const nodes = pgTable("nodes", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  ipAddress: varchar("ip_address").notNull(),
  port: integer("port").default(8080),
  status: varchar("status").default("healthy"), // healthy, degraded, failed
  storageCapacity: decimal("storage_capacity"), // in GB
  storageUsed: decimal("storage_used").default("0"),
  cpuUsage: decimal("cpu_usage").default("0"),
  memoryUsage: decimal("memory_usage").default("0"),
  networkThroughput: decimal("network_throughput").default("0"),
  uptime: decimal("uptime").default("0"),
  lastHeartbeat: timestamp("last_heartbeat").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Files table
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  originalName: varchar("original_name").notNull(),
  size: decimal("size").notNull(), // in bytes
  mimeType: varchar("mime_type"),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  status: varchar("status").default("uploading"), // uploading, stored, replicating, failed
  erasureCoding: jsonb("erasure_coding"), // k, m, chunks info
  encryptionKey: varchar("encryption_key"),
  checksum: varchar("checksum"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// File chunks table (for erasure coding)
export const fileChunks = pgTable("file_chunks", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").notNull().references(() => files.id),
  nodeId: integer("node_id").notNull().references(() => nodes.id),
  chunkIndex: integer("chunk_index").notNull(),
  chunkType: varchar("chunk_type").notNull(), // data, parity
  size: decimal("size").notNull(),
  checksum: varchar("checksum"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  resource: varchar("resource"), // file, node, user, etc.
  resourceId: varchar("resource_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User invitations table
export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  role: varchar("role").notNull().default("viewer"),
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  message: text("message"),
  status: varchar("status").default("pending"), // pending, accepted, expired
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// System metrics table
export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  metricType: varchar("metric_type").notNull(), // throughput, storage, performance
  value: decimal("value").notNull(),
  unit: varchar("unit").notNull(),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Schema exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertNode = typeof nodes.$inferInsert;
export type Node = typeof nodes.$inferSelect;

export type InsertFile = typeof files.$inferInsert;
export type File = typeof files.$inferSelect;

export type InsertFileChunk = typeof fileChunks.$inferInsert;
export type FileChunk = typeof fileChunks.$inferSelect;

export type InsertActivityLog = typeof activityLogs.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;

export type InsertInvitation = typeof invitations.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;

export type InsertSystemMetric = typeof systemMetrics.$inferInsert;
export type SystemMetric = typeof systemMetrics.$inferSelect;

// Insert schemas
export const insertNodeSchema = createInsertSchema(nodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvitationSchema = createInsertSchema(invitations).omit({
  id: true,
  token: true,
  createdAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});
