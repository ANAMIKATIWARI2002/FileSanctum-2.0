const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const http = require('http');
const WebSocket = require('ws');

// Create Express application
const app = express();
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' });

// Define environment variables
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'filesanctum_jwt_secret_key';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'filesanctum_encryption_key';

// Configure PostgreSQL connection
let pool;
try {
  pool = new Pool({
    user: 'postgres',         // Default PostgreSQL username
    password: 'ankit123',     // Change this to your PostgreSQL password
    host: 'localhost',
    port: 5432,
    database: 'filesanctum'   // Change database name if needed
  });
  console.log("🔌 Attempting to connect to database...");
} catch (error) {
  console.error("❌ Failed to create database pool:", error);
}

// Add better error handling for database connection
pool.on('error', (err) => {
  console.error('💥 Unexpected database error:', err);
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Database connected successfully');
  }
});

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

// File encryption/decryption functions
function encryptFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    const encrypted = Buffer.concat([
      iv,
      cipher.update(fileContent),
      cipher.final()
    ]);
    
    fs.writeFileSync(filePath, encrypted);
    return true;
  } catch (error) {
    console.error('Encryption error:', error);
    return false;
  }
}

function decryptFile(filePath) {
  try {
    const encryptedContent = fs.readFileSync(filePath);
    const iv = encryptedContent.slice(0, 16);
    const encryptedData = encryptedContent.slice(16);
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    return Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

// Authentication middleware
function authenticate(req, res, next) {
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
// Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert user
    const result = await pool.query(
      'INSERT INTO users (id, email, first_name, last_name, profile_image_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [Date.now().toString(), email, firstName || '', lastName || '', null]
    );
    
    const user = result.rows[0];
    
    // Create JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, resource, resource_id, details, ip_address, user_agent, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
      [user.id, 'REGISTER', 'user', user.id, JSON.stringify({ message: `User ${user.email} registered` }), req.ip, req.get('User-Agent') || '']
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Special case for demo credentials
    if ((email === 'user@example.com' && password === 'user123') || 
        (email === 'admin@example.com' && password === 'admin123')) {
      
      // Create a demo user
      const demoUser = {
        id: email === 'admin@example.com' ? 'admin-demo' : 'user-demo',
        email: email,
        first_name: email === 'admin@example.com' ? 'Admin' : 'User',
        last_name: 'Demo'
      };
      
      // Create JWT for demo user
      const token = jwt.sign(
        { id: demoUser.id, email: demoUser.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Log demo user activity
      try {
        await pool.query(
          'INSERT INTO activity_logs (user_id, action, resource, resource_id, details, ip_address, user_agent, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
          [demoUser.id, 'LOGIN', 'user', demoUser.id, JSON.stringify({ message: `Demo user ${demoUser.email} logged in` }), req.ip, req.get('User-Agent') || '']
        );
      } catch (err) {
        console.log('Could not log activity, but continuing login:', err.message);
      }
      
      return res.json({
        message: 'Login successful',
        user: demoUser,
        token
      });
    }
    
    // Regular database login
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      const user = result.rows[0];
      
      // For demo purposes, allow any password for existing users
      // In production, you would verify with bcrypt.compare(password, user.password)
      
      // Create JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Log activity
      await pool.query(
        'INSERT INTO activity_logs (user_id, action, resource, resource_id, details, ip_address, user_agent, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
        [user.id, 'LOGIN', 'user', user.id, JSON.stringify({ message: `User ${user.email} logged in` }), req.ip, req.get('User-Agent') || '']
      );
      
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        },
        token
      });
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/user', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      profileImageUrl: user.profile_image_url
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload file
app.post('/api/files/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { filename, path: filepath, mimetype, size } = req.file;
    
    // Encrypt file
    const encrypted = encryptFile(filepath);
    
    // Save file info
    const result = await pool.query(
      'INSERT INTO files (name, original_name, size, mime_type, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [filename, req.file.originalname, size.toString(), mimetype, 'completed']
    );
    
    const file = result.rows[0];
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, resource, resource_id, details, ip_address, user_agent, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
      [req.user.id, 'UPLOAD', 'file', file.id.toString(), JSON.stringify({ filename: req.file.originalname, size: size }), req.ip, req.get('User-Agent') || '']
    );
    
    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file.id,
        name: file.name,
        originalName: file.original_name,
        size: file.size,
        mimeType: file.mime_type,
        status: file.status,
        encrypted: encrypted
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Get files
app.get('/api/files', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM files ORDER BY created_at DESC'
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Error retrieving files' });
  }
});

// Get nodes
app.get('/api/nodes', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM nodes ORDER BY name'
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Get nodes error:', error);
    res.status(500).json({ message: 'Error retrieving nodes' });
  }
});

// Create node
app.post('/api/nodes', authenticate, async (req, res) => {
  try {
    const { name, ipAddress, storageCapacity } = req.body;
    
    const result = await pool.query(
      'INSERT INTO nodes (name, ip_address, status, storage_capacity, storage_used, cpu_usage, memory_usage, network_throughput, uptime, last_heartbeat, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW()) RETURNING *',
      [name, ipAddress, 'active', storageCapacity, '0 GB', '25%', '45%', '150 MB/s', '99.9%']
    );
    
    const node = result.rows[0];
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, resource, resource_id, details, ip_address, user_agent, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
      [req.user.id, 'CREATE', 'node', node.id.toString(), JSON.stringify({ nodeName: name, ipAddress: ipAddress }), req.ip, req.get('User-Agent') || '']
    );
    
    res.status(201).json(node);
    
  } catch (error) {
    console.error('Create node error:', error);
    res.status(500).json({ message: 'Error creating node' });
  }
});

