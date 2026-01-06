import axios from 'axios';
import { getApiUrl } from './utils';

/**
 * Axios instance with default configuration
 */
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Add auth token to requests if available
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // If sending FormData, let axios set the Content-Type (multipart/form-data with boundary)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

/**
 * Handle response errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * API Service functions
 */

// Authentication
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/update-profile', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/update-password', data),
  logout: () => api.post('/auth/logout'),
};

// Leagues
export const leaguesApi = {
  getAll: (params?: any) => api.get('/leagues', { params }),
  getOne: (id: string) => api.get(`/leagues/${id}`),
  getBySlug: (slug: string) => api.get(`/leagues/slug/${slug}`),
  getTeams: (id: string) => api.get(`/leagues/${id}/teams`),
  getSeasons: (id: string) => api.get(`/leagues/${id}/seasons`),
  getStandings: (id: string) => api.get(`/leagues/${id}/standings`),
};

// Seasons
export const seasonsApi = {
  getAll: (params?: any) => api.get('/seasons', { params }),
  getActive: () => api.get('/seasons/active'),
  getOne: (id: string) => api.get(`/seasons/${id}`),
  getMatches: (id: string) => api.get(`/seasons/${id}/matches`),
  getStandings: (id: string) => api.get(`/seasons/${id}/standings`),
  getTopScorers: (id: string, limit?: number) =>
    api.get(`/seasons/${id}/top-scorers`, { params: { limit } }),
  getStatistics: (id: string) => api.get(`/seasons/${id}/statistics`),
};

// Teams
export const teamsApi = {
  getAll: (params?: any) => api.get('/teams', { params }),
  getOne: (id: string) => api.get(`/teams/${id}`),
  getById: (id: string) => api.get(`/teams/${id}`),
  getBySlug: (slug: string) => api.get(`/teams/slug/${slug}`),
  getSquad: (id: string) => api.get(`/teams/${id}/squad`),
  getMatches: (id: string) => api.get(`/teams/${id}/matches`),
  getStatistics: (id: string) => api.get(`/teams/${id}/statistics`),
  getForm: (id: string) => api.get(`/teams/${id}/form`),
  create: (data: any) => api.post('/teams', data),
  update: (id: string, data: any) => api.put(`/teams/${id}`, data),
  delete: (id: string) => api.delete(`/teams/${id}`),
};

// Players
export const playersApi = {
  getAll: (params?: any) => api.get('/players', { params }),
  search: (query: string) => api.get('/players/search', { params: { q: query } }),
  getOne: (id: string) => api.get(`/players/${id}`),
  getById: (id: string) => api.get(`/players/${id}`),
  getBySlug: (slug: string) => api.get(`/players/slug/${slug}`),
  getStatistics: (id: string) => api.get(`/players/${id}/statistics`),
  getCareer: (id: string) => api.get(`/players/${id}/career`),
  getMatches: (id: string) => api.get(`/players/${id}/matches`),
  create: (data: any) => api.post('/players', data),
  update: (id: string, data: any) => api.put(`/players/${id}`, data),
  delete: (id: string) => api.delete(`/players/${id}`),
};

// Matches
export const matchesApi = {
  getAll: (params?: any) => api.get('/matches', { params }),
  getUpcoming: () => api.get('/matches/upcoming'),
  getLive: () => api.get('/matches/live'),
  getRecent: () => api.get('/matches/recent'),
  getOne: (id: string) => api.get(`/matches/${id}`),
  getById: (id: string) => api.get(`/matches/${id}`),
  getEvents: (id: string) => api.get(`/matches/${id}/events`),
  getByTeam: (teamId: string) => api.get(`/matches/team/${teamId}`),
  getByDate: (date: string) => api.get(`/matches/date/${date}`),
  create: (data: any) => api.post('/matches', data),
  update: (id: string, data: any) => api.put(`/matches/${id}`, data),
  delete: (id: string) => api.delete(`/matches/${id}`),
};

