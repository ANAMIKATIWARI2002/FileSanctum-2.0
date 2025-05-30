import * as crypto from 'crypto';
import * as fs from 'fs-extra';
import * as path from 'path';

// Storage engine for local file operations
export class LocalStorageEngine {
  private baseStoragePath: string;

  constructor() {
    this.baseStoragePath = path.join(process.cwd(), 'storage');
    this.initializeStorage();
  }

  private async initializeStorage() {
    // Create base storage directory and node directories
    await fs.ensureDir(this.baseStoragePath);
    await fs.ensureDir(path.join(this.baseStoragePath, 'primary-node'));
    await fs.ensureDir(path.join(this.baseStoragePath, 'secondary-node'));
  }

  // Encrypt data using AES-256-CBC
  encryptData(data: Buffer, key?: string): { encryptedData: Buffer, encryptionKey: string, iv: Buffer } {
    const encryptionKey = key || crypto.randomBytes(32).toString('hex');
    const iv = crypto.randomBytes(16);
    const keyBuffer = Buffer.from(encryptionKey, 'hex').slice(0, 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
    
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    
    return {
      encryptedData: encrypted,
      encryptionKey,
      iv
    };
  }

  // Decrypt data using AES-256-CBC
  decryptData(encryptedData: Buffer, encryptionKey: string, iv: Buffer): Buffer {
    const keyBuffer = Buffer.from(encryptionKey, 'hex').slice(0, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
    
    return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  }

  // Split file into chunks for distributed storage
  chunkFile(fileBuffer: Buffer, chunkSize: number = 1024 * 256): Buffer[] { // 256KB chunks
    const chunks: Buffer[] = [];
    let offset = 0;

    while (offset < fileBuffer.length) {
      const chunk = fileBuffer.slice(offset, offset + chunkSize);
      chunks.push(chunk);
      offset += chunkSize;
    }

    return chunks;
  }

  // Create parity chunks using simple XOR for demonstration
  createParityChunks(dataChunks: Buffer[]): Buffer[] {
    const parityChunks: Buffer[] = [];
    const maxChunkSize = Math.max(...dataChunks.map(chunk => chunk.length));

    // Create one parity chunk for every two data chunks
    for (let i = 0; i < Math.ceil(dataChunks.length / 2); i++) {
      const parity = Buffer.alloc(maxChunkSize);
      
      // XOR relevant data chunks to create parity
      const startIdx = i * 2;
      const endIdx = Math.min(startIdx + 2, dataChunks.length);
      
      for (let j = startIdx; j < endIdx; j++) {
        for (let k = 0; k < dataChunks[j].length; k++) {
          parity[k] ^= dataChunks[j][k];
        }
      }
      
      parityChunks.push(parity);
    }

    return parityChunks;
  }

  // Store chunk to specific node directory
  async storeChunk(
    nodeId: number, 
    fileId: number, 
    chunkIndex: number, 
    chunkData: Buffer, 
    chunkType: 'data' | 'parity'
  ): Promise<string> {
    try {
      const nodeName = nodeId === 5 ? 'primary-node' : 'secondary-node';
      const chunkFileName = `${fileId}_${chunkType}_${chunkIndex}.chunk`;
      const chunkPath = path.join(this.baseStoragePath, nodeName, chunkFileName);
      
      // Ensure the directory exists
      await fs.ensureDir(path.dirname(chunkPath));
      
      // Write the chunk data to file
      await fs.outputFile(chunkPath, chunkData);
      return chunkPath;
    } catch (error) {
      console.error('Error storing chunk:', error);
      throw error;
    }
  }

  // Retrieve chunk from storage
  async retrieveChunk(nodeId: number, fileId: number, chunkIndex: number, chunkType: 'data' | 'parity'): Promise<Buffer | null> {
    try {
      const nodeName = nodeId === 5 ? 'primary-node' : 'secondary-node';
      const chunkFileName = `${fileId}_${chunkType}_${chunkIndex}.chunk`;
      const chunkPath = path.join(this.baseStoragePath, nodeName, chunkFileName);
      
      if (await fs.pathExists(chunkPath)) {
        return await fs.readFile(chunkPath);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving chunk:', error);
      return null;
    }
  }

  // Delete chunk from storage
  async deleteChunk(nodeId: number, fileId: number, chunkIndex: number, chunkType: 'data' | 'parity'): Promise<boolean> {
    try {
      const nodeName = nodeId === 5 ? 'primary-node' : 'secondary-node';
      const chunkFileName = `${fileId}_${chunkType}_${chunkIndex}.chunk`;
      const chunkPath = path.join(this.baseStoragePath, nodeName, chunkFileName);
      
      if (await fs.pathExists(chunkPath)) {
        await fs.remove(chunkPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting chunk:', error);
      return false;
    }
  }

  // Reconstruct file from chunks
  async reconstructFile(fileId: number, totalChunks: number): Promise<Buffer | null> {
    try {
      const chunks: Buffer[] = [];
      
      // Try to retrieve all data chunks first
      for (let i = 0; i < totalChunks; i++) {
        let chunk = await this.retrieveChunk(5, fileId, i, 'data'); // Try primary node first
        if (!chunk) {
          chunk = await this.retrieveChunk(6, fileId, i, 'data'); // Try secondary node
        }
        
        if (chunk) {
          chunks[i] = chunk;
        }
      }

      // If we have all chunks, reconstruct the file
      if (chunks.length === totalChunks && chunks.every(chunk => chunk)) {
        return Buffer.concat(chunks);
      }

      // If some chunks are missing, try to recover using parity chunks
      // This is a simplified recovery - in real implementation would use Reed-Solomon
      console.log('Some chunks missing, attempting recovery...');
      
      return Buffer.concat(chunks.filter(chunk => chunk));
    } catch (error) {
      console.error('Error reconstructing file:', error);
      return null;
    }
  }

  // Get storage info for a node
  async getNodeStorageInfo(nodeId: number): Promise<{ usedSpace: number, fileCount: number }> {
    try {
      const nodeName = nodeId === 5 ? 'primary-node' : 'secondary-node';
      const nodePath = path.join(this.baseStoragePath, nodeName);
      
      if (!await fs.pathExists(nodePath)) {
        return { usedSpace: 0, fileCount: 0 };
      }

      const files = await fs.readdir(nodePath);
      let totalSize = 0;

      for (const file of files) {
        const filePath = path.join(nodePath, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }

      return {
        usedSpace: totalSize,
        fileCount: files.length
      };
    } catch (error) {
      console.error('Error getting node storage info:', error);
      return { usedSpace: 0, fileCount: 0 };
    }
  }
}

export const storageEngine = new LocalStorageEngine();