# FileSanctum DFSS - Complete Local Setup Guide

## Prerequisites Installation

### 1. Install Node.js (Required)
- Download from https://nodejs.org/
- Install the LTS version (18.x or higher)
- Verify installation: `node --version`

### 2. Install PostgreSQL (Required)
- Download from https://www.postgresql.org/download/windows/
- During installation, remember your password for the 'postgres' user
- Default port: 5432

### 3. Setup PostgreSQL Database
After PostgreSQL installation:

1. Open Command Prompt as Administrator
2. Connect to PostgreSQL:
   ```cmd
   psql -U postgres
   ```
3. Create the database:
   ```sql
   CREATE DATABASE filesanctum;
   \q
   ```

## Project Setup

### 1. Install Dependencies
In your project folder, run:
```cmd
npm install
```

### 2. Configure Environment
Create a `.env` file in the project root:
```
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/filesanctum
SESSION_SECRET=filesanctum_session_secret_key_2024
NODE_ENV=development
```
Replace `YOUR_POSTGRES_PASSWORD` with your PostgreSQL password.

### 3. Initialize Database Schema
```cmd
npm run db:push
```

### 4. Build the Frontend
```cmd
npm run build
```

### 5. Start the Application
```cmd
npm run dev
```

## Access the Application
- Open browser: http://localhost:5000
- Login credentials:
  - Admin: admin@example.com / admin123  
  - User: user@example.com / user123

## Available Features
- Complete landing page and authentication
- Full dashboard with file management
- Real-time node monitoring and analytics
- Manual file-to-node assignment
- Activity logging and system metrics
- User invitation system
- Interactive charts and visualizations

## Troubleshooting
- If database connection fails, check PostgreSQL service is running
- If port 5000 is busy, the app will use an alternative port
- For build issues, try `npm install` again