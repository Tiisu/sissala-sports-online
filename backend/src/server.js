/**
 * Sissala Football League - Backend Server
 * Main entry point for the Express.js application
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const leagueRoutes = require('./routes/league.routes');
const seasonRoutes = require('./routes/season.routes');
const teamRoutes = require('./routes/team.routes');
const playerRoutes = require('./routes/player.routes');
const matchRoutes = require('./routes/match.routes');
const venueRoutes = require('./routes/venue.routes');
const officialRoutes = require('./routes/official.routes');
const statisticsRoutes = require('./routes/statistics.routes');
const newsRoutes = require('./routes/news.routes');
const mediaRoutes = require('./routes/media.routes');
const forumRoutes = require('./routes/forum.routes');
const predictionRoutes = require('./routes/prediction.routes');
const pollRoutes = require('./routes/poll.routes');

// Import middleware
const { errorHandler } = require('./middleware/error.middleware');
const { rateLimiter } = require('./middleware/rateLimiter.middleware');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io for real-time updates
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware Configuration
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logger

// Rate limiting
app.use('/api/', rateLimiter);

// Serve static files (uploaded images, etc.)
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/officials', officialRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/polls', pollRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Sissala Football League API is running',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join a match room for live updates
  socket.on('join_match', (matchId) => {
    socket.join(`match_${matchId}`);
    console.log(`Client ${socket.id} joined match_${matchId}`);
  });

  // Leave a match room
  socket.on('leave_match', (matchId) => {
    socket.leave(`match_${matchId}`);
    console.log(`Client ${socket.id} left match_${matchId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📡 Socket.io server is ready for real-time updates`);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = { app, io };
