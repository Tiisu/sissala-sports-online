/**
 * Season Model
 * Represents a season within a league
 */

const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Please provide a season name'],
      trim: true,
      maxlength: [100, 'Season name cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    
    // Associated League
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
      required: [true, 'Please provide a league'],
    },
    
    // Season Year
    year: {
      type: String,
      required: [true, 'Please provide a season year'],
      match: [/^\d{4}$|^\d{4}-\d{4}$/, 'Please provide a valid year format (e.g., 2024 or 2024-2025)'],
    },
    
    // Season Dates
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date'],
    },
    
    // Registration Dates
    registrationStartDate: {
      type: Date,
    },
    registrationEndDate: {
      type: Date,
    },
    
    // Season Status
    status: {
      type: String,
      enum: ['upcoming', 'registration', 'active', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    
    // Season Winner (set after season ends)
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    
    // Runner Up
    runnerUp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    
    // Top Scorer
    topScorer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null,
    },
    
    // Description
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    
    // Rules/Regulations
    rules: {
      type: String,
      maxlength: [5000, 'Rules cannot be more than 5000 characters'],
    },
    
    // Number of participating teams
    numberOfTeams: {
      type: Number,
      default: 0,
    },
    
    // Total matches in season
    totalMatches: {
      type: Number,
      default: 0,
    },
    
    // Matches played
    matchesPlayed: {
      type: Number,
      default: 0,
    },
    
    // Total goals scored
    totalGoals: {
      type: Number,
      default: 0,
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
seasonSchema.index({ league: 1, year: 1 });
seasonSchema.index({ slug: 1 });
seasonSchema.index({ status: 1 });
seasonSchema.index({ startDate: 1, endDate: 1 });

// Compound index for unique season per league per year
seasonSchema.index({ league: 1, year: 1 }, { unique: true });

/**
 * Generate slug from name and year before saving
 */
seasonSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isModified('year')) {
    this.slug = `${this.name}-${this.year}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

/**
 * Virtual for matches
 */
seasonSchema.virtual('matches', {
  ref: 'Match',
  localField: '_id',
  foreignField: 'season',
});

/**
 * Virtual for teams
 */
seasonSchema.virtual('teams', {
  ref: 'Team',
  localField: '_id',
  foreignField: 'currentSeason',
});

/**
 * Method to check if season is active
 */
seasonSchema.methods.isActive = function () {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.startDate && 
         now <= this.endDate;
};

/**
 * Method to calculate completion percentage
 */
seasonSchema.methods.getCompletionPercentage = function () {
  if (this.totalMatches === 0) return 0;
  return Math.round((this.matchesPlayed / this.totalMatches) * 100);
};

module.exports = mongoose.model('Season', seasonSchema);
