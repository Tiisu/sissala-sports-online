/**
 * Socket.io Service
 * Handles real-time communication for live match updates
 */

/**
 * Initialize Socket.io event handlers
 * @param {Object} io - Socket.io server instance
 */
const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    /**
     * Join a specific match room for live updates
     * Client emits: { matchId: '123' }
     */
    socket.on('join_match', (matchId) => {
      socket.join(`match_${matchId}`);
      console.log(`📡 Client ${socket.id} joined match room: match_${matchId}`);
      
      // Notify the client they've joined
      socket.emit('joined_match', {
        matchId,
        message: 'Successfully joined match room',
      });
    });

    /**
     * Leave a match room
     * Client emits: { matchId: '123' }
     */
    socket.on('leave_match', (matchId) => {
      socket.leave(`match_${matchId}`);
      console.log(`📡 Client ${socket.id} left match room: match_${matchId}`);
      
      socket.emit('left_match', {
        matchId,
        message: 'Successfully left match room',
      });
    });

    /**
     * Join league room for general league updates
     * Client emits: { leagueId: '123' }
     */
    socket.on('join_league', (leagueId) => {
      socket.join(`league_${leagueId}`);
      console.log(`📡 Client ${socket.id} joined league room: league_${leagueId}`);
    });

    /**
     * Leave league room
     * Client emits: { leagueId: '123' }
     */
    socket.on('leave_league', (leagueId) => {
      socket.leave(`league_${leagueId}`);
      console.log(`📡 Client ${socket.id} left league room: league_${leagueId}`);
    });

    /**
     * Handle client disconnect
     */
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    /**
     * Handle connection errors
     */
    socket.on('error', (error) => {
      console.error(`⚠️ Socket error for client ${socket.id}:`, error);
    });
  });
};

/**
 * Emit match event to all clients in match room
 * @param {Object} io - Socket.io server instance
 * @param {String} matchId - Match ID
 * @param {String} eventType - Type of event (goal, card, substitution, etc.)
 * @param {Object} data - Event data
 */
const emitMatchEvent = (io, matchId, eventType, data) => {
  io.to(`match_${matchId}`).emit('match_event', {
    matchId,
    eventType,
    data,
    timestamp: new Date().toISOString(),
  });
  console.log(`📢 Emitted ${eventType} event to match_${matchId}`);
};

/**
 * Emit match score update
 * @param {Object} io - Socket.io server instance
 * @param {String} matchId - Match ID
 * @param {Object} score - Score object { home: Number, away: Number }
 */
const emitScoreUpdate = (io, matchId, score) => {
  io.to(`match_${matchId}`).emit('score_update', {
    matchId,
    score,
    timestamp: new Date().toISOString(),
  });
  console.log(`⚽ Emitted score update to match_${matchId}:`, score);
};

/**
 * Emit match status change (scheduled, live, halftime, finished)
 * @param {Object} io - Socket.io server instance
 * @param {String} matchId - Match ID
 * @param {String} status - Match status
 */
const emitMatchStatusChange = (io, matchId, status) => {
  io.to(`match_${matchId}`).emit('match_status_change', {
    matchId,
    status,
    timestamp: new Date().toISOString(),
  });
  console.log(`🔄 Emitted status change to match_${matchId}: ${status}`);
};

/**
 * Emit goal event
 * @param {Object} io - Socket.io server instance
 * @param {String} matchId - Match ID
 * @param {Object} goalData - Goal data (team, player, minute, etc.)
 */
const emitGoal = (io, matchId, goalData) => {
  emitMatchEvent(io, matchId, 'goal', goalData);
  
  // Also update the score
  emitScoreUpdate(io, matchId, goalData.currentScore);
};

/**
 * Emit card event (yellow/red card)
 * @param {Object} io - Socket.io server instance
 * @param {String} matchId - Match ID
 * @param {Object} cardData - Card data (team, player, cardType, minute)
 */
const emitCard = (io, matchId, cardData) => {
  emitMatchEvent(io, matchId, 'card', cardData);
};

/**
 * Emit substitution event
 * @param {Object} io - Socket.io server instance
 * @param {String} matchId - Match ID
 * @param {Object} subData - Substitution data (team, playerOut, playerIn, minute)
 */
const emitSubstitution = (io, matchId, subData) => {
  emitMatchEvent(io, matchId, 'substitution', subData);
};

/**
 * Emit match statistics update
 * @param {Object} io - Socket.io server instance
 * @param {String} matchId - Match ID
 * @param {Object} statistics - Match statistics
 */
const emitStatisticsUpdate = (io, matchId, statistics) => {
  io.to(`match_${matchId}`).emit('statistics_update', {
    matchId,
    statistics,
    timestamp: new Date().toISOString(),
  });
  console.log(`📊 Emitted statistics update to match_${matchId}`);
};

/**
 * Broadcast new news article to all clients
 * @param {Object} io - Socket.io server instance
 * @param {Object} newsData - News article data
 */
const broadcastNews = (io, newsData) => {
  io.emit('new_news', {
    news: newsData,
    timestamp: new Date().toISOString(),
  });
  console.log(`📰 Broadcasted new news article: ${newsData.title}`);
};

/**
 * Emit league table update
 * @param {Object} io - Socket.io server instance
 * @param {String} leagueId - League ID
 * @param {Array} standings - League standings/table
 */
const emitLeagueTableUpdate = (io, leagueId, standings) => {
  io.to(`league_${leagueId}`).emit('league_table_update', {
    leagueId,
    standings,
    timestamp: new Date().toISOString(),
  });
  console.log(`📋 Emitted league table update to league_${leagueId}`);
};

/**
 * Get number of clients in a room
 * @param {Object} io - Socket.io server instance
 * @param {String} roomName - Room name
 * @returns {Number} - Number of clients in room
 */
const getRoomClientCount = async (io, roomName) => {
  const room = io.sockets.adapter.rooms.get(roomName);
  return room ? room.size : 0;
};

module.exports = {
  initializeSocket,
  emitMatchEvent,
  emitScoreUpdate,
  emitMatchStatusChange,
  emitGoal,
  emitCard,
  emitSubstitution,
  emitStatisticsUpdate,
  broadcastNews,
  emitLeagueTableUpdate,
  getRoomClientCount,
};
