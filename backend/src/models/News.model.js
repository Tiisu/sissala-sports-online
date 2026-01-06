/**
 * News Model
 * Represents news articles and announcements
 */

const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    
    // Content
    content: {
      type: String,
      required: [true, 'Please provide content'],
      maxlength: [10000, 'Content cannot be more than 10000 characters'],
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot be more than 500 characters'],
    },
    
    // Featured Image
    featuredImage: {
      type: String,
      default: null,
    },
    
    // Category
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['transfer', 'match_report', 'injury', 'announcement', 'interview', 'general'],
      default: 'general',
    },
    
    // Tags
    tags: {
      type: [String],
      default: [],
    },
    
    // Related Entities
    relatedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    relatedPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    },
    relatedMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
    },
    
    // Author
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Publication Status
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
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
    
    // Comments
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        comment: {
          type: String,
          required: true,
          maxlength: [1000, 'Comment cannot be more than 1000 characters'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // SEO
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot be more than 160 characters'],
    },
    metaKeywords: {
      type: [String],
      default: [],
    },
    
    // Featured/Pinned
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
newsSchema.index({ title: 'text', content: 'text' });
newsSchema.index({ slug: 1 });
newsSchema.index({ category: 1 });
newsSchema.index({ status: 1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ author: 1 });
newsSchema.index({ views: -1 });
newsSchema.index({ isFeatured: 1, isPinned: 1 });

/**
 * Generate slug from title before saving
 */
newsSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Add timestamp to ensure uniqueness
    this.slug = `${this.slug}-${Date.now()}`;
  }
  
  // Set published date if status changed to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Auto-generate excerpt if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 200) + '...';
  }
  
  next();
});

/**
 * Virtual for reading time (minutes)
 */
newsSchema.virtual('readingTime').get(function () {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

/**
 * Virtual for comment count
 */
newsSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

/**
 * Method to increment views
 */
newsSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

/**
 * Method to add a comment
 */
newsSchema.methods.addComment = function (userId, commentText) {
  this.comments.push({
    user: userId,
    comment: commentText,
  });
  return this.save();
};

/**
 * Method to toggle like
 */
newsSchema.methods.toggleLike = function () {
  this.likes += 1;
  return this.save();
};

module.exports = mongoose.model('News', newsSchema);
