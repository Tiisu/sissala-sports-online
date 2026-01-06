/**
 * Venue Model
 * Represents a stadium/ground where matches are played
 */

const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Please provide venue name'],
      unique: true,
      trim: true,
      maxlength: [100, 'Venue name cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    nickname: {
      type: String,
      trim: true,
      maxlength: [100, 'Nickname cannot be more than 100 characters'],
    },
    
    // Venue Photos
    photos: [
      {
        type: String,
      },
    ],
    
    // Capacity
    capacity: {
      type: Number,
      required: [true, 'Please provide venue capacity'],
      min: [0, 'Capacity cannot be negative'],
    },
    
    // Address
    address: {
      street: {
        type: String,
        required: [true, 'Please provide street address'],
      },
      city: {
        type: String,
        required: [true, 'Please provide city'],
      },
      region: {
        type: String,
        required: [true, 'Please provide region'],
      },
      country: {
        type: String,
        default: 'Ghana',
      },
      postalCode: String,
    },
    
    // Coordinates (for maps)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
    },
    
    // Pitch Details
    pitch: {
      type: {
        type: String,
        enum: ['natural_grass', 'artificial_turf', 'hybrid'],
        default: 'natural_grass',
      },
      dimensions: {
        length: Number, // in meters
        width: Number, // in meters
      },
    },
    
    // Facilities
    facilities: {
      parking: {
        type: Boolean,
        default: false,
      },
      vipBoxes: {
        type: Boolean,
        default: false,
      },
      disabledAccess: {
        type: Boolean,
        default: false,
      },
      foodCourts: {
        type: Boolean,
        default: false,
      },
      changeRooms: {
        type: Number,
        default: 2,
      },
    },
    
    // Home Team
    homeTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    
    // Opened Date
    openedDate: {
      type: Date,
    },
    
    // Description
    description: {
      type: String,
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    
    // Contact Information
    contactEmail: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    contactPhone: String,
    
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
venueSchema.index({ name: 1 });
venueSchema.index({ slug: 1 });
venueSchema.index({ 'address.city': 1 });
venueSchema.index({ location: '2dsphere' });

/**
 * Generate slug from name before saving
 */
venueSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

/**
 * Virtual for full address
 */
venueSchema.virtual('fullAddress').get(function () {
  return `${this.address.street}, ${this.address.city}, ${this.address.region}, ${this.address.country}`;
});

/**
 * Virtual for matches
 */
venueSchema.virtual('matches', {
  ref: 'Match',
  localField: '_id',
  foreignField: 'venue',
});

/**
 * Method to check if venue has capacity for attendance
 */
venueSchema.methods.hasCapacity = function (attendanceCount) {
  return attendanceCount <= this.capacity;
};

module.exports = mongoose.model('Venue', venueSchema);
