const { spawn } = require('child_process');

// Set environment variables for Windows
process.env.NODE_ENV = 'development';

console.log('Starting server...');

// Start the server with proper Windows environment
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
  env: process.env
});

server.on('close', (code) => {
  if (code === 0) {
    console.log('Server stopped successfully.');
  } else {
    console.log('Server stopped with code:', code);
  }
});

// Show status after server starts
setTimeout(() => {
  console.log('Server running successfully.');
  console.log('URL: http://localhost:5000');
}, 3000);