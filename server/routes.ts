import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertNodeSchema, insertInvitationSchema, insertActivityLogSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10GB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
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

  app.post("/api/nodes", isAuthenticated, async (req: any, res) => {
    try {
      const nodeData = insertNodeSchema.parse(req.body);
      const node = await storage.createNode(nodeData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: "node_added",
        resource: "node",
        resourceId: node.id.toString(),
        details: { nodeName: node.name, ipAddress: node.ipAddress },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
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
          userId: req.user.claims.sub,
          action: "node_recovery",
          resource: "node",
          resourceId: nodeId.toString(),
          details: { nodeName: node.name },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
      }

      res.json(node);
    } catch (error) {
      console.error("Error recovering node:", error);
      res.status(500).json({ message: "Failed to recover node" });
    }
  });

  // File management routes
  app.get("/api/files", isAuthenticated, async (req: any, res) => {
    try {
      const files = await storage.getAllFiles(req.user.claims.sub);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.post("/api/files/upload", isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const file = await storage.createFile({
        name: req.file.filename || req.file.originalname,
        originalName: req.file.originalname,
        size: req.file.size.toString(),
        mimeType: req.file.mimetype,
        uploadedBy: req.user.claims.sub,
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
        userId: req.user.claims.sub,
        action: "file_upload_started",
        resource: "file",
        resourceId: file.id.toString(),
        details: { fileName: file.originalName, fileSize: file.size },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Simulate file processing and update status
      setTimeout(async () => {
        await storage.updateFileStatus(file.id, "stored");
        await storage.createActivityLog({
          userId: req.user.claims.sub,
          action: "file_upload_completed",
          resource: "file",
          resourceId: file.id.toString(),
          details: { fileName: file.originalName },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
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

      if (file.uploadedBy !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const deleted = await storage.deleteFile(fileId);
      
      if (deleted) {
        // Log activity
        await storage.createActivityLog({
          userId: req.user.claims.sub,
          action: "file_deleted",
          resource: "file",
          resourceId: fileId.toString(),
          details: { fileName: file.originalName },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
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
      const invitations = await storage.getInvitations(req.user.claims.sub);
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
        invitedBy: req.user.claims.sub,
      });
      
      const invitation = await storage.createInvitation(invitationData);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: "user_invited",
        resource: "invitation",
        resourceId: invitation.id.toString(),
        details: { email: invitation.email, role: invitation.role },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
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
