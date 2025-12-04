/**
 * Express Server for Facebook Campaign Launcher
 * Phase 0 & 1: Token Management and API Endpoints
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import apiRoutes from './routes/api.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS configuration (must be before routes)
// In development, allow all origins for easier debugging
const corsOptions = process.env.NODE_ENV === 'production' ? {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
} : {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve static files from frontend build (for production)
const frontendBuildPath = join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendBuildPath));

// Serve frontend for all non-API routes (SPA routing)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // In development, redirect to frontend dev server
  if (process.env.NODE_ENV !== 'production') {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facebook Campaign Launcher</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 600px;
              margin: 100px auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .card {
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #333; margin-top: 0; }
            .info { background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
            a { color: #1976d2; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🚀 Facebook Campaign Launcher</h1>
            <div class="info">
              <strong>Development Mode:</strong> Frontend is running separately.<br><br>
              <strong>To access the UI:</strong><br>
              1. Open a new terminal<br>
              2. Run: <span class="code">cd frontend && npm run dev</span><br>
              3. Visit: <a href="http://localhost:5173" target="_blank">http://localhost:5173</a>
            </div>
            <p><strong>API Endpoints:</strong></p>
            <ul>
              <li><a href="/api/token/status">/api/token/status</a> - Token status</li>
              <li><a href="/health">/health</a> - Health check</li>
            </ul>
          </div>
        </body>
      </html>
    `);
  }
  
  // In production, serve the built frontend
  res.sendFile(join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Frontend not built. Run: cd frontend && npm run build');
    }
  });
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
