/**
 * Forum Model
 * Represents forum topics and discussions
 */

const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema(
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
      maxlength: [5000, 'Content cannot be more than 5000 characters'],
    },
    
    // Category
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['general', 'match_discussion', 'team_talk', 'player_discussion', 'transfers', 'other'],
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
    
    // Replies/Comments
    replies: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: [2000, 'Reply cannot be more than 2000 characters'],
        },
        likes: {
          type: Number,
          default: 0,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Views
    views: {
      type: Number,
      default: 0,
    },
    
    // Likes
    likes: {
      type: Number,
      default: 0,
    },
    
    // Status
    status: {
      type: String,
      enum: ['open', 'closed', 'pinned'],
      default: 'open',
    },
    
    // Is Locked (no more replies allowed)
    isLocked: {
      type: Boolean,
      default: false,
    },
    
    // Last Activity
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
forumSchema.index({ title: 'text', content: 'text' });
forumSchema.index({ slug: 1 });
forumSchema.index({ category: 1 });
forumSchema.index({ author: 1 });
forumSchema.index({ status: 1 });
forumSchema.index({ lastActivityAt: -1 });
forumSchema.index({ views: -1 });

/**
 * Generate slug from title before saving
 */
forumSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Add timestamp to ensure uniqueness
    this.slug = `${this.slug}-${Date.now()}`;
  }
  next();
});

/**
 * Virtual for reply count
 */
forumSchema.virtual('replyCount').get(function () {
  return this.replies.length;
});

/**
 * Method to increment views
 */
forumSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

/**
 * Method to add a reply
 */
forumSchema.methods.addReply = function (userId, content) {
  if (this.isLocked) {
    throw new Error('This topic is locked and cannot accept new replies');
  }
  
  this.replies.push({
    user: userId,
    content: content,
  });
  
  this.lastActivityAt = new Date();
  return this.save();
};

/**
 * Method to toggle like
 */
forumSchema.methods.toggleLike = function () {
  this.likes += 1;
  return this.save();
};

/**
 * Method to lock/unlock topic
 */
forumSchema.methods.toggleLock = function () {
  this.isLocked = !this.isLocked;
  return this.save();
};

module.exports = mongoose.model('Forum', forumSchema);
