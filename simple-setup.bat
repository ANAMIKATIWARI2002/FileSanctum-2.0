@echo off
echo Setting up FileSanctum...

REM Check if .env exists, create if not
if not exist .env (
    echo Creating environment file...
    echo DATABASE_URL=postgresql://postgres:password@localhost:5432/filesanctum > .env
    echo SESSION_SECRET=filesanctum_secret >> .env
    echo NODE_ENV=development >> .env
    echo PORT=5000 >> .env
    echo.
    echo Environment file created. Please edit .env with your PostgreSQL password.
    echo Then run this script again.
    pause
    exit /b
)

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies. Please run: npm install
        pause
        exit /b 1
    )
)

REM Setup database
echo Setting up database...
npm run db:push
if errorlevel 1 (
    echo Database setup failed. Check your PostgreSQL connection.
    pause
    exit /b 1
)

echo Starting server...
node start-windows.js