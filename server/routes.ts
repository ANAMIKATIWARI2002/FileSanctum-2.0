import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertNodeSchema, insertInvitationSchema, insertActivityLogSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";
import jwt from "jsonwebtoken";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10GB limit
});

// Simple authentication middleware - allow all requests for demo
const isAuthenticated = (req: any, res: any, next: any) => {
  // Set demo user for all requests
  req.user = { id: 'demo', email: 'demo@example.com' };
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Cookie parser for token handling
  app.use((req: any, res: any, next: any) => {
    const cookies = req.headers.cookie;
    req.cookies = {};
    if (cookies) {
      cookies.split(';').forEach((cookie: string) => {
        const [key, value] = cookie.trim().split('=');
        req.cookies[key] = value;
      });
    }
    next();
  });

  // Simple login for demo credentials
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if ((email === 'admin@example.com' && password === 'admin123') || 
          (email === 'user@example.com' && password === 'user123')) {
        
        const demoUser = await storage.upsertUser({
          id: email === 'admin@example.com' ? 'admin-demo' : 'user-demo',
          email: email,
          firstName: email === 'admin@example.com' ? 'Admin' : 'Demo',
          lastName: 'User',
          profileImageUrl: null
        });
        
        // Create JWT token
        const token = jwt.sign(
          { 
            id: demoUser.id, 
            email: demoUser.email, 
            firstName: demoUser.firstName,
            lastName: demoUser.lastName 
          },
          process.env.JWT_SECRET || 'filesanctum-secret',
          { expiresIn: '24h' }
        );
        
        await storage.createActivityLog({
          userId: demoUser.id,
          action: 'LOGIN',
          resource: 'user',
          resourceId: demoUser.id,
          details: { message: `User ${demoUser.email} logged in` },
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        });
        
        // Set cookie and send response
        res.cookie('authToken', token, {
          httpOnly: true,
          secure: false,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          sameSite: 'lax'
        });
        
        res.json({ message: 'Login successful', user: demoUser, token });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get current user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req: any, res) => {
    res.clearCookie('authToken');
    res.json({ message: 'Logged out successfully' });
  });

  // Node management routes
  app.get("/api/nodes", isAuthenticated, async (req, res) => {
    try {
      const nodes = await storage.getAllNodes();
      res.json(nodes);
    } catch (error) {
      console.error("Error fetching nodes:", error);
      res.status(500).json({ message: "Failed to fetch nodes" });
    }
  });

  app.post("/api/nodes", async (req: any, res) => {
    try {
      const nodeData = insertNodeSchema.parse(req.body);
      const node = await storage.createNode(nodeData);
      
      // Log activity
      await storage.createActivityLog({
        userId: 'demo-user',
        action: "node_added",
        resource: "node",
        resourceId: node.id.toString(),
        details: { nodeName: node.name, ipAddress: node.ipAddress },
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.get('User-Agent') || 'Unknown',
      });

      res.json(node);
    } catch (error) {
      console.error("Error creating node:", error);
      res.status(500).json({ message: "Failed to create node" });
    }
  });

  app.put("/api/nodes/:id/recover", isAuthenticated, async (req: any, res) => {
    try {
      const nodeId = parseInt(req.params.id);
      const node = await storage.updateNode(nodeId, { status: "healthy" });
      
      if (node) {
        // Log activity
        await storage.createActivityLog({
          userId: 'demo-user',
          action: "node_recovery",
          resource: "node",
          resourceId: nodeId.toString(),
          details: { nodeName: node.name },
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.get('User-Agent') || 'Unknown',
        });
      }

      res.json(node);
    } catch (error) {
      console.error("Error recovering node:", error);
      res.status(500).json({ message: "Failed to recover node" });
    }
  });

  app.delete("/api/nodes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const nodeId = parseInt(req.params.id);
      const node = await storage.getNode(nodeId);
      
      if (!node) {
        return res.status(404).json({ message: "Node not found" });
      }

      const deleted = await storage.deleteNode(nodeId);
      
      if (deleted) {
        // Log activity
        await storage.createActivityLog({
          userId: 'demo-user',
          action: "node_deleted",
          resource: "node",
          resourceId: nodeId.toString(),
          details: { nodeName: node.name, ipAddress: node.ipAddress },
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.get('User-Agent') || 'Unknown',
        });
      }

      res.json({ success: deleted, message: deleted ? "Node deleted successfully" : "Failed to delete node" });
    } catch (error) {
      console.error("Error deleting node:", error);
      res.status(500).json({ message: "Failed to delete node" });
    }
  });

  // File management routes
  app.get("/api/files", isAuthenticated, async (req: any, res) => {
    try {
      const files = await storage.getAllFiles();
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // File download route
  app.get('/api/files/:id/download', isAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // In a real implementation, you would fetch the file from storage
      // For now, we'll create a simple text file as demonstration
      const content = `This is a demo file: ${file.originalName}\nFile ID: ${file.id}\nSize: ${file.size} bytes`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
      res.send(content);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  app.post("/api/files/upload", upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const file = await storage.createFile({
        name: req.file.filename || req.file.originalname,
        originalName: req.file.originalname,
        size: req.file.size.toString(),
        mimeType: req.file.mimetype,
        uploadedBy: 'demo-user',
        status: "uploading",
        erasureCoding: {
          k: 6, // data chunks
          m: 3, // parity chunks
          algorithm: "Reed-Solomon"
        },
        encryptionKey: "AES-256-GCM", // In production, this would be properly generated
        checksum: "placeholder-checksum", // In production, calculate actual checksum
      });

      // Log activity
      await storage.createActivityLog({
        userId: 'demo-user',
        action: "file_upload_started",
        resource: "file",
        resourceId: file.id.toString(),
        details: { fileName: file.originalName, fileSize: file.size },
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.get('User-Agent') || 'Unknown',
      });

      // Simulate file processing and update status
      setTimeout(async () => {
        await storage.updateFileStatus(file.id, "stored");
        await storage.createActivityLog({
          userId: 'demo-user',
          action: "file_upload_completed",
          resource: "file",
          resourceId: file.id.toString(),
          details: { fileName: file.originalName },
          ipAddress: '127.0.0.1',
          userAgent: 'Unknown',
        });
      }, 2000);

      res.json(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.delete("/api/files/:id", isAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Skip authorization check for demo

      const deleted = await storage.deleteFile(fileId);
      
      if (deleted) {
        // Log activity
        await storage.createActivityLog({
          userId: 'demo-user',
          action: "file_deleted",
          resource: "file",
          resourceId: fileId.toString(),
          details: { fileName: file.originalName },
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.get('User-Agent') || 'Unknown',
        });
      }

      res.json({ success: deleted });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Activity logs route
  app.get("/api/activity-logs", isAuthenticated, async (req, res) => {
    try {
      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Invitation routes
  app.get("/api/invitations", isAuthenticated, async (req: any, res) => {
    try {
      const invitations = await storage.getInvitations('demo-user');
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.post("/api/invitations", isAuthenticated, async (req: any, res) => {
    try {
      const invitationData = insertInvitationSchema.parse({
        ...req.body,
        invitedBy: 'demo-user',
        token: 'demo-token-' + Date.now(),
      });
      
      const invitation = await storage.createInvitation(invitationData);
      
      // Log activity
      await storage.createActivityLog({
        userId: 'demo-user',
        action: "user_invited",
        resource: "invitation",
        resourceId: invitation.id.toString(),
        details: { email: invitation.email, role: invitation.role },
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.get('User-Agent') || 'Unknown',
      });

      res.json(invitation);
    } catch (error) {
      console.error("Error creating invitation:", error);
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });

  // System metrics routes
  app.get("/api/metrics", isAuthenticated, async (req, res) => {
    try {
      const { type, hours } = req.query;
      const metrics = await storage.getSystemMetrics(
        type as string,
        hours ? parseInt(hours as string) : undefined
      );
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // System stats route
  app.get("/api/system/stats", isAuthenticated, async (req, res) => {
    try {
      const nodes = await storage.getAllNodes();
      const files = await storage.getAllFiles();
      
      const activeNodes = nodes.filter(node => node.status === "healthy").length;
      const totalStorage = files.reduce((sum, file) => sum + parseFloat(file.size), 0);
      const totalFiles = files.length;
      
      const stats = {
        activeNodes,
        totalStorage: `${(totalStorage / (1024 * 1024 * 1024)).toFixed(1)} GB`,
        totalFiles,
        encryptionLevel: "AES-256",
        nodeStatus: {
          healthy: nodes.filter(n => n.status === "healthy").length,
          degraded: nodes.filter(n => n.status === "degraded").length,
          failed: nodes.filter(n => n.status === "failed").length,
        }
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ message: "Failed to fetch system stats" });
    }
  });

  // Contact message routes
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, message } = req.body;
      
      if (!name || !email || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const contactMessage = await storage.createContactMessage({
        name,
        email,
        message,
      });

      res.json({ message: "Message sent successfully", id: contactMessage.id });
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/contact-messages', isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    // Send periodic updates
    const interval = setInterval(async () => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          const nodes = await storage.getAllNodes();
          ws.send(JSON.stringify({
            type: 'nodeUpdate',
            data: nodes
          }));
        } catch (error) {
          console.error('Error sending WebSocket update:', error);
        }
      }
    }, 5000);

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clearInterval(interval);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(interval);
    });
  });

  // Initialize some default nodes if none exist
  setTimeout(async () => {
    try {
      const existingNodes = await storage.getAllNodes();
      if (existingNodes.length === 0) {
        const defaultNodes = [];
        for (let i = 1; i <= 12; i++) {
          defaultNodes.push({
            name: `Node${i}`,
            ipAddress: `192.168.1.${100 + i}`,
            port: 8080,
            status: i <= 10 ? "healthy" : (i === 11 ? "degraded" : "degraded"),
            storageCapacity: "1000",
            storageUsed: `${Math.floor(Math.random() * 300) + 600}`,
            cpuUsage: `${Math.floor(Math.random() * 30) + 15}`,
            memoryUsage: `${Math.floor(Math.random() * 40) + 50}`,
            networkThroughput: `${(Math.random() * 0.5 + 0.8).toFixed(1)}`,
            uptime: `${(Math.random() * 2 + 97).toFixed(1)}`,
          });
        }
        
        for (const node of defaultNodes) {
          await storage.createNode(node);
        }
        console.log('Default nodes created');
      }
    } catch (error) {
      console.error('Error creating default nodes:', error);
    }
  }, 1000);

  return httpServer;
}
