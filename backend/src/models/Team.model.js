/**
 * Team Model
 * Represents a football team in the league
 */

const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Please provide a team name'],
      unique: true,
      trim: true,
      maxlength: [100, 'Team name cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    shortName: {
      type: String,
      trim: true,
      maxlength: [20, 'Short name cannot be more than 20 characters'],
    },
    nickname: {
      type: String,
      trim: true,
      maxlength: [50, 'Nickname cannot be more than 50 characters'],
    },
    
    // Team Logo
    logo: {
      type: String,
      default: null,
    },
    
    // Team Photo (First Eleven / Team Picture)
    teamPhoto: {
      type: String,
      default: null,
    },
    
    // Team Colors
    primaryColor: {
      type: String,
      default: '#000000',
    },
    secondaryColor: {
      type: String,
      default: '#FFFFFF',
    },
    
    // League Association
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      required: [true, 'Please provide a league'],
    },
    
    // Current Season
    currentSeason: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
    },
    
    // Home Venue
    homeVenue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
    },
    
    // Founded Year
    foundedYear: {
      type: Number,
      min: [1800, 'Founded year must be after 1800'],
      max: [new Date().getFullYear(), 'Founded year cannot be in the future'],
    },
    
    // Manager/Coach
    manager: {
      name: {
        type: String,
        trim: true,
      },
      photo: String,
      nationality: String,
      appointedDate: Date,
    },
    
    // Team Captain
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    },
    
    // Description/History
    description: {
      type: String,
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    
    // Contact Information
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: String,
    website: String,
    
    // Address
    address: {
      street: String,
      city: String,
      region: String,
      country: {
        type: String,
        default: 'Ghana',
      },
    },
    
    // Social Media
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      youtube: String,
    },
    
    // Team Statistics (current season)
    statistics: {
      matchesPlayed: {
        type: Number,
        default: 0,
      },
      wins: {
        type: Number,
        default: 0,
      },
      draws: {
        type: Number,
        default: 0,
      },
      losses: {
        type: Number,
        default: 0,
      },
      goalsFor: {
        type: Number,
        default: 0,
      },
      goalsAgainst: {
        type: Number,
        default: 0,
      },
      points: {
        type: Number,
        default: 0,
      },
      yellowCards: {
        type: Number,
        default: 0,
      },
      redCards: {
        type: Number,
        default: 0,
      },
    },
    
    // Current Form (last 5 matches: W, D, L)
    currentForm: {
      type: [String],
      enum: ['W', 'D', 'L'],
      default: [],
      validate: {
        validator: function(arr) {
          return arr.length <= 5;
        },
        message: 'Current form can only store up to 5 results',
      },
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
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
teamSchema.index({ name: 1 });
teamSchema.index({ slug: 1 });
teamSchema.index({ league: 1 });
teamSchema.index({ currentSeason: 1 });
teamSchema.index({ 'statistics.points': -1 });

/**
 * Generate slug from name before saving
 */
teamSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

/**
 * Virtual for squad (players)
 */
teamSchema.virtual('squad', {
  ref: 'Player',
  localField: '_id',
  foreignField: 'currentTeam',
});

/**
 * Virtual for goal difference
 */
teamSchema.virtual('goalDifference').get(function () {
  return this.statistics.goalsFor - this.statistics.goalsAgainst;
});

/**
 * Virtual for win percentage
 */
teamSchema.virtual('winPercentage').get(function () {
  if (this.statistics.matchesPlayed === 0) return 0;
  return Math.round((this.statistics.wins / this.statistics.matchesPlayed) * 100);
});

/**
 * Method to update team statistics after a match
 */
teamSchema.methods.updateStatistics = function (result, goalsFor, goalsAgainst, yellowCards = 0, redCards = 0) {
  this.statistics.matchesPlayed += 1;
  this.statistics.goalsFor += goalsFor;
  this.statistics.goalsAgainst += goalsAgainst;
  this.statistics.yellowCards += yellowCards;
  this.statistics.redCards += redCards;
  
  // Update points and result
  if (result === 'W') {
    this.statistics.wins += 1;
    this.statistics.points += 3;
  } else if (result === 'D') {
    this.statistics.draws += 1;
    this.statistics.points += 1;
  } else if (result === 'L') {
    this.statistics.losses += 1;
  }
  
  // Update current form (keep last 5)
  this.currentForm.unshift(result);
  if (this.currentForm.length > 5) {
    this.currentForm.pop();
  }
};

/**
 * Method to reset statistics (for new season)
 */
teamSchema.methods.resetStatistics = function () {
  this.statistics = {
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    yellowCards: 0,
    redCards: 0,
  };
  this.currentForm = [];
};

module.exports = mongoose.model('Team', teamSchema);
