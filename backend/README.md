# Sissala Football League - Backend API

## Overview
Express.js backend API for the Sissala Football League management system. This API provides comprehensive endpoints for managing football leagues, teams, players, matches, and statistics.

## Tech Stack
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary/AWS S3 for images
- **Real-time**: Socket.io for live match updates
- **Validation**: Joi/Express-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

## Project Structure
```
backend/
├── src/
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth, validation, error handling
│   ├── models/             # Database schemas
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Helper functions
│   ├── config/             # Configuration files
│   └── validators/         # Request validation schemas
├── tests/                  # Test files
├── uploads/               # Temporary file storage
└── docs/                  # API documentation
```

## Installation & Setup

```bash
# Clone and install dependencies
cd backend
npm install

# Environment setup
cp .env.example .env
# Edit .env with your configurations

# Database setup
npm run db:migrate
npm run db:seed

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sissala_league
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Authentication & Users
```http
POST   /api/auth/register           # Register new user
POST   /api/auth/login              # User login
POST   /api/auth/logout             # User logout
POST   /api/auth/forgot-password    # Request password reset
POST   /api/auth/reset-password     # Reset password with token
GET    /api/auth/me                 # Get current user profile
PUT    /api/auth/update-profile     # Update user profile
PUT    /api/auth/change-password    # Change password
```

### League Management
```http
GET    /api/leagues                 # Get all leagues
POST   /api/leagues                 # Create new league (Admin)
GET    /api/leagues/:id             # Get league by ID
PUT    /api/leagues/:id             # Update league (Admin)
DELETE /api/leagues/:id             # Delete league (Admin)
GET    /api/leagues/:id/standings   # Get league table/standings
GET    /api/leagues/:id/seasons     # Get league seasons
GET    /api/leagues/:id/stats       # Get league statistics
```

### Teams Management
```http
GET    /api/teams                   # Get all teams (with filters)
POST   /api/teams                   # Create new team (Admin)
GET    /api/teams/:id               # Get team details
PUT    /api/teams/:id               # Update team (Admin)
DELETE /api/teams/:id               # Delete team (Admin)
GET    /api/teams/:id/players       # Get team squad
GET    /api/teams/:id/matches       # Get team fixtures & results
GET    /api/teams/:id/stats         # Get team statistics
POST   /api/teams/:id/logo          # Upload team logo (Admin)
GET    /api/teams/:id/history       # Get team history
```

### Player Management
```http
GET    /api/players                 # Get all players (with filters)
POST   /api/players                 # Create new player (Admin)
GET    /api/players/:id             # Get player details
PUT    /api/players/:id             # Update player (Admin)
DELETE /api/players/:id             # Delete player (Admin)
POST   /api/players/:id/photo       # Upload player photo (Admin)
GET    /api/players/:id/stats       # Get player statistics
GET    /api/players/:id/history     # Get player career history
POST   /api/players/:id/transfer    # Transfer player (Admin)
GET    /api/players/top-scorers     # Get top scorers
GET    /api/players/top-assists     # Get top assists
```

### Match Management
```http
GET    /api/matches                 # Get all matches (with filters)
POST   /api/matches                 # Create new match (Admin)
GET    /api/matches/:id             # Get match details
PUT    /api/matches/:id             # Update match (Admin)
DELETE /api/matches/:id             # Delete match (Admin)
POST   /api/matches/:id/start       # Start match (Admin)
POST   /api/matches/:id/end         # End match (Admin)
POST   /api/matches/:id/events      # Add match event (goal, card, etc.)
GET    /api/matches/:id/events      # Get match events
GET    /api/matches/:id/lineups     # Get match lineups
POST   /api/matches/:id/lineups     # Set match lineups (Admin)
GET    /api/matches/live            # Get live matches
GET    /api/matches/upcoming        # Get upcoming fixtures
GET    /api/matches/results         # Get recent results
```

### Statistics & Analytics
```http
GET    /api/stats/leagues/:id       # League statistics
GET    /api/stats/teams/:id         # Team statistics
GET    /api/stats/players/:id       # Player statistics
GET    /api/stats/top-scorers       # Top goal scorers
GET    /api/stats/top-assists       # Top assists
GET    /api/stats/disciplinary      # Cards and suspensions
GET    /api/stats/head-to-head      # Team head-to-head records
GET    /api/stats/form-guide        # Team form (last 5 matches)
```

### News & Media
```http
GET    /api/news                    # Get all news articles
POST   /api/news                    # Create news article (Admin)
GET    /api/news/:id                # Get news article
PUT    /api/news/:id                # Update news article (Admin)
DELETE /api/news/:id                # Delete news article (Admin)
POST   /api/news/:id/image          # Upload news image (Admin)
GET    /api/media/photos            # Get photo galleries
POST   /api/media/photos            # Upload photos (Admin)
GET    /api/media/videos            # Get video highlights
POST   /api/media/videos            # Upload videos (Admin)
```

### Venue Management
```http
GET    /api/venues                  # Get all venues
POST   /api/venues                  # Create new venue (Admin)
GET    /api/venues/:id              # Get venue details
PUT    /api/venues/:id              # Update venue (Admin)
DELETE /api/venues/:id              # Delete venue (Admin)
GET    /api/venues/:id/matches      # Get venue match history
POST   /api/venues/:id/image        # Upload venue image (Admin)
```

### Officials Management
```http
GET    /api/officials               # Get all officials (referees)
POST   /api/officials               # Create new official (Admin)
GET    /api/officials/:id           # Get official details
PUT    /api/officials/:id           # Update official (Admin)
DELETE /api/officials/:id           # Delete official (Admin)
GET    /api/officials/:id/matches   # Get official match history
POST   /api/officials/:id/photo     # Upload official photo (Admin)
```

### Seasons Management
```http
GET    /api/seasons                 # Get all seasons
POST   /api/seasons                 # Create new season (Admin)
GET    /api/seasons/:id             # Get season details
PUT    /api/seasons/:id             # Update season (Admin)
DELETE /api/seasons/:id             # Delete season (Admin)
GET    /api/seasons/current         # Get current season
GET    /api/seasons/:id/standings   # Get season standings
GET    /api/seasons/:id/fixtures    # Get season fixtures
GET    /api/seasons/:id/stats       # Get season statistics
```

### Community Features
```http
GET    /api/forums                  # Get forum categories
GET    /api/forums/:id/posts        # Get forum posts
POST   /api/forums/:id/posts        # Create forum post (Auth)
GET    /api/predictions             # Get match predictions
POST   /api/predictions             # Submit prediction (Auth)
GET    /api/polls                   # Get active polls
POST   /api/polls/:id/vote          # Vote in poll (Auth)
```

### Search & Filters
```http
GET    /api/search                  # Global search
GET    /api/search/teams            # Search teams
GET    /api/search/players          # Search players
GET    /api/search/matches          # Search matches
GET    /api/search/news             # Search news
```

### Admin Dashboard
```http
GET    /api/admin/dashboard         # Admin dashboard stats
GET    /api/admin/users             # Manage users
GET    /api/admin/activities        # View system activities
POST   /api/admin/bulk-import       # Bulk import data
GET    /api/admin/reports           # Generate reports
```

## Real-time Events (Socket.io)
```javascript
// Client events
socket.on('match:goal', (data) => {})          // Goal scored
socket.on('match:card', (data) => {})          // Card issued
socket.on('match:substitution', (data) => {})  // Player substitution
socket.on('match:start', (data) => {})         // Match started
socket.on('match:end', (data) => {})           // Match ended
socket.on('match:update', (data) => {})        // Live score update

