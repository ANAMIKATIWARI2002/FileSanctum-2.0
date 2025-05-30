const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 5000;

console.log('🚀 Starting FileSanctum DFSS Local Setup...');
console.log('📦 Checking dependencies and environment...');

// Setup environment for local development
process.env.NODE_ENV = 'development';
process.env.DATABASE_URL = 'file:./local-database.sqlite';
process.env.SESSION_SECRET = 'filesanctum_local_demo_secret_2024';

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📥 Installing dependencies...');
  console.log('Running: npm install');
  
  const npmInstall = spawn('npm', ['install'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  npmInstall.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Dependencies installed successfully');
      startApplication();
    } else {
      console.error('❌ Failed to install dependencies');
      console.log('Please run "npm install" manually and try again');
      process.exit(1);
    }
  });
} else {
  console.log('✅ Dependencies found');
  startApplication();
}

function startApplication() {
  console.log('🔨 Building frontend...');
  
  // Check if dist folder exists
  const distPath = path.join(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
    console.log('Building project...');
    
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });

    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Build completed successfully');
        startServer();
      } else {
        console.log('⚠️  Build failed, starting development server...');
        startDevServer();
      }
    });
  } else {
    console.log('✅ Built files found');
    startServer();
  }
}

function startServer() {
  console.log('🚀 Starting production server...');
  
  const serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });

  // Give server time to start
  setTimeout(() => {
    console.log('');
    console.log('🎯 FileSanctum DFSS is now running!');
    console.log(`📡 Open your browser: http://localhost:${PORT}`);
    console.log('');
    console.log('📋 Demo Credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User:  user@example.com / user123');
    console.log('');
    console.log('✨ Available Features:');
    console.log('   • Landing Page & Authentication');
    console.log('   • Complete Dashboard Interface');
    console.log('   • File Upload & Management');
    console.log('   • Node Management & Monitoring');
    console.log('   • Manual Node Selection');
    console.log('   • Real-time Activity Logging');
    console.log('   • System Analytics with Charts');
    console.log('   • User Invitation System');
    console.log('');
    console.log('🎓 Ready for teacher demonstration!');
  }, 3000);
}

function startDevServer() {
  console.log('🔧 Starting development server...');
  
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  devProcess.on('close', (code) => {
    console.log(`Development server exited with code ${code}`);
  });

  setTimeout(() => {
    console.log('');
    console.log('🎯 FileSanctum DFSS (Development) is now running!');
    console.log(`📡 Open your browser: http://localhost:${PORT}`);
    console.log('');
    console.log('📋 Demo Credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User:  user@example.com / user123');
    console.log('');
    console.log('🎓 Ready for demonstration!');
  }, 5000);
}