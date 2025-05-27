-- FileSanctum Database Setup
-- Run this file in PostgreSQL to create all necessary tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create sessions table (for authentication)
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions(expire);

-- Create nodes table
CREATE TABLE IF NOT EXISTS nodes (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  ip_address VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'active',
  storage_capacity VARCHAR NOT NULL,
  storage_used VARCHAR DEFAULT '0 GB',
  cpu_usage VARCHAR DEFAULT '0%',
  memory_usage VARCHAR DEFAULT '0%',
  network_throughput VARCHAR DEFAULT '0 MB/s',
  uptime VARCHAR DEFAULT '0%',
  last_heartbeat TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  original_name VARCHAR NOT NULL,
  size VARCHAR NOT NULL,
  mime_type VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create file_chunks table
CREATE TABLE IF NOT EXISTS file_chunks (
  id SERIAL PRIMARY KEY,
  file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  node_id INTEGER REFERENCES nodes(id),
  checksum VARCHAR NOT NULL,
  size VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  action VARCHAR NOT NULL,
  resource VARCHAR NOT NULL,
  resource_id VARCHAR NOT NULL,
  details JSONB,
  ip_address VARCHAR,
  user_agent VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id SERIAL PRIMARY KEY,
  email VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  message TEXT,
  status VARCHAR NOT NULL DEFAULT 'pending',
  invited_by VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create system_metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
  id SERIAL PRIMARY KEY,
  metric_type VARCHAR NOT NULL,
  value DECIMAL NOT NULL,
  unit VARCHAR,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default nodes
INSERT INTO nodes (name, ip_address, status, storage_capacity, storage_used, cpu_usage, memory_usage, network_throughput, uptime, last_heartbeat)
VALUES 
  ('node1', '192.168.1.101', 'active', '1 TB', '750 GB', '45%', '62%', '250 MB/s', '99.8%', NOW()),
  ('node2', '192.168.1.102', 'active', '1 TB', '680 GB', '38%', '55%', '180 MB/s', '99.9%', NOW()),
  ('node3', '192.168.1.103', 'active', '1 TB', '820 GB', '52%', '68%', '320 MB/s', '99.7%', NOW()),
  ('node4', '192.168.1.104', 'active', '2 TB', '1.2 TB', '35%', '48%', '290 MB/s', '99.9%', NOW()),
  ('node5', '192.168.1.105', 'active', '2 TB', '1.5 TB', '48%', '72%', '210 MB/s', '99.6%', NOW()),
  ('node6', '192.168.1.106', 'maintenance', '1 TB', '650 GB', '28%', '42%', '150 MB/s', '98.5%', NOW()),
  ('node7', '192.168.1.107', 'active', '2 TB', '1.1 TB', '42%', '58%', '275 MB/s', '99.8%', NOW()),
  ('node8', '192.168.1.108', 'active', '1 TB', '590 GB', '36%', '51%', '195 MB/s', '99.9%', NOW()),
  ('node9', '192.168.1.109', 'active', '2 TB', '1.7 TB', '55%', '78%', '340 MB/s', '99.4%', NOW()),
  ('node10', '192.168.1.110', 'active', '1 TB', '720 GB', '41%', '64%', '225 MB/s', '99.7%', NOW())
ON CONFLICT DO NOTHING;

-- Insert sample system metrics
INSERT INTO system_metrics (metric_type, value, unit, timestamp)
VALUES 
  ('cpu_usage', 45.2, '%', NOW() - INTERVAL '1 hour'),
  ('memory_usage', 68.5, '%', NOW() - INTERVAL '1 hour'),
  ('storage_usage', 75.8, '%', NOW() - INTERVAL '1 hour'),
  ('network_throughput', 245.3, 'MB/s', NOW() - INTERVAL '1 hour'),
  ('cpu_usage', 42.1, '%', NOW() - INTERVAL '30 minutes'),
  ('memory_usage', 65.2, '%', NOW() - INTERVAL '30 minutes'),
  ('storage_usage', 76.1, '%', NOW() - INTERVAL '30 minutes'),
  ('network_throughput', 268.7, 'MB/s', NOW() - INTERVAL '30 minutes'),
  ('cpu_usage', 48.7, '%', NOW()),
  ('memory_usage', 71.3, '%', NOW()),
  ('storage_usage', 76.4, '%', NOW()),
  ('network_throughput', 289.5, 'MB/s', NOW())
ON CONFLICT DO NOTHING;

-- Insert demo users (optional - these will also be handled by the login system)
INSERT INTO users (id, email, first_name, last_name, profile_image_url)
VALUES 
  ('admin-demo', 'admin@example.com', 'Admin', 'User', NULL),
  ('user-demo', 'user@example.com', 'Demo', 'User', NULL)
ON CONFLICT (email) DO NOTHING;

COMMIT;