/**
 * League Model
 * Represents a football league with divisions
 */

const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Please provide a league name'],
      unique: true,
      trim: true,
      maxlength: [100, 'League name cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    
    // League Logo
    logo: {
      type: String,
      default: null,
    },
    
    // League Type
    type: {
      type: String,
      enum: ['professional', 'amateur', 'youth', 'women'],
      default: 'professional',
    },
    
    // Division/Tier
    division: {
      type: String,
      enum: ['premier', 'division1', 'division2', 'division3'],
      default: 'premier',
    },
    
    // Country/Region
    country: {
      type: String,
      required: [true, 'Please provide a country'],
      default: 'Ghana',
    },
    region: {
      type: String,
      required: [true, 'Please provide a region'],
    },
    
    // League Settings
    numberOfTeams: {
      type: Number,
      default: 16,
    },
    pointsForWin: {
      type: Number,
      default: 3,
    },
    pointsForDraw: {
      type: Number,
      default: 1,
    },
    pointsForLoss: {
      type: Number,
      default: 0,
    },
    
    // Contact Information
    contactEmail: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    contactPhone: {
      type: String,
    },
    website: {
      type: String,
    },
    
    // Social Media
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      youtube: String,
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
leagueSchema.index({ name: 1 });
leagueSchema.index({ slug: 1 });
leagueSchema.index({ division: 1 });
leagueSchema.index({ isActive: 1 });

/**
 * Generate slug from name before saving
 */
leagueSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

/**
 * Virtual for seasons
 */
leagueSchema.virtual('seasons', {
  ref: 'Season',
  localField: '_id',
  foreignField: 'league',
});

/**
 * Virtual for teams
 */
leagueSchema.virtual('teams', {
  ref: 'Team',
  localField: '_id',
  foreignField: 'league',
});

module.exports = mongoose.model('League', leagueSchema);
