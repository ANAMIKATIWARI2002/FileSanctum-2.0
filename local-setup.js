const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create environment file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `DATABASE_URL=postgresql://postgres:password@localhost:5432/filesanctum
SESSION_SECRET=filesanctum_secret
NODE_ENV=development
PORT=5000`;
  fs.writeFileSync(envPath, envContent);
  console.log('Environment file created. Edit .env with your PostgreSQL password.');
  console.log('Then run: node local-setup.js');
  process.exit(0);
}

// Install dependencies if needed
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    console.log('Dependencies installed successfully.');
  } catch (error) {
    console.log('Installation failed. Run npm install manually.');
    process.exit(1);
  }
}

// Setup database using drizzle schema
console.log('Setting up database...');
try {
  execSync('npm run db:push', { stdio: 'inherit', cwd: __dirname });
  
  // Add demo data
  const { Pool } = require('pg');
  require('dotenv').config();
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
  
  async function addDemoData() {
    try {
      await pool.query(`
        INSERT INTO users (id, email, first_name, last_name) 
        VALUES ('admin-demo', 'admin@example.com', 'Admin', 'Demo'), ('user-demo', 'user@example.com', 'User', 'Demo') 
        ON CONFLICT (id) DO NOTHING;
      `);
      
      await pool.query(`
        INSERT INTO nodes (name, ip_address, port, status, storage_capacity, storage_used, cpu_usage, memory_usage, network_throughput, uptime, is_default) 
        VALUES ('Primary Node', '192.168.1.100', 8080, 'healthy', 2048, 819, 25, 45, 150, 99.9, true),
               ('Secondary Node', '192.168.1.101', 8080, 'healthy', 3072, 1229, 30, 55, 200, 98.5, false) 
        ON CONFLICT (name) DO NOTHING;
      `);
      
      await pool.query(`
        INSERT INTO files (name, original_name, size, mime_type, status, default_node_id, uploaded_by) 
        VALUES ('sample-document.pdf', 'sample-document.pdf', 2048576, 'application/pdf', 'stored', 1, 'admin-demo'),
               ('project-presentation.pptx', 'project-presentation.pptx', 5242880, 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'stored', 2, 'user-demo') 
        ON CONFLICT DO NOTHING;
      `);
      
      await pool.query(`
        INSERT INTO activity_logs (user_id, action, resource, resource_id, details, ip_address, user_agent) 
        VALUES ('admin-demo', 'file_upload_completed', 'file', '1', '{"fileName":"sample-document.pdf","fileSize":"2048576"}', '127.0.0.1', 'Demo Browser'),
               ('admin-demo', 'system_initialized', 'system', '1', '{"message":"Primary and Secondary nodes initialized"}', '127.0.0.1', 'Demo Browser') 
        ON CONFLICT DO NOTHING;
      `);
      
      await pool.end();
    } catch (error) {
      await pool.end();
    }
  }
  
  addDemoData().then(() => {
    console.log('Database setup completed.');
    startServer();
  });
  
} catch (error) {
  console.log('Database setup failed. Check your PostgreSQL connection and credentials.');
  process.exit(1);
}

function startServer() {
  console.log('Starting server...');
  const server = spawn('node', ['start-windows.js'], { 
    stdio: 'inherit', 
    shell: true,
    cwd: __dirname
  });
  
  server.on('close', (code) => {
    console.log('Server stopped.');
  });
}