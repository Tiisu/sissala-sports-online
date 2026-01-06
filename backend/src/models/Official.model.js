/**
 * Official Model
 * Represents match officials (referees, assistant referees)
 */

const mongoose = require('mongoose');

const officialSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
      trim: true,
      maxlength: [50, 'First name cannot be more than 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
      trim: true,
      maxlength: [50, 'Last name cannot be more than 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    
    // Photo
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
    
    // Official Role
    role: {
      type: String,
      required: [true, 'Please provide official role'],
      enum: ['referee', 'assistant_referee', 'fourth_official', 'var'],
      default: 'referee',
    },
    
    // Experience Level
    level: {
      type: String,
      enum: ['regional', 'national', 'international'],
      default: 'regional',
    },
    
    // License Information
    licenseNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    licenseIssueDate: {
      type: Date,
    },
    licenseExpiryDate: {
      type: Date,
    },
    
    // Statistics
    statistics: {
      matchesOfficiated: {
        type: Number,
        default: 0,
      },
      yellowCardsIssued: {
        type: Number,
        default: 0,
      },
      redCardsIssued: {
        type: Number,
        default: 0,
      },
      penaltiesAwarded: {
        type: Number,
        default: 0,
      },
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
    
    // Biography
    biography: {
      type: String,
      maxlength: [1000, 'Biography cannot be more than 1000 characters'],
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
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
officialSchema.index({ firstName: 1, lastName: 1 });
officialSchema.index({ slug: 1 });
officialSchema.index({ role: 1 });
officialSchema.index({ level: 1 });
officialSchema.index({ isActive: 1, isAvailable: 1 });

/**
 * Generate slug from name before saving
 */
officialSchema.pre('save', function (next) {
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
officialSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Virtual for age
 */
officialSchema.virtual('age').get(function () {
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
 * Virtual for average cards per match
 */
officialSchema.virtual('averageCardsPerMatch').get(function () {
  if (this.statistics.matchesOfficiated === 0) return 0;
  const totalCards = this.statistics.yellowCardsIssued + this.statistics.redCardsIssued;
  return (totalCards / this.statistics.matchesOfficiated).toFixed(2);
});

/**
 * Method to update statistics after a match
 */
officialSchema.methods.updateStatistics = function (yellowCards, redCards, penalties = 0) {
  this.statistics.matchesOfficiated += 1;
  this.statistics.yellowCardsIssued += yellowCards;
  this.statistics.redCardsIssued += redCards;
  this.statistics.penaltiesAwarded += penalties;
};

/**
 * Method to check if license is valid
 */
officialSchema.methods.isLicenseValid = function () {
  if (!this.licenseExpiryDate) return false;
  return new Date() < this.licenseExpiryDate;
};

module.exports = mongoose.model('Official', officialSchema);
