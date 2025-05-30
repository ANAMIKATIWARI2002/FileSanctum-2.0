# FileSanctum DFSS - Complete Windows Setup Guide

## Step 1: Install Prerequisites

### 1.1 Install Node.js
- Download from: https://nodejs.org/
- Choose LTS version (18.x or higher)
- Run installer with default settings
- Verify: Open Command Prompt and run `node --version`

### 1.2 Install PostgreSQL
- Download from: https://www.postgresql.org/download/windows/
- During installation:
  - Remember the password you set for 'postgres' user
  - Keep default port: 5432
  - Install Stack Builder: No (not needed)
- Verify: Services should show "postgresql-x64-xx" running

## Step 2: Setup PostgreSQL Database

### 2.1 Create Database
Open Command Prompt as Administrator and run:
```cmd
psql -U postgres
```
Enter your postgres password when prompted.

In the PostgreSQL prompt, run:
```sql
CREATE DATABASE filesanctum;
\q
```

### 2.2 Setup Database Schema
In Command Prompt, navigate to your project folder and run:
```cmd
psql -U postgres -d filesanctum -f database-setup.sql
```
Enter your postgres password when prompted.

## Step 3: Configure Project

### 3.1 Download Project Files
Copy your complete FileSanctum project folder to your Windows desktop.

### 3.2 Configure Environment
Run the setup script:
```cmd
node local-setup.js
```

This will create a `.env` file. Edit it and replace `yourpassword` with your actual PostgreSQL password:
```
DATABASE_URL=postgresql://postgres:your_actual_password@localhost:5432/filesanctum
PGPASSWORD=your_actual_password
```

## Step 4: Run the Application

### 4.1 Start FileSanctum
In your project folder, run:
```cmd
node local-setup.js
```

The script will:
- Install all dependencies automatically
- Setup database schema
- Build the frontend
- Start the complete application

### 4.2 Access the Application
- Wait for "FileSanctum DFSS is now running!" message
- Open browser: http://localhost:5000
- Use demo credentials:
  - Admin: admin@example.com / admin123
  - User: user@example.com / user123

## What You'll Get

### Complete Interface (Identical to Replit)
- Professional landing page
- Secure authentication system
- Full dashboard with sidebar navigation
- Real-time charts and analytics
- Responsive design

### All Features Working
- File upload/download/management
- Node management and monitoring
- Manual file-to-node assignment
- Activity logging with real-time updates
- System analytics with interactive charts
- User invitation system
- WebSocket real-time updates

### Database Integration
- PostgreSQL with full data persistence
- All tables created automatically
- Demo data pre-loaded
- Session management
- Activity tracking

## Troubleshooting

### Database Connection Issues
If you see database errors:
1. Check PostgreSQL service is running in Windows Services
2. Verify your password in the `.env` file
3. Ensure database 'filesanctum' exists: `psql -U postgres -l`

### Port Issues
If port 5000 is busy, the app will automatically find another port.

### Build Issues
If npm install fails:
1. Run `npm cache clean --force`
2. Delete `node_modules` folder
3. Run `npm install` again

### Cannot Access Application
1. Wait 30 seconds after startup
2. Check Command Prompt for the actual port number
3. Try http://127.0.0.1:5000 instead

## Demonstration Ready

Your FileSanctum DFSS is now fully operational with:
- Complete professional interface
- Real database with persistent data
- All interactive features working
- Identical functionality to Replit version
- Ready for teacher demonstration