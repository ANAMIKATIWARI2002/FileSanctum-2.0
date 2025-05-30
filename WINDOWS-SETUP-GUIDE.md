# FileSanctum DFSS - Complete Windows Setup

## Step-by-Step Instructions

### 1. Prerequisites
Download and install Node.js from https://nodejs.org/
- Choose the LTS version (18.x or higher)
- Accept all default installation options

### 2. Project Setup
1. Download/copy your FileSanctum project folder to your Windows desktop
2. Open Command Prompt in the project folder (right-click in folder → "Open in Terminal")

### 3. Run the Application
Execute this single command:
```cmd
node local-setup.js
```

This will automatically:
- Install all required dependencies
- Set up a local SQLite database (no PostgreSQL needed)
- Build the frontend interface
- Start the complete FileSanctum application
- Load demo data for demonstration

### 4. Access Your Application
- Wait for the success message showing the server is running
- Open your web browser
- Navigate to: http://localhost:5000

### 5. Login Credentials
- **Admin Account**: admin@example.com / admin123
- **User Account**: user@example.com / user123

## What You'll Get

### Complete Web Interface
- Landing page with professional design
- Login/logout functionality
- Full dashboard with sidebar navigation
- Responsive design that works on any screen size

### Core Features
- **File Management**: Upload, view, download, and delete files
- **Node Management**: Add, remove, monitor storage nodes
- **Manual Node Selection**: Move files between storage nodes
- **Activity Logging**: Real-time tracking of all system activities
- **System Analytics**: Interactive charts and performance metrics
- **User Management**: Invite system for new users
- **Real-time Updates**: Live data refreshing and notifications

### Technical Implementation
- Complete React frontend with modern UI components
- Express.js backend with full API
- SQLite database with real data persistence
- WebSocket integration for real-time features
- File upload/download with encryption simulation
- Session management and authentication

## For Teacher Demonstration

The application includes:
1. **Authentication Flow**: Demonstrate secure login process
2. **File Operations**: Show upload, management, and storage distribution
3. **Node Monitoring**: Display real-time node health and metrics
4. **Data Visualization**: Interactive charts and system analytics
5. **Activity Tracking**: Complete audit trail of all system operations
6. **Scalability Features**: Node addition/removal and load balancing

## Troubleshooting

**If you see "Cannot find module" errors:**
- Run: `npm install` first, then `node local-setup.js`

**If port 5000 is already in use:**
- The application will automatically find an available port

**If the browser shows "Cannot connect":**
- Wait 30 seconds for the server to fully start
- Check the command prompt for the correct port number

Your complete FileSanctum DFSS is now ready for demonstration!