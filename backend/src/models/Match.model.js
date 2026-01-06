/**
 * Match Model
 * Represents a football match between two teams
 */

const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    // Basic Information
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
      required: [true, 'Please provide a season'],
    },
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      required: [true, 'Please provide a league'],
    },
    
    // Match Details
    matchNumber: {
      type: Number,
      required: [true, 'Please provide match number'],
    },
    round: {
      type: String,
      default: 'Regular Season',
    },
    
    // Teams
    homeTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Please provide home team'],
    },
    awayTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Please provide away team'],
    },
    
    // Venue
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: [true, 'Please provide venue'],
    },
    
    // Match Date & Time
    matchDate: {
      type: Date,
      required: [true, 'Please provide match date'],
    },
    kickoffTime: {
      type: String,
      required: [true, 'Please provide kickoff time'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format (HH:MM)'],
    },
    
    // Match Status
    status: {
      type: String,
      enum: ['scheduled', 'live', 'halftime', 'finished', 'postponed', 'cancelled', 'abandoned'],
      default: 'scheduled',
    },
    
    // Score
    score: {
      home: {
        type: Number,
        default: 0,
      },
      away: {
        type: Number,
        default: 0,
      },
    },
    
    // Half Time Score
    halfTimeScore: {
      home: {
        type: Number,
        default: 0,
      },
      away: {
        type: Number,
        default: 0,
      },
    },
    
    // Match Statistics
    statistics: {
      possession: {
        home: { type: Number, default: 50 },
        away: { type: Number, default: 50 },
      },
      shots: {
        home: { type: Number, default: 0 },
        away: { type: Number, default: 0 },
      },
      shotsOnTarget: {
        home: { type: Number, default: 0 },
        away: { type: Number, default: 0 },
      },
      corners: {
        home: { type: Number, default: 0 },
        away: { type: Number, default: 0 },
      },
      fouls: {
        home: { type: Number, default: 0 },
        away: { type: Number, default: 0 },
      },
      offsides: {
        home: { type: Number, default: 0 },
        away: { type: Number, default: 0 },
      },
      yellowCards: {
        home: { type: Number, default: 0 },
        away: { type: Number, default: 0 },
      },
      redCards: {
        home: { type: Number, default: 0 },
        away: { type: Number, default: 0 },
      },
    },
    
    // Match Officials
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Official',
    },
    assistantReferee1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Official',
    },
    assistantReferee2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Official',
    },
    fourthOfficial: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Official',
    },
    
    // Starting Lineups
    lineups: {
      home: {
        formation: String,
        players: [
          {
            player: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Player',
            },
            position: String,
            jerseyNumber: Number,
          },
        ],
        substitutes: [
          {
            player: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Player',
            },
            jerseyNumber: Number,
          },
        ],
      },
      away: {
        formation: String,
        players: [
          {
            player: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Player',
            },
            position: String,
            jerseyNumber: Number,
          },
        ],
        substitutes: [
          {
            player: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Player',
            },
            jerseyNumber: Number,
          },
        ],
      },
    },
    
    // Match Events (Goals, Cards, Substitutions, etc.)
    events: [
      {
        type: {
          type: String,
          enum: ['goal', 'yellow_card', 'red_card', 'substitution', 'penalty_missed', 'own_goal'],
          required: true,
        },
        team: {
          type: String,
          enum: ['home', 'away'],
          required: true,
        },
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player',
        },
        minute: {
          type: Number,
          required: true,
        },
        description: String,
        // For substitutions
        playerOut: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player',
        },
        playerIn: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player',
        },
        // For assists
        assistedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player',
        },
      },
    ],
    
    // Attendance
    attendance: {
      type: Number,
      min: [0, 'Attendance cannot be negative'],
    },
    
    // Weather Conditions
    weather: {
      condition: {
        type: String,
        enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'windy'],
      },
      temperature: Number, // in Celsius
    },
    
    // Match Summary/Report
    summary: {
      type: String,
      maxlength: [5000, 'Summary cannot be more than 5000 characters'],
    },
    
    // Highlight Video URL
    highlightVideo: {
      type: String,
    },
    
    // Live Stream URL
    liveStreamUrl: {
      type: String,
    },
    
    // Created By
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
matchSchema.index({ season: 1, matchDate: 1 });
matchSchema.index({ homeTeam: 1 });
matchSchema.index({ awayTeam: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ matchDate: 1 });

// Compound index to prevent duplicate matches
matchSchema.index(
  { season: 1, homeTeam: 1, awayTeam: 1, matchDate: 1 },
  { unique: true }
);

/**
 * Virtual for match result from home team perspective
 */
matchSchema.virtual('result').get(function () {
  if (this.status !== 'finished') return null;
  if (this.score.home > this.score.away) return 'W';
  if (this.score.home < this.score.away) return 'L';
  return 'D';
});

/**
 * Virtual for total goals
 */
matchSchema.virtual('totalGoals').get(function () {
  return this.score.home + this.score.away;
});

/**
 * Method to add a goal event
 */
matchSchema.methods.addGoal = function (team, player, minute, assistedBy = null) {
  // Add event
  this.events.push({
    type: 'goal',
    team: team,
    player: player,
    minute: minute,
    assistedBy: assistedBy,
    description: `Goal scored by player`,
  });
  
  // Update score
  if (team === 'home') {
    this.score.home += 1;
  } else {
    this.score.away += 1;
  }
  
  // Update statistics
  this.statistics.shots[team] += 1;
  this.statistics.shotsOnTarget[team] += 1;
};

/**
 * Method to add a card event
 */
matchSchema.methods.addCard = function (team, player, minute, cardType) {
  this.events.push({
    type: cardType === 'yellow' ? 'yellow_card' : 'red_card',
    team: team,
    player: player,
    minute: minute,
    description: `${cardType === 'yellow' ? 'Yellow' : 'Red'} card issued`,
  });
  
  // Update statistics
  if (cardType === 'yellow') {
    this.statistics.yellowCards[team] += 1;
  } else {
    this.statistics.redCards[team] += 1;
  }
};

/**
 * Method to add a substitution event
 */
matchSchema.methods.addSubstitution = function (team, playerOut, playerIn, minute) {
  this.events.push({
    type: 'substitution',
    team: team,
    playerOut: playerOut,
    playerIn: playerIn,
    minute: minute,
    description: 'Substitution',
  });
};

/**
 * Method to start the match
 */
matchSchema.methods.startMatch = function () {
  this.status = 'live';
};

/**
 * Method to set halftime
 */
matchSchema.methods.setHalftime = function () {
  this.status = 'halftime';
  this.halfTimeScore.home = this.score.home;
  this.halfTimeScore.away = this.score.away;
};

/**
 * Method to finish the match
 */
matchSchema.methods.finishMatch = function () {
  this.status = 'finished';
};

/**
 * Method to get match winner
 */
matchSchema.methods.getWinner = function () {
  if (this.status !== 'finished') return null;
  if (this.score.home > this.score.away) return this.homeTeam;
  if (this.score.away > this.score.home) return this.awayTeam;
  return null; // Draw
};

module.exports = mongoose.model('Match', matchSchema);
