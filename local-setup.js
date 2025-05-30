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

// Setup database synchronously - this is the fix
console.log('Setting up database...');
try {
  execSync('node setup-database.mjs', { stdio: 'inherit', cwd: __dirname });
  console.log('Database setup completed.');
} catch (error) {
  console.log('Database setup failed. Check your PostgreSQL connection and credentials.');
  process.exit(1);
}

// Start server only after database is confirmed ready
console.log('Starting server...');
const server = spawn('node', ['start-windows.js'], { 
  stdio: 'inherit', 
  shell: true,
  cwd: __dirname
});

server.on('close', (code) => {
  console.log('Server stopped.');
});