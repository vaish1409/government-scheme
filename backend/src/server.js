require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { sequelize, connectDB } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const eligibilityRoutes = require('./routes/eligibilityRoutes');
const syncRoutes = require('./routes/syncRoutes');
const livelihoodRoutes = require('./routes/livelihoodRoutes');
const channelRoutes = require('./routes/channelRoutes');

const app = express();

// Needed behind Render/Railway/ngrok so req.protocol and req.get('host') give
// the real public https URL — both for correctness generally and because the
// Twilio webhook signature check in channelRoutes depends on it exactly.
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// --- Middleware ---
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// --- Health check (useful for uptime monitors / Render/Railway) ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/livelihood', livelihoodRoutes);
// Twilio's Voice and WhatsApp webhooks POST application/x-www-form-urlencoded,
// not JSON, so this path gets its own body parser rather than express.json().
app.use('/api/channels', express.urlencoded({ extended: false }), channelRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  // { alter: true } keeps tables in sync with models during development.
  // Swap this for real migrations (sequelize-cli) before production use.
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  console.log('✅ Database synced');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start();

module.exports = app;
