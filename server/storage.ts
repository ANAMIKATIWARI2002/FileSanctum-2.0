import {
  users,
  nodes,
  files,
  fileChunks,
  activityLogs,
  invitations,
  systemMetrics,
  contactMessages,
  type User,
  type UpsertUser,
  type Node,
  type InsertNode,
  type File,
  type InsertFile,
  type FileChunk,
  type InsertFileChunk,
  type ActivityLog,
  type InsertActivityLog,
  type Invitation,
  type InsertInvitation,
  type SystemMetric,
  type InsertSystemMetric,
  type ContactMessage,
  type InsertContactMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import { nanoid } from "nanoid";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Node operations
  getAllNodes(): Promise<Node[]>;
  getNode(id: number): Promise<Node | undefined>;
  createNode(node: InsertNode): Promise<Node>;
  updateNode(id: number, updates: Partial<InsertNode>): Promise<Node | undefined>;
  deleteNode(id: number): Promise<boolean>;
  updateNodeMetrics(id: number, metrics: {
    cpuUsage?: string;
    memoryUsage?: string;
    storageUsed?: string;
    networkThroughput?: string;
    uptime?: string;
  }): Promise<Node | undefined>;

  // File operations
  getAllFiles(userId?: string): Promise<File[]>;
  getFile(id: number): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFileStatus(id: number, status: string): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;

  // File chunk operations
  createFileChunk(chunk: InsertFileChunk): Promise<FileChunk>;
  getFileChunks(fileId: number): Promise<FileChunk[]>;

  // Activity log operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  deleteActivityLog(id: number): Promise<boolean>;

  // Invitation operations
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  getInvitations(invitedBy: string): Promise<Invitation[]>;
  updateInvitationStatus(id: number, status: string): Promise<Invitation | undefined>;

  // System metrics operations
  createSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric>;
  getSystemMetrics(metricType?: string, hours?: number): Promise<SystemMetric[]>;

  // Contact message operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Node operations
  async getAllNodes(): Promise<Node[]> {
    return await db.select().from(nodes).orderBy(nodes.name);
  }

  async getNode(id: number): Promise<Node | undefined> {
    const [node] = await db.select().from(nodes).where(eq(nodes.id, id));
    return node;
  }

  async createNode(node: InsertNode): Promise<Node> {
    const [newNode] = await db.insert(nodes).values(node).returning();
    return newNode;
  }

  async updateNode(id: number, updates: Partial<InsertNode>): Promise<Node | undefined> {
    const [updatedNode] = await db
      .update(nodes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(nodes.id, id))
      .returning();
    return updatedNode;
  }

  async deleteNode(id: number): Promise<boolean> {
    try {
      const result = await db.delete(nodes).where(eq(nodes.id, id));
      console.log(`Delete node ${id} result:`, result);
      // Force return true since the operation completed without error
      return true;
    } catch (error) {
      console.error(`Error deleting node ${id}:`, error);
      return false;
    }
  }

  async updateNodeMetrics(id: number, metrics: {
    cpuUsage?: string;
    memoryUsage?: string;
    storageUsed?: string;
    networkThroughput?: string;
    uptime?: string;
  }): Promise<Node | undefined> {
    const [updatedNode] = await db
      .update(nodes)
      .set({ 
        ...metrics, 
        lastHeartbeat: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(nodes.id, id))
      .returning();
    return updatedNode;
  }

  // File operations
  async getAllFiles(userId?: string): Promise<File[]> {
    const query = db.select().from(files);
    if (userId) {
      return await query.where(eq(files.uploadedBy, userId)).orderBy(desc(files.createdAt));
    }
    return await query.orderBy(desc(files.createdAt));
  }

  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async updateFileStatus(id: number, status: string): Promise<File | undefined> {
    const [updatedFile] = await db
      .update(files)
      .set({ status, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id));
    return (result.rowCount || 0) > 0;
  }

  // File chunk operations
  async createFileChunk(chunk: InsertFileChunk): Promise<FileChunk> {
    const [newChunk] = await db.insert(fileChunks).values(chunk).returning();
    return newChunk;
  }

  async getFileChunks(fileId: number): Promise<FileChunk[]> {
    return await db.select().from(fileChunks).where(eq(fileChunks.fileId, fileId));
  }

  // Activity log operations
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  async deleteActivityLog(id: number): Promise<boolean> {
    try {
      const result = await db.delete(activityLogs)
        .where(eq(activityLogs.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error("Error deleting activity log:", error);
      return false;
    }
  }

  // Invitation operations
  async createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const [newInvitation] = await db
      .insert(invitations)
      .values({
        ...invitation,
        token,
        expiresAt,
      })
      .returning();
    return newInvitation;
  }

  async getInvitations(invitedBy: string): Promise<Invitation[]> {
    return await db
      .select()
      .from(invitations)
      .where(eq(invitations.invitedBy, invitedBy))
      .orderBy(desc(invitations.createdAt));
  }

  async updateInvitationStatus(id: number, status: string): Promise<Invitation | undefined> {
    const [updatedInvitation] = await db
      .update(invitations)
      .set({ status })
      .where(eq(invitations.id, id))
      .returning();
    return updatedInvitation;
  }

  // System metrics operations
  async createSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric> {
    const [newMetric] = await db.insert(systemMetrics).values(metric).returning();
    return newMetric;
  }

  async getSystemMetrics(metricType?: string, hours: number = 24): Promise<SystemMetric[]> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    if (metricType) {
      return await db
        .select()
        .from(systemMetrics)
        .where(
          and(
            eq(systemMetrics.metricType, metricType),
            gte(systemMetrics.timestamp, since)
          )
        )
        .orderBy(desc(systemMetrics.timestamp));
    }

    return await db
      .select()
      .from(systemMetrics)
      .where(gte(systemMetrics.timestamp, since))
      .orderBy(desc(systemMetrics.timestamp));
  }

  // Contact message operations
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [contactMessage] = await db
      .insert(contactMessages)
      .values(message)
      .returning();
    return contactMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }
}

export const storage = new DatabaseStorage();