// News
export const newsApi = {
  getAll: (params?: any) => api.get('/news', { params }),
  getFeatured: () => api.get('/news/featured'),
  getByCategory: (category: string) => api.get(`/news/category/${category}`),
  getOne: (id: string) => api.get(`/news/${id}`),
  getById: (id: string) => api.get(`/news/${id}`),
  getBySlug: (slug: string) => api.get(`/news/slug/${slug}`),
  getByTeam: (teamId: string) => api.get(`/news/team/${teamId}`),
  getByPlayer: (playerId: string) => api.get(`/news/player/${playerId}`),
  search: (query: string) => api.get(`/news/search/${query}`),
  create: (data: any) => api.post('/news', data),
  update: (id: string, data: any) => api.put(`/news/${id}`, data),
  delete: (id: string) => api.delete(`/news/${id}`),
};

// Media
export const mediaApi = {
  getAll: (params?: any) => api.get('/media', { params }),
  getPhotos: () => api.get('/media/photos'),
  getVideos: () => api.get('/media/videos'),
  getGalleries: () => api.get('/media/galleries'),
  getFeatured: () => api.get('/media/featured'),
  getByCategory: (category: string) => api.get(`/media/category/${category}`),
  getOne: (id: string) => api.get(`/media/${id}`),
  getByMatch: (matchId: string) => api.get(`/media/match/${matchId}`),
  getByTeam: (teamId: string) => api.get(`/media/team/${teamId}`),
};

// Polls
export const pollsApi = {
  getAll: (params?: any) => api.get('/polls', { params }),
  getActive: () => api.get('/polls/active'),
  getOne: (id: string) => api.get(`/polls/${id}`),
  getResults: (id: string) => api.get(`/polls/${id}/results`),
  vote: (id: string, optionId: string) => api.post(`/polls/${id}/vote`, { optionId }),
  getByMatch: (matchId: string) => api.get(`/polls/match/${matchId}`),
};

// Predictions
export const predictionsApi = {
  getMy: () => api.get('/predictions'),
  getByMatch: (matchId: string) => api.get(`/predictions/match/${matchId}`),
  getMyPrediction: (matchId: string) => api.get(`/predictions/match/${matchId}/my-prediction`),
  create: (data: any) => api.post('/predictions', data),
  update: (id: string, data: any) => api.put(`/predictions/${id}`, data),
  delete: (id: string) => api.delete(`/predictions/${id}`),
  getLeaderboard: (seasonId: string) => api.get(`/predictions/leaderboard/season/${seasonId}`),
  getUserStats: (userId: string) => api.get(`/predictions/user/${userId}/stats`),
};

// Venues
export const venuesApi = {
  getAll: (params?: any) => api.get('/venues', { params }),
  getOne: (id: string) => api.get(`/venues/${id}`),
  getById: (id: string) => api.get(`/venues/${id}`),
};

// Statistics
export const statisticsApi = {
  getLeagueTable: (leagueId: string) => api.get(`/statistics/league/${leagueId}/table`),
  getSeasonTable: (seasonId: string) => api.get(`/statistics/season/${seasonId}/table`),
  getTopScorers: (seasonId: string) => api.get(`/statistics/season/${seasonId}/top-scorers`),
  getTopAssists: (seasonId: string) => api.get(`/statistics/season/${seasonId}/top-assists`),
  getDisciplinary: (seasonId: string) => api.get(`/statistics/season/${seasonId}/disciplinary`),
  getTeamOverview: (teamId: string) => api.get(`/statistics/team/${teamId}/overview`),
  getHeadToHead: (teamId: string, opponentId: string) =>
    api.get(`/statistics/team/${teamId}/head-to-head/${opponentId}`),
  getPlayerOverview: (playerId: string) => api.get(`/statistics/player/${playerId}/overview`),
  getMatchSummary: (matchId: string) => api.get(`/statistics/match/${matchId}/summary`),
  getSeasonOverview: (seasonId: string) => api.get(`/statistics/season/${seasonId}/overview`),
};
