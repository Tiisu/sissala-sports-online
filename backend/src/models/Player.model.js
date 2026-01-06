/**
 * Player Model
 * Represents a football player
 */

const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, 'Please provide player first name'],
      trim: true,
      maxlength: [50, 'First name cannot be more than 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide player last name'],
      trim: true,
      maxlength: [50, 'Last name cannot be more than 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    nickname: {
      type: String,
      trim: true,
      maxlength: [50, 'Nickname cannot be more than 50 characters'],
    },
    
    // Player Photo
    photo: {
      type: String,
      default: null,
    },
    
    // Date of Birth
    dateOfBirth: {
      type: Date,
      required: [true, 'Please provide date of birth'],
    },
    
    // Nationality
    nationality: {
      type: String,
      required: [true, 'Please provide nationality'],
      default: 'Ghana',
    },
    
    // Current Team
    currentTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Please provide current team'],
    },
    
    // Jersey Number
    jerseyNumber: {
      type: Number,
      required: [true, 'Please provide jersey number'],
      min: [1, 'Jersey number must be at least 1'],
      max: [99, 'Jersey number cannot exceed 99'],
    },
    
    // Position
    position: {
      type: String,
      required: [true, 'Please provide player position'],
      enum: {
        values: ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'],
        message: 'Please provide a valid position',
      },
    },
    
    // Physical Attributes
    height: {
      type: Number, // in centimeters
      min: [140, 'Height must be at least 140 cm'],
      max: [220, 'Height cannot exceed 220 cm'],
    },
    weight: {
      type: Number, // in kilograms
      min: [40, 'Weight must be at least 40 kg'],
      max: [150, 'Weight cannot exceed 150 kg'],
    },
    
    // Preferred Foot
    preferredFoot: {
      type: String,
      enum: ['Left', 'Right', 'Both'],
      default: 'Right',
    },
    
    // Contract Information
    contractStart: {
      type: Date,
    },
    contractEnd: {
      type: Date,
    },
    
    // Previous Teams (Transfer History)
    transferHistory: [
      {
        team: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Team',
        },
        joinDate: Date,
        leaveDate: Date,
        transferFee: Number,
      },
    ],
    
    // Player Statistics (current season)
    statistics: {
      appearances: {
        type: Number,
        default: 0,
      },
      goals: {
        type: Number,
        default: 0,
      },
      assists: {
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
      minutesPlayed: {
        type: Number,
        default: 0,
      },
      cleanSheets: {
        type: Number,
        default: 0,
      },
      penaltiesSaved: {
        type: Number,
        default: 0,
      },
      saves: {
        type: Number,
        default: 0,
      },
    },
    
    // Career Statistics (all time)
    careerStatistics: {
      totalAppearances: {
        type: Number,
        default: 0,
      },
      totalGoals: {
        type: Number,
        default: 0,
      },
      totalAssists: {
        type: Number,
        default: 0,
      },
      totalYellowCards: {
        type: Number,
        default: 0,
      },
      totalRedCards: {
        type: Number,
        default: 0,
      },
    },
    
    // Biography
    biography: {
      type: String,
      maxlength: [2000, 'Biography cannot be more than 2000 characters'],
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Injury Status
    isInjured: {
      type: Boolean,
      default: false,
    },
    injuryDetails: {
      type: String,
    },
    expectedReturnDate: {
      type: Date,
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
playerSchema.index({ firstName: 1, lastName: 1 });
playerSchema.index({ slug: 1 });
playerSchema.index({ currentTeam: 1 });
playerSchema.index({ position: 1 });
playerSchema.index({ 'statistics.goals': -1 });
playerSchema.index({ 'statistics.assists': -1 });

// Compound index for unique jersey number per team
playerSchema.index({ currentTeam: 1, jerseyNumber: 1 }, { unique: true });

/**
 * Generate slug from name before saving
 */
playerSchema.pre('save', function (next) {
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.slug = `${this.firstName}-${this.lastName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

/**
 * Virtual for full name
 */
playerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Virtual for age
 */
playerSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

/**
 * Virtual for goals per game
 */
playerSchema.virtual('goalsPerGame').get(function () {
  if (this.statistics.appearances === 0) return 0;
  return (this.statistics.goals / this.statistics.appearances).toFixed(2);
});

/**
 * Method to update player statistics after a match
 */
playerSchema.methods.updateStatistics = function (stats) {
  const { goals = 0, assists = 0, yellowCards = 0, redCards = 0, minutesPlayed = 0, cleanSheets = 0, saves = 0, penaltiesSaved = 0 } = stats;
  
  // Update current season stats
  if (minutesPlayed > 0) {
    this.statistics.appearances += 1;
  }
  this.statistics.goals += goals;
  this.statistics.assists += assists;
  this.statistics.yellowCards += yellowCards;
  this.statistics.redCards += redCards;
  this.statistics.minutesPlayed += minutesPlayed;
  this.statistics.cleanSheets += cleanSheets;
  this.statistics.saves += saves;
  this.statistics.penaltiesSaved += penaltiesSaved;
  
  // Update career stats
  if (minutesPlayed > 0) {
    this.careerStatistics.totalAppearances += 1;
  }
  this.careerStatistics.totalGoals += goals;
  this.careerStatistics.totalAssists += assists;
  this.careerStatistics.totalYellowCards += yellowCards;
  this.careerStatistics.totalRedCards += redCards;
};

/**
 * Method to reset season statistics
 */
playerSchema.methods.resetSeasonStatistics = function () {
  this.statistics = {
    appearances: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    minutesPlayed: 0,
    cleanSheets: 0,
    penaltiesSaved: 0,
    saves: 0,
  };
};

/**
 * Method to transfer player to another team
 */
playerSchema.methods.transferTo = function (newTeam, transferFee = 0) {
  // Add current team to transfer history
  this.transferHistory.push({
    team: this.currentTeam,
    joinDate: this.contractStart,
    leaveDate: new Date(),
    transferFee: transferFee,
  });
  
  // Update current team
  this.currentTeam = newTeam;
  this.contractStart = new Date();
};

module.exports = mongoose.model('Player', playerSchema);
