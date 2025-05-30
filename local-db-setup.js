// Local SQLite database setup for FileSanctum
const Database = require('better-sqlite3');
const path = require('path');

// Create SQLite database
const dbPath = path.join(__dirname, 'local-database.sqlite');
const db = new Database(dbPath);

// Create tables
function initializeDatabase() {
  console.log('Setting up local SQLite database...');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      first_name TEXT,
      last_name TEXT,
      profile_image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expire DATETIME NOT NULL
    )
  `);

  // Files table
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      size TEXT NOT NULL,
      mime_type TEXT,
      status TEXT DEFAULT 'stored',
      default_node_id INTEGER,
      encryption_key TEXT,
      checksum TEXT,
      erasure_coding TEXT,
      uploaded_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Nodes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      storage_capacity TEXT,
      storage_used TEXT DEFAULT '0 GB',
      cpu_usage TEXT DEFAULT '0%',
      memory_usage TEXT DEFAULT '0%',
      network_throughput TEXT DEFAULT '0 MB/s',
      uptime TEXT DEFAULT '100%',
      last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_default BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Activity logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Invitations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS invitations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      message TEXT,
      status TEXT DEFAULT 'pending',
      invited_by TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // System metrics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric_type TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert demo data
  insertDemoData();
}

function insertDemoData() {
  console.log('Inserting demo data...');

  // Demo users
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, first_name, last_name) 
    VALUES (?, ?, ?, ?)
  `);
  
  insertUser.run('admin-demo', 'admin@example.com', 'Admin', 'Demo');
  insertUser.run('user-demo', 'user@example.com', 'User', 'Demo');

  // Demo nodes
  const insertNode = db.prepare(`
    INSERT OR REPLACE INTO nodes 
    (name, ip_address, status, storage_capacity, storage_used, cpu_usage, memory_usage, network_throughput, uptime, is_default) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertNode.run('Primary Node', '192.168.1.100', 'active', '2.0 GB', '0.8 GB', '25%', '45%', '150 MB/s', '99.9%', true);
  insertNode.run('Secondary Node', '192.168.1.101', 'active', '3.0 GB', '1.2 GB', '30%', '55%', '200 MB/s', '98.5%', false);
  insertNode.run('Backup Node', '192.168.1.102', 'maintenance', '1.5 GB', '0.3 GB', '15%', '30%', '100 MB/s', '95.2%', false);

  // Demo files
  const insertFile = db.prepare(`
    INSERT OR REPLACE INTO files 
    (name, original_name, size, mime_type, status, default_node_id, uploaded_by) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertFile.run('sample-document.pdf', 'sample-document.pdf', '2048576', 'application/pdf', 'stored', 1, 'admin-demo');
  insertFile.run('project-presentation.pptx', 'project-presentation.pptx', '5242880', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'stored', 2, 'user-demo');

  // Demo activity logs
  const insertActivity = db.prepare(`
    INSERT OR REPLACE INTO activity_logs 
    (user_id, action, resource, resource_id, details, ip_address, user_agent) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertActivity.run('admin-demo', 'file_upload_completed', 'file', '1', '{"fileName":"sample-document.pdf","fileSize":"2048576"}', '127.0.0.1', 'Demo Browser');
  insertActivity.run('user-demo', 'node_created', 'node', '3', '{"nodeName":"Backup Node","ipAddress":"192.168.1.102"}', '127.0.0.1', 'Demo Browser');

  // Demo system metrics
  const insertMetric = db.prepare(`
    INSERT OR REPLACE INTO system_metrics (metric_type, value, unit) 
    VALUES (?, ?, ?)
  `);
  
  insertMetric.run('storage', 85.5, 'percent');
  insertMetric.run('cpu', 45.2, 'percent');
  insertMetric.run('memory', 67.8, 'percent');

  console.log('Demo data inserted successfully!');
}

// Initialize database
initializeDatabase();

console.log('Local SQLite database setup complete!');
console.log(`Database location: ${dbPath}`);

module.exports = { db };