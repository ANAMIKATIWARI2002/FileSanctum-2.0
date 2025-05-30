-- FileSanctum Database Setup Script
-- Run this after creating the 'filesanctum' database

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table (for authentication)
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- Create nodes table
CREATE TABLE IF NOT EXISTS nodes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  storage_capacity TEXT,
  storage_used TEXT DEFAULT '0 GB',
  cpu_usage TEXT DEFAULT '0%',
  memory_usage TEXT DEFAULT '0%',
  network_throughput TEXT DEFAULT '0 MB/s',
  uptime TEXT DEFAULT '100%',
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size TEXT NOT NULL,
  mime_type TEXT,
  status TEXT DEFAULT 'stored',
  default_node_id INTEGER REFERENCES nodes(id),
  encryption_key TEXT,
  checksum TEXT,
  erasure_coding JSONB,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file_chunks table
CREATE TABLE IF NOT EXISTS file_chunks (
  id SERIAL PRIMARY KEY,
  file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  node_id INTEGER NOT NULL REFERENCES nodes(id),
  chunk_index INTEGER NOT NULL,
  chunk_hash TEXT,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  message TEXT,
  status TEXT DEFAULT 'pending',
  invited_by TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
  id SERIAL PRIMARY KEY,
  metric_type TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert demo users
INSERT INTO users (id, email, first_name, last_name) 
VALUES 
  ('admin-demo', 'admin@example.com', 'Admin', 'Demo'),
  ('user-demo', 'user@example.com', 'User', 'Demo')
ON CONFLICT (id) DO NOTHING;

-- Insert demo nodes
INSERT INTO nodes (name, ip_address, status, storage_capacity, storage_used, cpu_usage, memory_usage, network_throughput, uptime, is_default) 
VALUES 
  ('Primary Node', '192.168.1.100', 'active', '2.0 GB', '0.8 GB', '25%', '45%', '150 MB/s', '99.9%', true),
  ('Secondary Node', '192.168.1.101', 'active', '3.0 GB', '1.2 GB', '30%', '55%', '200 MB/s', '98.5%', false),
  ('Backup Node', '192.168.1.102', 'maintenance', '1.5 GB', '0.3 GB', '15%', '30%', '100 MB/s', '95.2%', false)
ON CONFLICT DO NOTHING;

-- Insert demo files
INSERT INTO files (name, original_name, size, mime_type, status, default_node_id, uploaded_by) 
VALUES 
  ('sample-document.pdf', 'sample-document.pdf', '2048576', 'application/pdf', 'stored', 1, 'admin-demo'),
  ('project-presentation.pptx', 'project-presentation.pptx', '5242880', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'stored', 2, 'user-demo')
ON CONFLICT DO NOTHING;

-- Insert demo activity logs
INSERT INTO activity_logs (user_id, action, resource, resource_id, details, ip_address, user_agent) 
VALUES 
  ('admin-demo', 'file_upload_completed', 'file', '1', '{"fileName":"sample-document.pdf","fileSize":"2048576"}', '127.0.0.1', 'Demo Browser'),
  ('user-demo', 'node_created', 'node', '3', '{"nodeName":"Backup Node","ipAddress":"192.168.1.102"}', '127.0.0.1', 'Demo Browser')
ON CONFLICT DO NOTHING;

-- Insert demo system metrics
INSERT INTO system_metrics (metric_type, value, unit) 
VALUES 
  ('storage', 85.5, 'percent'),
  ('cpu', 45.2, 'percent'),
  ('memory', 67.8, 'percent')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions (expire);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_file_chunks_file_id ON file_chunks (file_id);
CREATE INDEX IF NOT EXISTS idx_nodes_status ON nodes (status);

-- Display setup completion message
SELECT 'FileSanctum database setup completed successfully!' AS message;