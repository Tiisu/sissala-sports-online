/**
 * Media Model
 * Represents photos and videos (galleries, highlights, etc.)
 */

const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    
    // Media Type
    type: {
      type: String,
      required: [true, 'Please provide media type'],
      enum: ['photo', 'video', 'gallery'],
      default: 'photo',
    },
    
    // File Information
    fileUrl: {
      type: String,
      required: [true, 'Please provide file URL'],
    },
    thumbnailUrl: {
      type: String,
    },
    fileSize: {
      type: Number, // in bytes
    },
    mimeType: {
      type: String,
    },
    
    // For galleries - collection of photos
    photos: [
      {
        url: String,
        caption: String,
        order: Number,
      },
    ],
    
    // Video specific fields
    duration: {
      type: Number, // in seconds
    },
    embedUrl: {
      type: String, // For YouTube, Vimeo, etc.
    },
    
    // Category
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['match_highlights', 'training', 'press_conference', 'celebration', 'behind_scenes', 'other'],
      default: 'other',
    },
    
    // Tags
    tags: {
      type: [String],
      default: [],
    },
    
    // Related Entities
    relatedMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
    },
    relatedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    relatedPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    },
    relatedSeason: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
    },
    
    // Uploaded By
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    
    // Views and Engagement
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    
    // Featured
    isFeatured: {
      type: Boolean,
      default: false,
    },
    
    // Date of capture
    capturedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
mediaSchema.index({ type: 1 });
mediaSchema.index({ category: 1 });
mediaSchema.index({ status: 1 });
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ views: -1 });
mediaSchema.index({ isFeatured: 1 });

/**
 * Virtual for photo count (for galleries)
 */
mediaSchema.virtual('photoCount').get(function () {
  return this.type === 'gallery' ? this.photos.length : 0;
});

/**
 * Method to increment views
 */
mediaSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

/**
 * Method to toggle like
 */
mediaSchema.methods.toggleLike = function () {
  this.likes += 1;
  return this.save();
};

/**
 * Method to add photo to gallery
 */
mediaSchema.methods.addPhoto = function (photoUrl, caption = '') {
  if (this.type !== 'gallery') {
    throw new Error('Can only add photos to gallery type media');
  }
  
  const order = this.photos.length + 1;
  this.photos.push({
    url: photoUrl,
    caption: caption,
    order: order,
  });
  
  return this.save();
};

module.exports = mongoose.model('Media', mediaSchema);
