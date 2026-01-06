/**
 * Statistics Controller - Calculate real-time statistics from matches
 */

const { asyncHandler } = require('../middleware/error.middleware');
const { sendSuccess } = require('../utils/response.util');
const Match = require('../models/Match.model');
const Team = require('../models/Team.model');
const Player = require('../models/Player.model');

exports.getLeagueTable = asyncHandler(async (req, res, next) => {
  const { leagueId } = req.params;
  
  // Get all finished matches for the league
  const matches = await Match.find({
    league: leagueId,
    status: 'finished'
  }).populate('homeTeam awayTeam');
  
  // Calculate standings
  const standings = await calculateStandings(matches);
  
  sendSuccess(res, 200, { table: standings }, 'League table retrieved successfully');
});

exports.getSeasonTable = asyncHandler(async (req, res, next) => {
  const { seasonId } = req.params;
  
  console.log('Getting season table for:', seasonId);
  
  try {
    // Get all finished matches for the season
    const matches = await Match.find({
      season: seasonId,
      status: 'finished'
    }).populate('homeTeam awayTeam');
    
    console.log('Found matches:', matches.length);
    
    // Calculate standings
    const standings = await calculateStandings(matches);
    
    console.log('Calculated standings:', standings.length);
    
    sendSuccess(res, 200, { table: standings }, 'Season table retrieved successfully');
  } catch (error) {
    console.error('Error in getSeasonTable:', error);
    throw error;
  }
});

// Helper function to calculate standings from matches
async function calculateStandings(matches) {
  const teamStats = {};
  
  // Initialize stats for each team
  matches.forEach(match => {
    // Skip matches with missing teams
    if (!match.homeTeam || !match.awayTeam) {
      console.log('Skipping match with missing team data:', match._id);
      return;
    }
    
    if (!teamStats[match.homeTeam._id]) {
      teamStats[match.homeTeam._id] = {
        team: match.homeTeam,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        form: []
      };
    }
    if (!teamStats[match.awayTeam._id]) {
      teamStats[match.awayTeam._id] = {
        team: match.awayTeam,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        form: []
      };
    }
  });
  
  // Calculate stats from each match
  matches.forEach(match => {
    // Skip matches with missing teams
    if (!match.homeTeam || !match.awayTeam) {
      return;
    }
    
    const homeScore = match.score?.home || 0;
    const awayScore = match.score?.away || 0;
    
    const homeTeamId = match.homeTeam._id.toString();
    const awayTeamId = match.awayTeam._id.toString();
    
    // Update played
    teamStats[homeTeamId].played++;
    teamStats[awayTeamId].played++;
    
    // Update goals
    teamStats[homeTeamId].goalsFor += homeScore;
    teamStats[homeTeamId].goalsAgainst += awayScore;
    teamStats[awayTeamId].goalsFor += awayScore;
    teamStats[awayTeamId].goalsAgainst += homeScore;
    
    // Determine result
    if (homeScore > awayScore) {
      // Home win
      teamStats[homeTeamId].won++;
      teamStats[homeTeamId].points += 3;
      teamStats[homeTeamId].form.push('W');
      teamStats[awayTeamId].lost++;
      teamStats[awayTeamId].form.push('L');
    } else if (homeScore < awayScore) {
      // Away win
      teamStats[awayTeamId].won++;
      teamStats[awayTeamId].points += 3;
      teamStats[awayTeamId].form.push('W');
      teamStats[homeTeamId].lost++;
      teamStats[homeTeamId].form.push('L');
    } else {
      // Draw
      teamStats[homeTeamId].drawn++;
      teamStats[homeTeamId].points += 1;
      teamStats[homeTeamId].form.push('D');
      teamStats[awayTeamId].drawn++;
      teamStats[awayTeamId].points += 1;
      teamStats[awayTeamId].form.push('D');
    }
  });
  
  // Calculate goal difference and convert to array
  const standings = Object.values(teamStats).map(team => {
    team.goalDifference = team.goalsFor - team.goalsAgainst;
    team.form = team.form.slice(-5); // Keep only last 5 results
    return team;
  });
  
  // Sort by points (desc), then goal difference (desc), then goals for (desc)
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
  
  // Add position
  standings.forEach((team, index) => {
    team.position = index + 1;
  });
  
  return standings;
}

exports.getTopScorers = asyncHandler(async (req, res, next) => {
  const { seasonId } = req.params;
  
  // Get all finished matches for the season with events
  const matches = await Match.find({
    season: seasonId,
    status: 'finished'
  }).populate({
    path: 'events.player',
    populate: { path: 'team' }
  });
  
  // Count goals per player
  const playerGoals = {};
  
  matches.forEach(match => {
    if (match.events && Array.isArray(match.events)) {
      match.events.forEach(event => {
        if (event.type === 'goal' && event.player) {
          const playerId = event.player._id.toString();
          
          if (!playerGoals[playerId]) {
            playerGoals[playerId] = {
              player: event.player,
              goals: 0,
              team: event.player.team
            };
          }
          playerGoals[playerId].goals++;
        }
      });
    }
  });
  
  // Convert to array and sort
  const topScorers = Object.values(playerGoals)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 20); // Top 20 scorers
  
  sendSuccess(res, 200, topScorers, 'Top scorers retrieved successfully');
});

exports.getTopAssists = asyncHandler(async (req, res, next) => {
  const { seasonId } = req.params;
  
  // Get all finished matches for the season with events
  const matches = await Match.find({
    season: seasonId,
    status: 'finished'
  }).populate({
    path: 'events.assistedBy',
    populate: { path: 'team' }
  });
  
  // Count assists per player
  const playerAssists = {};
  
  matches.forEach(match => {
    if (match.events && Array.isArray(match.events)) {
      match.events.forEach(event => {
        if (event.type === 'goal' && event.assistedBy) {
          const playerId = event.assistedBy._id.toString();
          
          if (!playerAssists[playerId]) {
            playerAssists[playerId] = {
              player: event.assistedBy,
              assists: 0,
              team: event.assistedBy.team
            };
          }
          playerAssists[playerId].assists++;
        }
      });
    }
  });
  
  // Convert to array and sort
  const topAssists = Object.values(playerAssists)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 20); // Top 20 assisters
  
  sendSuccess(res, 200, topAssists, 'Top assists retrieved successfully');
});

exports.getDisciplinaryRecords = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 200, { records: [] }, 'Disciplinary records (placeholder)');
});

exports.getTeamOverview = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 200, { overview: {} }, 'Team overview (placeholder)');
});

exports.getHeadToHead = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 200, { headToHead: {} }, 'Head to head (placeholder)');
});

exports.getPlayerOverview = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 200, { overview: {} }, 'Player overview (placeholder)');
});

exports.getMatchSummary = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 200, { summary: {} }, 'Match summary (placeholder)');
});

exports.getSeasonOverview = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 200, { overview: {} }, 'Season overview (placeholder)');
});

exports.getCleanSheets = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 200, { cleanSheets: [] }, 'Clean sheets (placeholder)');
});

exports.getAttendanceStats = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 200, { attendance: {} }, 'Attendance stats (placeholder)');
});
