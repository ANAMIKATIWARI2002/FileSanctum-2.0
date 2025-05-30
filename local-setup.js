const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 FileSanctum DFSS - Local Setup');
console.log('===============================');

// Check if .env file exists, if not create one
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `# Database Configuration
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/filesanctum
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=yourpassword
PGDATABASE=filesanctum

# Session Configuration
SESSION_SECRET=filesanctum_session_secret_key_2024

# Application Configuration
NODE_ENV=development
PORT=5000

# Optional: Replit compatibility (for local dev)
REPLIT_DOMAINS=localhost:5000
REPL_ID=filesanctum-local
ISSUER_URL=https://replit.com/oidc
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
  console.log('⚠️  Please edit .env file and set your PostgreSQL password');
  console.log('');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  const npmInstall = spawn('npm', ['install'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  npmInstall.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Dependencies installed');
      setupDatabase();
    } else {
      console.error('❌ Failed to install dependencies');
      console.log('Please run "npm install" manually');
    }
  });
} else {
  setupDatabase();
}

function setupDatabase() {
  console.log('🗄️  Setting up database schema...');
  
  const dbPush = spawn('npm', ['run', 'db:push'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  dbPush.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Database schema created');
      startApplication();
    } else {
      console.log('⚠️  Database setup skipped - will start application anyway');
      startApplication();
    }
  });
}

function startApplication() {
  console.log('🚀 Starting FileSanctum application...');
  
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname,
    env: { ...process.env }
  });

  // Give server time to start
  setTimeout(() => {
    console.log('');
    console.log('🎯 FileSanctum DFSS is now running!');
    console.log('📡 Open your browser: http://localhost:5000');
    console.log('');
    console.log('📋 Demo Credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User:  user@example.com / user123');
    console.log('');
    console.log('✨ Complete Features Available:');
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
  }, 5000);

  server.on('close', (code) => {
    console.log(`Application exited with code ${code}`);
  });
}