import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import advisoryRoutes from './routes/advisoryRoutes.js';
import { isSupabaseConfigured } from './config/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security & Parsing Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-user-id']
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// System Health & Diagnostics
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'AgriAdviser Pro AI Engine',
    timestamp: new Date().toISOString(),
    config: {
      supabaseConfigured: isSupabaseConfigured,
      geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10)
    }
  });
});

// API Routes
app.use('/api', advisoryRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File Upload Error',
      message: err.message
    });
  }
  return res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the server.'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌱 AgriAdviser Pro Backend Server running on port ${PORT}`);
  console.log(`   Health endpoint: http://localhost:${PORT}/api/health`);
  console.log(`   Supabase status: ${isSupabaseConfigured ? 'Active & Connected' : 'Demo/Fallback Store'}`);
  console.log(`   Gemini AI Model: gemini-2.5-flash via @google/genai`);
  console.log(`====================================================`);
});
