/**
 * Poll Model
 * Represents polls/surveys for fan engagement
 */

const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema(
  {
    // Basic Information
    question: {
      type: String,
      required: [true, 'Please provide a poll question'],
      trim: true,
      maxlength: [300, 'Question cannot be more than 300 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    
    // Poll Options
    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: [200, 'Option text cannot be more than 200 characters'],
        },
        votes: {
          type: Number,
          default: 0,
        },
        voters: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
      },
    ],
    
    // Poll Type
    type: {
      type: String,
      enum: ['single_choice', 'multiple_choice'],
      default: 'single_choice',
    },
    
    // Category
    category: {
      type: String,
      enum: ['match', 'player', 'team', 'general', 'prediction'],
      default: 'general',
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
    
    // Duration
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date'],
    },
    
    // Status
    status: {
      type: String,
      enum: ['active', 'ended', 'draft'],
      default: 'draft',
    },
    
    // Total Votes
    totalVotes: {
      type: Number,
      default: 0,
    },
    
    // Allow multiple votes per user (for multiple choice)
    allowMultipleVotes: {
      type: Boolean,
      default: false,
    },
    
    // Show results before voting
    showResultsBeforeVoting: {
      type: Boolean,
      default: false,
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
pollSchema.index({ slug: 1 });
pollSchema.index({ status: 1 });
pollSchema.index({ category: 1 });
pollSchema.index({ endDate: 1 });
pollSchema.index({ createdAt: -1 });

// Validate that poll has at least 2 options
pollSchema.pre('save', function (next) {
  if (this.options.length < 2) {
    return next(new Error('Poll must have at least 2 options'));
  }
  
  // Generate slug
  if (this.isModified('question')) {
    this.slug = this.question
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Add timestamp to ensure uniqueness
    this.slug = `${this.slug}-${Date.now()}`;
  }
  
  // Check if poll should be ended
  if (this.status === 'active' && new Date() > this.endDate) {
    this.status = 'ended';
  }
  
  next();
});

/**
 * Virtual to check if poll is active
 */
pollSchema.virtual('isActive').get(function () {
  const now = new Date();
  return (
    this.status === 'active' &&
    now >= this.startDate &&
    now <= this.endDate
  );
});

/**
 * Method to vote on an option
 * @param {String} optionId - ID of the option to vote for
 * @param {String} userId - ID of the user voting
 */
pollSchema.methods.vote = function (optionId, userId) {
  if (!this.isActive) {
    throw new Error('Poll is not active');
  }
  
  // Find the option
  const option = this.options.id(optionId);
  if (!option) {
    throw new Error('Invalid option');
  }
  
  // Check if user has already voted (for single choice polls)
  if (this.type === 'single_choice') {
    const hasVoted = this.options.some((opt) =>
      opt.voters.some((voter) => voter.toString() === userId.toString())
    );
    
    if (hasVoted) {
      throw new Error('You have already voted on this poll');
    }
  }
  
  // Add vote
  option.votes += 1;
  option.voters.push(userId);
  this.totalVotes += 1;
  
  return this.save();
};

/**
 * Method to get poll results with percentages
 */
pollSchema.methods.getResults = function () {
  return this.options.map((option) => ({
    text: option.text,
    votes: option.votes,
    percentage:
      this.totalVotes > 0
        ? Math.round((option.votes / this.totalVotes) * 100)
        : 0,
  }));
};

/**
 * Method to check if user has voted
 */
pollSchema.methods.hasUserVoted = function (userId) {
  return this.options.some((option) =>
    option.voters.some((voter) => voter.toString() === userId.toString())
  );
};

module.exports = mongoose.model('Poll', pollSchema);