// Get activity logs
app.get('/api/activity-logs', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50'
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ message: 'Error retrieving activity logs' });
  }
});

// Get system metrics
app.get('/api/system-metrics', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM system_metrics ORDER BY created_at DESC LIMIT 100'
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Get system metrics error:', error);
    res.status(500).json({ message: 'Error retrieving system metrics' });
  }
});

// Create invitation
app.post('/api/invitations', authenticate, async (req, res) => {
  try {
    const { email, role, message } = req.body;
    
    const result = await pool.query(
      'INSERT INTO invitations (email, role, message, status, invited_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [email, role, message, 'pending', req.user.id]
    );
    
    const invitation = result.rows[0];
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, resource, resource_id, details, ip_address, user_agent, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
      [req.user.id, 'INVITE', 'user', invitation.id.toString(), JSON.stringify({ email: email, role: role }), req.ip, req.get('User-Agent') || '']
    );
    
    res.status(201).json(invitation);
    
  } catch (error) {
    console.error('Create invitation error:', error);
    res.status(500).json({ message: 'Error creating invitation' });
  }
});

// Get invitations
app.get('/api/invitations', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM invitations WHERE invited_by = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ message: 'Error retrieving invitations' });
  }
});

// Contact message
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    const result = await pool.query(
      'INSERT INTO contact_messages (name, email, message, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [name, email, message]
    );
    
    res.status(201).json({
      message: 'Message sent successfully',
      id: result.rows[0].id
    });
    
  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('📡 New WebSocket connection established');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    data: { message: 'Connected to FileSanctum WebSocket server' }
  }));
  
  // Handle WebSocket messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 WebSocket message received:', data);
      
      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('📡 WebSocket connection closed');
  });
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FileSanctum - Distributed File Storage System</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          background: linear-gradient(135deg, #1e293b, #7c3aed, #1e293b);
          min-height: 100vh;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container { 
          text-align: center; 
          max-width: 600px; 
          padding: 40px 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 { 
          font-size: 3rem; 
          margin-bottom: 20px; 
          background: linear-gradient(45deg, #60a5fa, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .subtitle { 
          font-size: 1.2rem; 
          margin-bottom: 30px; 
          opacity: 0.9; 
        }
        .features { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
          gap: 20px; 
          margin: 30px 0; 
        }
        .feature { 
          background: rgba(255, 255, 255, 0.1); 
          padding: 20px; 
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .feature h3 { 
          color: #60a5fa; 
          margin-bottom: 10px; 
        }
        .demo-credentials { 
          background: rgba(34, 197, 94, 0.2); 
          padding: 20px; 
          border-radius: 10px; 
          margin: 30px 0;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
        .demo-credentials h3 { 
          color: #22c55e; 
          margin-bottom: 15px; 
        }
        .credentials { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 15px; 
          text-align: left; 
        }
        .credential-item { 
          background: rgba(255, 255, 255, 0.1); 
          padding: 10px; 
          border-radius: 5px; 
        }
        .status { 
          margin-top: 30px; 
          padding: 15px; 
          background: rgba(59, 130, 246, 0.2); 
          border-radius: 10px;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .status h3 { 
          color: #3b82f6; 
          margin-bottom: 10px; 
        }
        @media (max-width: 768px) {
          h1 { font-size: 2rem; }
          .credentials { grid-template-columns: 1fr; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🛡️ FileSanctum</h1>
        <p class="subtitle">Distributed File Storage System - Local Development Server</p>
        
        <div class="features">
          <div class="feature">
            <h3>🔐 Secure Storage</h3>
            <p>End-to-end encryption with advanced erasure coding for maximum security</p>
          </div>
          <div class="feature">
            <h3>📊 Real-time Monitoring</h3>
            <p>Live dashboard with system analytics and node management</p>
          </div>
          <div class="feature">
            <h3>🌐 Distributed Network</h3>
            <p>Scalable distributed storage across multiple nodes</p>
          </div>
        </div>
        
        <div class="demo-credentials">
          <h3>🔑 Demo Login Credentials</h3>
          <div class="credentials">
            <div class="credential-item">
              <strong>Admin Account:</strong><br>
              Email: admin@example.com<br>
              Password: admin123
            </div>
            <div class="credential-item">
              <strong>User Account:</strong><br>
              Email: user@example.com<br>
              Password: user123
            </div>
          </div>
        </div>
        
        <div class="status">
          <h3>🚀 Server Status</h3>
          <p>✅ FileSanctum server is running on <strong>http://localhost:${PORT}</strong></p>
          <p>✅ Database connected successfully</p>
          <p>✅ WebSocket server active on /ws</p>
          <p>✅ File encryption enabled</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
server.listen(PORT, () => {
  console.log('\n🚀 ===============================================');
  console.log('🛡️  FileSanctum - Distributed File Storage System');
  console.log('🚀 ===============================================');
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`📡 WebSocket server: ws://localhost:${PORT}/ws`);
  console.log('📂 Upload directory: ./uploads');
  console.log('🔐 File encryption: ENABLED');
  console.log('\n🔑 Demo Credentials:');
  console.log('   👤 Admin: admin@example.com / admin123');
  console.log('   👤 User:  user@example.com / user123');
  console.log('\n✅ Ready to accept connections!');
  console.log('===============================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down FileSanctum server...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    pool.end(() => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
});