// Server events
socket.emit('join-match', matchId)             // Join match updates
socket.emit('leave-match', matchId)            // Leave match updates
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "pagination": {
    "page": 1,
    "pages": 10,
    "total": 100,
    "limit": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information",
  "code": "ERROR_CODE"
}
```

## Data Models

### League Schema
```javascript
{
  name: String,
  season: String,
  division: String,
  startDate: Date,
  endDate: Date,
  teams: [ObjectId],
  logo: String,
  description: String,
  rules: String,
  status: String // active, completed, upcoming
}
```

### Team Schema
```javascript
{
  name: String,
  shortName: String,
  founded: Date,
  stadium: ObjectId,
  logo: String,
  colors: {
    primary: String,
    secondary: String
  },
  manager: String,
  league: ObjectId,
  players: [ObjectId],
  contact: {
    email: String,
    phone: String,
    address: String
  }
}
```

### Player Schema
```javascript
{
  name: String,
  position: String,
  jerseyNumber: Number,
  dateOfBirth: Date,
  nationality: String,
  team: ObjectId,
  photo: String,
  height: Number,
  weight: Number,
  preferredFoot: String,
  status: String, // active, injured, suspended
  stats: {
    goals: Number,
    assists: Number,
    appearances: Number,
    yellowCards: Number,
    redCards: Number
  }
}
```

### Match Schema
```javascript
{
  homeTeam: ObjectId,
  awayTeam: ObjectId,
  venue: ObjectId,
  date: Date,
  league: ObjectId,
  season: ObjectId,
  status: String, // scheduled, live, completed, postponed
  score: {
    home: Number,
    away: Number
  },
  events: [MatchEvent],
  lineups: {
    home: [PlayerLineup],
    away: [PlayerLineup]
  },
  referee: ObjectId,
  attendance: Number
}
```

## Authentication & Authorization

### User Roles
- **Admin**: Full system access
- **Manager**: Team management access
- **Editor**: Content creation access
- **User**: Read-only + community features

### JWT Token Structure
```javascript
{
  "userId": "user_id",
  "role": "admin|manager|editor|user",
  "permissions": ["create", "read", "update", "delete"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

## API Rate Limiting
- **Public endpoints**: 100 requests/hour per IP
- **Authenticated endpoints**: 1000 requests/hour per user
- **Admin endpoints**: No limit

## Error Codes
- **AUTH_001**: Invalid credentials
- **AUTH_002**: Token expired
- **AUTH_003**: Insufficient permissions
- **VAL_001**: Validation error
- **DB_001**: Database error
- **FILE_001**: File upload error

## Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:auth
npm run test:leagues
npm run test:matches

# Generate coverage report
npm run test:coverage
```

## Deployment
```bash
# Production build
npm run build

# Start production server
npm start

# Docker deployment
docker build -t sissala-league-api .
docker run -p 5000:5000 sissala-league-api
```

## API Documentation
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Postman Collection**: Available in `/docs` folder

## Contributing
1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add tests for new features
5. Submit pull request

## License
MIT License - See LICENSE file for details