const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');

// Create Express application
const app = express();
app.use(express.json());

// Define environment variables
const PORT = process.env.PORT || 5000;

// In-memory data storage (no database required)
let users = [
  {
    id: 'admin-demo',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'Demo',
    profileImageUrl: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-demo', 
    email: 'user@example.com',
    firstName: 'User',
    lastName: 'Demo',
    profileImageUrl: null,
    createdAt: new Date().toISOString()
  }
];

let files = [
  {
    id: 1,
    name: 'sample-document.pdf',
    originalName: 'sample-document.pdf',
    size: '2048576',
    mimeType: 'application/pdf',
    status: 'stored',
    defaultNodeId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'project-presentation.pptx',
    originalName: 'project-presentation.pptx', 
    size: '5242880',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    status: 'stored',
    defaultNodeId: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let nodes = [
  {
    id: 1,
    name: 'Primary Node',
    ipAddress: '192.168.1.100',
    status: 'active',
    storageCapacity: '2.0 GB',
    storageUsed: '0.8 GB',
    cpuUsage: '25%',
    memoryUsage: '45%',
    networkThroughput: '150 MB/s',
    uptime: '99.9%',
    lastHeartbeat: new Date().toISOString(),
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Secondary Node',
    ipAddress: '192.168.1.101',
    status: 'active',
    storageCapacity: '3.0 GB',
    storageUsed: '1.2 GB',
    cpuUsage: '30%',
    memoryUsage: '55%',
    networkThroughput: '200 MB/s',
    uptime: '98.5%',
    lastHeartbeat: new Date().toISOString(),
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Backup Node',
    ipAddress: '192.168.1.102',
    status: 'maintenance',
    storageCapacity: '1.5 GB',
    storageUsed: '0.3 GB',
    cpuUsage: '15%',
    memoryUsage: '30%',
    networkThroughput: '100 MB/s',
    uptime: '95.2%',
    lastHeartbeat: new Date(Date.now() - 300000).toISOString(),
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let activityLogs = [
  {
    id: 1,
    userId: 'admin-demo',
    action: 'file_upload_completed',
    resource: 'file',
    resourceId: '1',
    details: { fileName: 'sample-document.pdf', fileSize: '2048576' },
    ipAddress: '127.0.0.1',
    userAgent: 'Demo Browser',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    userId: 'user-demo',
    action: 'node_created',
    resource: 'node',
    resourceId: '3',
    details: { nodeName: 'Backup Node', ipAddress: '192.168.1.102' },
    ipAddress: '127.0.0.1',
    userAgent: 'Demo Browser',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

let invitations = [
  {
    id: 1,
    email: 'newuser@example.com',
    role: 'user',
    message: 'Welcome to FileSanctum',
    status: 'pending',
    invitedBy: 'admin-demo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let systemMetrics = [
  {
    id: 1,
    metricType: 'storage',
    value: 85.5,
    unit: 'percent',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    metricType: 'cpu',
    value: 45.2,
    unit: 'percent',
    createdAt: new Date().toISOString()
  }
];

// Setup file storage
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Simple authentication - no JWT needed for demo
let currentUser = null;

// Middleware to check authentication
function authenticate(req, res, next) {
  if (!currentUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  req.user = currentUser;
  next();
}

// Serve the client files directly from client/dist or fallback to a simple HTML
const clientDistPath = path.join(__dirname, 'client', 'dist');
const distPath = path.join(__dirname, 'dist');

// Try to serve from either location
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
} else if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
} else {
  // Create a simple landing page if no built files exist
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>FileSanctum DFSS - Local Demo</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          .container { text-align: center; }
          .credentials { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .features { text-align: left; margin: 20px 0; }
          .api-test { background: #e8f5e8; padding: 15px; margin: 10px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 FileSanctum DFSS - Local Demo Server</h1>
          <p>Your Distributed File Storage System is running successfully!</p>
          
          <div class="credentials">
            <h3>📋 Demo Credentials</h3>
            <p><strong>Admin:</strong> admin@example.com / admin123</p>
            <p><strong>User:</strong> user@example.com / user123</p>
          </div>

          <div class="features">
            <h3>✨ Available Features</h3>
            <ul>
              <li>File Upload & Management</li>
              <li>Node Management & Monitoring</li>
              <li>Manual Node Selection for Files</li>
              <li>Real-time Activity Logging</li>
              <li>System Analytics Dashboard</li>
              <li>User Invitation System</li>
            </ul>
          </div>

          <div class="api-test">
            <h3>🔗 API Endpoints Available</h3>
            <p>Test the API directly:</p>
            <ul>
              <li>POST /api/auth/login - Authentication</li>
              <li>GET /api/nodes - Storage nodes</li>
              <li>GET /api/files - File management</li>
              <li>GET /api/activity-logs - Activity tracking</li>
            </ul>
          </div>

          <p style="margin-top: 30px;">
            <strong>Note:</strong> To access the full web interface, build the frontend with <code>npm run build</code>
          </p>
        </div>
      </body>
      </html>
    `);
  });
}

// API Routes

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if ((email === 'admin@example.com' && password === 'admin123') ||
      (email === 'user@example.com' && password === 'user123')) {
    
    currentUser = users.find(u => u.email === email);
    
    // Add login activity
    activityLogs.unshift({
      id: activityLogs.length + 1,
      userId: currentUser.id,
      action: 'user_login',
      resource: 'user',
      resourceId: currentUser.id,
      details: { email: currentUser.email },
      ipAddress: '127.0.0.1',
      userAgent: 'Demo Browser',
      createdAt: new Date().toISOString()
    });
    
    res.json({
      message: 'Login successful',
      user: currentUser,
      token: 'demo-token'
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Get current user
app.get('/api/auth/user', authenticate, (req, res) => {
  res.json(currentUser);
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  currentUser = null;
  res.json({ message: 'Logged out successfully' });
});

// Files
app.get('/api/files', authenticate, (req, res) => {
  res.json(files);
});

app.post('/api/files/upload', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file provided' });
  }

  const newFile = {
    id: files.length + 1,
    name: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size.toString(),
    mimeType: req.file.mimetype,
    status: 'stored',
    defaultNodeId: nodes.find(n => n.isDefault)?.id || 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  files.push(newFile);

  // Add activity log
  activityLogs.unshift({
    id: activityLogs.length + 1,
    userId: currentUser.id,
    action: 'file_upload_completed',
    resource: 'file',
    resourceId: newFile.id.toString(),
    details: { fileName: newFile.originalName, fileSize: newFile.size },
    ipAddress: '127.0.0.1',
    userAgent: 'Demo Browser',
    createdAt: new Date().toISOString()
  });

  res.json(newFile);
});

app.delete('/api/files/:id', authenticate, (req, res) => {
  const fileId = parseInt(req.params.id);
  const fileIndex = files.findIndex(f => f.id === fileId);
  
  if (fileIndex === -1) {
    return res.status(404).json({ message: 'File not found' });
  }

  const deletedFile = files[fileIndex];
  files.splice(fileIndex, 1);

  // Add activity log
  activityLogs.unshift({
    id: activityLogs.length + 1,
    userId: currentUser.id,
    action: 'file_deleted',
    resource: 'file',
    resourceId: fileId.toString(),
    details: { fileName: deletedFile.originalName },
    ipAddress: '127.0.0.1',
    userAgent: 'Demo Browser',
    createdAt: new Date().toISOString()
  });

  res.json({ success: true });
});

app.put('/api/files/move-to-node', authenticate, (req, res) => {
  const { fileIds, nodeId } = req.body;
  
  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    return res.status(400).json({ message: 'File IDs are required' });
  }
  
  if (!nodeId) {
    return res.status(400).json({ message: 'Node ID is required' });
  }

  const updatedFiles = [];
  fileIds.forEach(fileId => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      file.defaultNodeId = parseInt(nodeId);
      file.updatedAt = new Date().toISOString();
      updatedFiles.push(file);
    }
  });

  // Add activity log
  activityLogs.unshift({
    id: activityLogs.length + 1,
    userId: currentUser.id,
    action: 'files_moved',
    resource: 'files',
    resourceId: fileIds.join(','),
    details: { 
      fileCount: fileIds.length,
      targetNodeId: nodeId,
      movedFiles: updatedFiles.length
    },
    ipAddress: '127.0.0.1',
    userAgent: 'Demo Browser',
    createdAt: new Date().toISOString()
  });

  res.json({ 
    message: 'Files moved successfully',
    movedCount: updatedFiles.length,
    files: updatedFiles
  });
});

// Nodes
app.get('/api/nodes', authenticate, (req, res) => {
  res.json(nodes);
});

app.post('/api/nodes', authenticate, (req, res) => {
  const { name, storageCapacity } = req.body;
  
  const newNode = {
    id: nodes.length + 1,
    name: name,
    ipAddress: `192.168.1.${100 + nodes.length}`,
    status: 'active',
    storageCapacity: storageCapacity || '2.0 GB',
    storageUsed: '0.0 GB',
    cpuUsage: '20%',
    memoryUsage: '35%',
    networkThroughput: '150 MB/s',
    uptime: '100%',
    lastHeartbeat: new Date().toISOString(),
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  nodes.push(newNode);

  // Add activity log
  activityLogs.unshift({
    id: activityLogs.length + 1,
    userId: currentUser.id,
    action: 'node_created',
    resource: 'node',
    resourceId: newNode.id.toString(),
    details: { nodeName: newNode.name, ipAddress: newNode.ipAddress },
    ipAddress: '127.0.0.1',
    userAgent: 'Demo Browser',
    createdAt: new Date().toISOString()
  });

  res.json(newNode);
});

app.put('/api/nodes/:id/set-default', authenticate, (req, res) => {
  const nodeId = parseInt(req.params.id);
  
  // Remove default from all nodes
  nodes.forEach(node => {
    node.isDefault = false;
    node.updatedAt = new Date().toISOString();
  });
  
  // Set new default
  const targetNode = nodes.find(n => n.id === nodeId);
  if (targetNode) {
    targetNode.isDefault = true;
    targetNode.updatedAt = new Date().toISOString();
    
    // Add activity log
    activityLogs.unshift({
      id: activityLogs.length + 1,
      userId: currentUser.id,
      action: 'node_set_default',
      resource: 'node',
      resourceId: nodeId.toString(),
      details: { nodeName: targetNode.name },
      ipAddress: '127.0.0.1',
      userAgent: 'Demo Browser',
      createdAt: new Date().toISOString()
    });
    
    res.json(targetNode);
  } else {
    res.status(404).json({ message: 'Node not found' });
  }
});

app.delete('/api/nodes/:id', authenticate, (req, res) => {
  const nodeId = parseInt(req.params.id);
  const nodeIndex = nodes.findIndex(n => n.id === nodeId);
  
  if (nodeIndex === -1) {
    return res.status(404).json({ message: 'Node not found' });
  }

  const deletedNode = nodes[nodeIndex];
  nodes.splice(nodeIndex, 1);

  // Add activity log
  activityLogs.unshift({
    id: activityLogs.length + 1,
    userId: currentUser.id,
    action: 'node_deleted',
    resource: 'node',
    resourceId: nodeId.toString(),
    details: { nodeName: deletedNode.name },
    ipAddress: '127.0.0.1',
    userAgent: 'Demo Browser',
    createdAt: new Date().toISOString()
  });

  res.json({ success: true });
});

// Activity Logs
app.get('/api/activity-logs', authenticate, (req, res) => {
  res.json(activityLogs.slice(0, 50)); // Return latest 50 logs
});

app.delete('/api/activity-logs/:id', authenticate, (req, res) => {
  const logId = parseInt(req.params.id);
  const logIndex = activityLogs.findIndex(log => log.id === logId);
  
  if (logIndex === -1) {
    return res.status(404).json({ message: 'Activity log not found' });
  }

  activityLogs.splice(logIndex, 1);
  res.json({ success: true });
});

// System Stats
app.get('/api/system/stats', authenticate, (req, res) => {
  const activeNodes = nodes.filter(n => n.status === 'active').length;
  const totalStorageGB = nodes.reduce((total, node) => {
    const capacity = parseFloat(node.storageCapacity.replace(' GB', ''));
    return total + capacity;
  }, 0);
  const usedStorageGB = nodes.reduce((total, node) => {
    const used = parseFloat(node.storageUsed.replace(' GB', ''));
    return total + used;
  }, 0);
  
  res.json({
    activeNodes,
    totalStorage: `${totalStorageGB.toFixed(1)} GB`,
    totalFiles: files.length,
    storageUsagePercent: totalStorageGB > 0 ? Math.round((usedStorageGB / totalStorageGB) * 100) : 0
  });
});

// System Metrics
app.get('/api/metrics', authenticate, (req, res) => {
  res.json(systemMetrics);
});

// Invitations
app.get('/api/invitations', authenticate, (req, res) => {
  res.json(invitations.filter(inv => inv.invitedBy === currentUser.id));
});

app.post('/api/invitations', authenticate, (req, res) => {
  const { email, role, message } = req.body;
  
  const newInvitation = {
    id: invitations.length + 1,
    email,
    role: role || 'user',
    message: message || '',
    status: 'pending',
    invitedBy: currentUser.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  invitations.push(newInvitation);

  // Add activity log
  activityLogs.unshift({
    id: activityLogs.length + 1,
    userId: currentUser.id,
    action: 'user_invited',
    resource: 'invitation',
    resourceId: newInvitation.id.toString(),
    details: { email, role },
    ipAddress: '127.0.0.1',
    userAgent: 'Demo Browser',
    createdAt: new Date().toISOString()
  });

  res.json(newInvitation);
});

// Serve the frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log('🚀 FileSanctum DFSS Demo Server Started!');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Demo Credentials:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   User:  user@example.com / user123');
  console.log('');
  console.log('✨ All features available:');
  console.log('   • File Upload & Management');
  console.log('   • Node Management & Monitoring');
  console.log('   • Manual Node Selection for Files');
  console.log('   • Real-time Activity Logging');
  console.log('   • System Analytics Dashboard');
  console.log('   • User Invitation System');
  console.log('');
  console.log('🎯 Ready for teacher demonstration!');
});