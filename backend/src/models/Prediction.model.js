/**
 * Prediction Model
 * Represents user predictions for matches
 */

const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    // Match being predicted
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: [true, 'Please provide a match'],
    },
    
    // User making prediction
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
    
    // Predicted Score
    predictedScore: {
      home: {
        type: Number,
        required: [true, 'Please provide predicted home score'],
        min: [0, 'Score cannot be negative'],
      },
      away: {
        type: Number,
        required: [true, 'Please provide predicted away score'],
        min: [0, 'Score cannot be negative'],
      },
    },
    
    // Predicted Winner (optional - can be derived from score)
    predictedWinner: {
      type: String,
      enum: ['home', 'away', 'draw'],
    },
    
    // Confidence Level
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    
    // Points earned (calculated after match finishes)
    pointsEarned: {
      type: Number,
      default: 0,
    },
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'correct', 'partially_correct', 'incorrect'],
      default: 'pending',
    },
    
    // Reasoning (optional)
    reasoning: {
      type: String,
      maxlength: [500, 'Reasoning cannot be more than 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
predictionSchema.index({ match: 1, user: 1 }, { unique: true }); // One prediction per user per match
predictionSchema.index({ user: 1 });
predictionSchema.index({ status: 1 });
predictionSchema.index({ createdAt: -1 });

/**
 * Set predicted winner before saving
 */
predictionSchema.pre('save', function (next) {
  if (this.isModified('predictedScore')) {
    if (this.predictedScore.home > this.predictedScore.away) {
      this.predictedWinner = 'home';
    } else if (this.predictedScore.away > this.predictedScore.home) {
      this.predictedWinner = 'away';
    } else {
      this.predictedWinner = 'draw';
    }
  }
  next();
});

/**
 * Method to calculate points after match finishes
 * @param {Object} actualScore - {home: Number, away: Number}
 */
predictionSchema.methods.calculatePoints = function (actualScore) {
  let points = 0;
  
  // Exact score prediction: 10 points
  if (
    this.predictedScore.home === actualScore.home &&
    this.predictedScore.away === actualScore.away
  ) {
    points = 10;
    this.status = 'correct';
  }
  // Correct winner and goal difference: 7 points
  else if (
    this.predictedWinner === this._getWinner(actualScore) &&
    Math.abs(this.predictedScore.home - this.predictedScore.away) ===
      Math.abs(actualScore.home - actualScore.away)
  ) {
    points = 7;
    this.status = 'partially_correct';
  }
  // Correct winner only: 5 points
  else if (this.predictedWinner === this._getWinner(actualScore)) {
    points = 5;
    this.status = 'partially_correct';
  }
  // Incorrect: 0 points
  else {
    points = 0;
    this.status = 'incorrect';
  }
  
  this.pointsEarned = points;
  return this.save();
};

/**
 * Helper method to determine winner from score
 */
predictionSchema.methods._getWinner = function (score) {
  if (score.home > score.away) return 'home';
  if (score.away > score.home) return 'away';
  return 'draw';
};

module.exports = mongoose.model('Prediction', predictionSchema);
