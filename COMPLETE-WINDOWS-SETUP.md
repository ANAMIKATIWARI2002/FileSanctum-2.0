# Complete Windows Setup Guide for FileSanctum

## Prerequisites (Install First)

1. **Install Node.js**
   - Download from: https://nodejs.org/
   - Install version 18 or newer
   - Verify: Open Command Prompt and run `node --version`

2. **Install PostgreSQL**
   - Download from: https://www.postgresql.org/download/windows/
   - Install PostgreSQL 13 or newer
   - Remember the password you set for the 'postgres' user
   - Default port should be 5432

3. **Create Database**
   ```
   psql -U postgres
   CREATE DATABASE filesanctum;
   \q
   ```

## One-Command Setup

1. **Download Project**
   - Extract the project files to a folder like `C:\FileSanctum`

2. **Open Command Prompt**
   - Press Windows key + R
   - Type `cmd` and press Enter
   - Navigate to your project folder: `cd C:\FileSanctum`

3. **Run Setup**
   ```
   node windows-setup.js
   ```

This single command will:
- Install all dependencies
- Create environment file
- Set up database with correct schema
- Add demo data
- Start the server

## Access Your Application

Once setup completes:
- Open browser and go to: http://localhost:5000
- Login with:
  - Admin: admin@example.com / admin123
  - User: user@example.com / user123

## What You Get

All features working locally:
- File upload and management
- Node monitoring and management
- Activity logging
- System analytics
- User invitations
- Real-time dashboard

## Troubleshooting

**Database Connection Error:**
- Check PostgreSQL is running
- Verify password in .env file
- Ensure database 'filesanctum' exists

**Port Already in Use:**
- Close other applications using port 5000
- Or change PORT in .env file to 3000

**Missing Dependencies:**
- Run: `npm install`
- Make sure Node.js is installed