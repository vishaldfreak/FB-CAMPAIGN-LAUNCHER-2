# How to Start the Application

## The Issue

When you visit `http://localhost:3001`, you see "Cannot GET /" because:
- **Port 3001** = Backend API server (Express)
- **Port 5173** = Frontend UI (Vite/React)

The backend only serves API endpoints, not the UI.

## Solution: Run Both Servers

### Option 1: Two Terminals (Recommended for Development)

**Terminal 1 - Backend:**
```bash
npm start
```
✅ Backend running on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend running on http://localhost:5173

**👉 Open your browser to: http://localhost:5173**

### Option 2: Production Mode (Single Port)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the backend (it will serve the built frontend):
```bash
npm start
```

**👉 Open your browser to: http://localhost:3001**

## Quick Test

1. Make sure backend is running:
```bash
curl http://localhost:3001/health
```

2. Start frontend:
```bash
cd frontend && npm run dev
```

3. Visit: http://localhost:5173

## Troubleshooting

**Port 3001 already in use?**
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9
# Or use a different port
PORT=3002 npm start
```

**Port 5173 already in use?**
```bash
# Vite will automatically use the next available port
# Or specify a port in frontend/vite.config.js
```
