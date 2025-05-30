const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== FileSanctum Windows Setup ===\n');

// Step 1: Check if .env exists, create if not
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating environment file...');
  
  rl.question('Enter your PostgreSQL password (default: password): ', (password) => {
    const dbPassword = password || 'password';
    
    const envContent = `DATABASE_URL=postgresql://postgres:${dbPassword}@localhost:5432/filesanctum
SESSION_SECRET=filesanctum_secret_key_12345
NODE_ENV=development
PORT=5000
JWT_SECRET=filesanctum_jwt_secret_12345`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('Environment file created successfully.\n');
    
    rl.close();
    continueSetup();
  });
} else {
  console.log('Environment file already exists.\n');
  rl.close();
  continueSetup();
}

function continueSetup() {
  try {
    // Step 2: Install dependencies
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('Installing dependencies...');
      execSync('npm install', { stdio: 'inherit', cwd: __dirname });
      console.log('Dependencies installed successfully.\n');
    } else {
      console.log('Dependencies already installed.\n');
    }

    // Step 3: Setup database
    console.log('Setting up database...');
    execSync('npm run db:push', { stdio: 'inherit', cwd: __dirname });
    console.log('Database schema created successfully.\n');

    // Step 4: Add demo data
    console.log('Adding demo data...');
    const { Pool } = require('pg');
    require('dotenv').config();
    
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: false 
    });
    
    addDemoData(pool).then(() => {
      console.log('Demo data added successfully.\n');
      console.log('=== Setup Complete ===');
      console.log('Starting FileSanctum server...\n');
      
      // Step 5: Start server
      const server = spawn('node', ['start-windows.js'], { 
        stdio: 'inherit', 
        shell: true,
        cwd: __dirname
      });
      
      console.log('Server starting...');
      console.log('Access your application at: http://localhost:5000');
      console.log('\nLogin credentials:');
      console.log('Admin: admin@example.com / admin123');
      console.log('User: user@example.com / user123\n');
      
      server.on('close', (code) => {
        console.log('Server stopped.');
      });
    }).catch((error) => {
      console.error('Failed to add demo data:', error.message);
      console.log('You can still start the server, but you may need to add data manually.');
      
      const server = spawn('node', ['start-windows.js'], { 
        stdio: 'inherit', 
        shell: true,
        cwd: __dirname
      });
    });

  } catch (error) {
    console.error('Setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure Node.js is installed');
    console.log('2. Make sure PostgreSQL is running');
    console.log('3. Check your database credentials in .env file');
    process.exit(1);
  }
}

async function addDemoData(pool) {
  try {
    // Add demo users
    await pool.query(`
      INSERT INTO users (id, email, first_name, last_name) 
      VALUES ('admin-demo', 'admin@example.com', 'Admin', 'Demo'), 
             ('user-demo', 'user@example.com', 'User', 'Demo') 
      ON CONFLICT (id) DO NOTHING;
    `);
    
    // Add demo nodes
    await pool.query(`
      INSERT INTO nodes (name, ip_address, port, status, storage_capacity, storage_used, cpu_usage, memory_usage, network_throughput, uptime, is_default) 
      VALUES ('Primary Node', '192.168.1.100', 8080, 'healthy', 2048, 819, 25, 45, 150, 99.9, true),
             ('Secondary Node', '192.168.1.101', 8080, 'healthy', 3072, 1229, 30, 55, 200, 98.5, false),
             ('Backup Node', '192.168.1.102', 8080, 'degraded', 1536, 307, 15, 30, 100, 95.2, false) 
      ON CONFLICT (name) DO NOTHING;
    `);
    
    // Add demo files
    await pool.query(`
      INSERT INTO files (name, original_name, size, mime_type, status, default_node_id, uploaded_by) 
      VALUES ('sample-document.pdf', 'sample-document.pdf', 2048576, 'application/pdf', 'stored', 1, 'admin-demo'),
             ('project-presentation.pptx', 'project-presentation.pptx', 5242880, 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'stored', 2, 'user-demo') 
      ON CONFLICT DO NOTHING;
    `);
    
    // Add demo activity logs
    await pool.query(`
      INSERT INTO activity_logs (user_id, action, resource, resource_id, details, ip_address, user_agent) 
      VALUES ('admin-demo', 'file_upload_completed', 'file', '1', '{"fileName":"sample-document.pdf","fileSize":"2048576"}', '127.0.0.1', 'Demo Browser'),
             ('user-demo', 'node_created', 'node', '3', '{"nodeName":"Backup Node","ipAddress":"192.168.1.102"}', '127.0.0.1', 'Demo Browser') 
      ON CONFLICT DO NOTHING;
    `);
    
    await pool.end();
  } catch (error) {
    await pool.end();
    throw error;
  }
}