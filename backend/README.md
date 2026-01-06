# Sissala Football League - Backend API

A comprehensive backend API for managing a football league, built with Node.js, Express, and MongoDB.

## 🌟 Features

- **Complete League Management** - Leagues, seasons, teams, and players
- **Live Match Updates** - Real-time match events via Socket.io
- **User Authentication** - JWT-based auth with role-based access control
- **Statistics & Analytics** - League tables, top scorers, team statistics
- **Community Features** - News, forums, predictions, polls
- **Media Management** - Photos, videos, and galleries
- **RESTful API** - 160+ well-documented endpoints

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Create upload directories
mkdir -p uploads/{teams,players,news,venues,media,misc}

# Start the server
npm run dev
```

## 🛠️ Tech Stack

- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Multer** - File uploads
- **Bcrypt** - Password hashing

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── uploads/             # File uploads
├── .env.example         # Environment template
└── package.json         # Dependencies
```

## 🔑 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sissala_football_league
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Leagues & Seasons
- `GET /api/leagues` - Get all leagues
- `GET /api/seasons` - Get all seasons
- `GET /api/seasons/:id/standings` - Get season standings

### Teams & Players
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id/squad` - Get team squad
- `GET /api/players` - Get all players

### Matches
- `GET /api/matches/live` - Get live matches
- `POST /api/matches/:id/events/goal` - Add goal event
- Real-time updates via Socket.io

### Statistics
- `GET /api/statistics/season/:id/top-scorers` - Top scorers
- `GET /api/statistics/league/:id/table` - League table

### Community
- `GET /api/news` - Get news articles
- `GET /api/media` - Get media files
- `POST /api/predictions` - Create match prediction
- `POST /api/polls/:id/vote` - Vote on poll

## 🔐 Authentication

Include JWT token in requests:
```
Authorization: Bearer <your_token>
```

## 👥 User Roles

- **user** - Basic access (view, predict, vote)
- **editor** - Create news and media
- **manager** - Manage teams and players
- **admin** - Full system access

## 🧪 Testing

```bash
# Test the API
curl http://localhost:5000/api/health
```

## 📄 License

MIT License - See LICENSE file for details

---

**Built for the Sissala Football League** ⚽
