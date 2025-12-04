# How to Start the Application

## Development Mode (Recommended)

### Terminal 1: Backend Server
```bash
npm start
# or
npm run dev
```
Backend runs on: http://localhost:3001

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

**Access the UI at: http://localhost:5173**

## Production Mode

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the backend (it will serve the built frontend):
```bash
npm start
```

**Access the UI at: http://localhost:3001**

## Quick Start (Both Servers)

```bash
# Terminal 1
npm start

# Terminal 2
cd frontend && npm run dev
```

Then open: http://localhost:5173
