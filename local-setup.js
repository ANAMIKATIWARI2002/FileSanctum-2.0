const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Simple environment setup
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
  const npmInstall = spawn('npm', ['install'], { stdio: 'inherit', shell: true });
  npmInstall.on('close', (code) => {
    if (code === 0) startServer();
    else console.log('Installation failed. Run npm install manually.');
  });
} else {
  startServer();
}

function startServer() {
  console.log('Starting server...');
  const server = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit', 
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  setTimeout(() => {
    console.log('Server running successfully.');
    console.log('URL: http://localhost:5000');
  }, 3000);
}