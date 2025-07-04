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
import { storageEngine } from "./storage-engine";
import * as crypto from 'crypto';

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Node operations
  getAllNodes(): Promise<Node[]>;
  getNode(id: number): Promise<Node | undefined>;
  getDefaultNode(): Promise<Node | undefined>;
  createNode(node: InsertNode): Promise<Node>;
  updateNode(id: number, updates: Partial<InsertNode>): Promise<Node | undefined>;
  deleteNode(id: number): Promise<boolean>;
  setDefaultNode(id: number): Promise<Node | undefined>;
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
  updateFile(id: number, updates: Partial<InsertFile>): Promise<File | undefined>;
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

  async getDefaultNode(): Promise<Node | undefined> {
    const [defaultNode] = await db.select().from(nodes).where(eq(nodes.isDefault, true));
    return defaultNode;
  }

  async createNode(node: InsertNode): Promise<Node> {
    const [newNode] = await db.insert(nodes).values(node).returning();
    return newNode;
  }

  async setDefaultNode(id: number): Promise<Node | undefined> {
    // First remove default flag from all nodes
    await db.update(nodes).set({ isDefault: false });
    
    // Then set the specified node as default
    const [defaultNode] = await db
      .update(nodes)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(nodes.id, id))
      .returning();
    return defaultNode;
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
      // First, move any files from this node to the default node
      const defaultNode = await this.getDefaultNode();
      if (defaultNode && defaultNode.id !== id) {
        await db
          .update(files)
          .set({ defaultNodeId: defaultNode.id })
          .where(eq(files.defaultNodeId, id));
      }
      
      // Delete any file chunks for this node
      await db.delete(fileChunks).where(eq(fileChunks.nodeId, id));
      
      // Now delete the node
      await db.delete(nodes).where(eq(nodes.id, id));
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

  async createFile(file: InsertFile & { fileBuffer?: Buffer }): Promise<File> {
    const allNodes = await this.getAllNodes();
    
    // Find Primary Node and Secondary Node only
    const primaryNode = allNodes.find(node => node.name === "Primary Node");
    const secondaryNode = allNodes.find(node => node.name === "Secondary Node");
    
    if (!primaryNode || !secondaryNode) {
      throw new Error("Primary or Secondary node not found");
    }

    // Generate encryption key for the file
    const encryptionKey = crypto.randomBytes(32).toString('hex');
    const checksum = crypto.createHash('sha256').update(file.fileBuffer || Buffer.from('')).digest('hex');

    const fileData = {
      ...file,
      defaultNodeId: primaryNode.id,
      encryptionKey,
      checksum,
      erasureCoding: {
        k: 4, // 4 data chunks
        m: 2, // 2 parity chunks
        algorithm: "Reed-Solomon"
      }
    };

    delete fileData.fileBuffer; // Remove buffer before database insert

    const [newFile] = await db.insert(files).values(fileData).returning();

    // Process and store file chunks if fileBuffer is provided
    if (file.fileBuffer) {
      await this.processAndStoreFileChunks(newFile.id, file.fileBuffer, encryptionKey, primaryNode.id, secondaryNode.id);
    }

    return newFile;
  }

  // New method for processing and storing file chunks with real encryption and chunking
  private async processAndStoreFileChunks(
    fileId: number, 
    fileBuffer: Buffer, 
    encryptionKey: string, 
    primaryNodeId: number, 
    secondaryNodeId: number
  ): Promise<void> {
    try {
      // Split file into chunks
      const dataChunks = storageEngine.chunkFile(fileBuffer);
      
      // Create parity chunks for redundancy
      const parityChunks = storageEngine.createParityChunks(dataChunks);
      
      // Store data chunks in both nodes with encryption
      for (let i = 0; i < dataChunks.length; i++) {
        const { encryptedData } = storageEngine.encryptData(dataChunks[i], encryptionKey);
        
        // Store in primary node
        await storageEngine.storeChunk(primaryNodeId, fileId, i, encryptedData, 'data');
        
        // Store in secondary node for redundancy
        await storageEngine.storeChunk(secondaryNodeId, fileId, i, encryptedData, 'data');
        
        // Create database record for chunk tracking
        await this.createFileChunk({
          fileId,
          nodeId: primaryNodeId,
          chunkIndex: i,
          chunkType: "data",
          size: encryptedData.length.toString(),
          checksum: crypto.createHash('sha256').update(encryptedData).digest('hex'),
        });
        
        await this.createFileChunk({
          fileId,
          nodeId: secondaryNodeId,
          chunkIndex: i,
          chunkType: "data",
          size: encryptedData.length.toString(),
          checksum: crypto.createHash('sha256').update(encryptedData).digest('hex'),
        });
      }
      
      // Store parity chunks for error recovery
      for (let i = 0; i < parityChunks.length; i++) {
        const { encryptedData } = storageEngine.encryptData(parityChunks[i], encryptionKey);
        
        await storageEngine.storeChunk(primaryNodeId, fileId, i, encryptedData, 'parity');
        await storageEngine.storeChunk(secondaryNodeId, fileId, i, encryptedData, 'parity');
        
        await this.createFileChunk({
          fileId,
          nodeId: primaryNodeId,
          chunkIndex: i,
          chunkType: "parity",
          size: encryptedData.length.toString(),
          checksum: crypto.createHash('sha256').update(encryptedData).digest('hex'),
        });
        
        await this.createFileChunk({
          fileId,
          nodeId: secondaryNodeId,
          chunkIndex: i,
          chunkType: "parity",
          size: encryptedData.length.toString(),
          checksum: crypto.createHash('sha256').update(encryptedData).digest('hex'),
        });
      }
      
    } catch (error) {
      console.error('Error processing file chunks:', error);
      throw error;
    }
  }

  // Enhanced method to reconstruct and download file
  async reconstructFile(fileId: number): Promise<Buffer | null> {
    try {
      const file = await this.getFile(fileId);
      if (!file || !file.encryptionKey) {
        return null;
      }

      const dataChunks = await this.getFileChunks(fileId);
      const dataChunkCount = dataChunks.filter(chunk => chunk.chunkType === 'data').length / 2; // Divided by 2 because stored in both nodes
      
      const reconstructedBuffer = await storageEngine.reconstructFile(fileId, dataChunkCount);
      
      if (reconstructedBuffer && file.encryptionKey) {
        // Decrypt the reconstructed file
        const iv = Buffer.alloc(16); // For demo, using zero IV - in production use stored IV
        return storageEngine.decryptData(reconstructedBuffer, file.encryptionKey, iv);
      }
      
      return reconstructedBuffer;
    } catch (error) {
      console.error('Error reconstructing file:', error);
      return null;
    }
  }

  private async createFileChunksForNode(fileId: number, nodeId: number): Promise<void> {
    // This method is kept for backward compatibility but actual chunking is done in processAndStoreFileChunks
    console.log(`Legacy chunk creation for file ${fileId} on node ${nodeId}`);
  }

  async updateFile(id: number, updates: Partial<InsertFile>): Promise<File | undefined> {
    const [updatedFile] = await db
      .update(files)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return updatedFile;
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
    try {
      // Get file chunks to delete physical files
      const chunks = await this.getFileChunks(id);
      
      // Delete physical chunks from storage
      for (const chunk of chunks) {
        await storageEngine.deleteChunk(chunk.nodeId, id, chunk.chunkIndex, chunk.chunkType as 'data' | 'parity');
      }
      
      // Delete chunk records from database
      await db.delete(fileChunks).where(eq(fileChunks.fileId, id));
      
      // Delete file record from database
      const result = await db.delete(files).where(eq(files.id, id));
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
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
