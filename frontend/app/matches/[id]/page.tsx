'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Calendar, MapPin, Users, Clock, TrendingUp, 
  CircleDot, ArrowRight, Trophy, Target, Activity,
  Play, Pause, Flag, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { matchesApi, statisticsApi } from '@/lib/api';

interface Team {
  _id: string;
  name: string;
  logo?: string;
}

interface Match {
  _id: string;
  homeTeam: Team;
  awayTeam: Team;
  season: {
    _id: string;
    name: string;
  };
  venue: {
    _id: string;
    name: string;
    location: string;
  };
  matchDate: string;
  status: string;
  homeScore: number;
  awayScore: number;
  halfTimeScore?: {
    home: number;
    away: number;
  };
  attendance?: number;
  weather?: string;
}

interface MatchEvent {
  _id: string;
  eventType: string;
  team: string;
  player: {
    _id: string;
    displayName: string;
  };
  assistedBy?: {
    _id: string;
    displayName: string;
  };
  minute: number;
  additionalInfo?: string;
}

interface MatchStats {
  homeTeam: {
    possession: number;
    shots: number;
    shotsOnTarget: number;
    corners: number;
    fouls: number;
    yellowCards: number;
    redCards: number;
  };
  awayTeam: {
    possession: number;
    shots: number;
    shotsOnTarget: number;
    corners: number;
    fouls: number;
    yellowCards: number;
    redCards: number;
  };
}

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params?.id as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [stats, setStats] = useState<MatchStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'stats'>('overview');

  useEffect(() => {
    if (matchId) {
      fetchMatchDetails();
      fetchMatchEvents();
      fetchMatchStats();
    }
  }, [matchId]);

  const fetchMatchDetails = async () => {
    try {
      setLoading(true);
      const response = await matchesApi.getOne(matchId);
      setMatch(response.data.data);
    } catch (error) {
      console.error('Error fetching match details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchEvents = async () => {
    try {
      const response = await matchesApi.getEvents(matchId);
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching match events:', error);
    }
  };

  const fetchMatchStats = async () => {
    try {
      const response = await statisticsApi.getMatchSummary(matchId);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching match stats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      scheduled: { label: 'Scheduled', className: 'bg-accent-blue text-white' },
      live: { label: 'LIVE', className: 'bg-status-live text-white animate-pulse' },
      halftime: { label: 'Half Time', className: 'bg-accent-orange text-white' },
      finished: { label: 'Full Time', className: 'bg-text-secondary text-white' },
      postponed: { label: 'Postponed', className: 'bg-status-warning text-background-dark' },
      cancelled: { label: 'Cancelled', className: 'bg-status-error text-white' },
    };
    
    const badge = badges[status] || badges.scheduled;
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-bold ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return <Target className="w-5 h-5 text-primary-green" />;
      case 'yellow-card':
        return <div className="w-4 h-5 bg-primary-yellow rounded"></div>;
      case 'red-card':
        return <div className="w-4 h-5 bg-status-error rounded"></div>;
      case 'substitution':
        return <ArrowRight className="w-5 h-5 text-accent-blue" />;
      default:
        return <CircleDot className="w-5 h-5 text-text-secondary" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'events', label: 'Events', icon: Flag },
    { id: 'stats', label: 'Statistics', icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-status-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Match Not Found</h2>
          <p className="text-text-secondary mb-6">The match you're looking for doesn't exist.</p>
          <Link href="/matches" className="btn-primary">
            Back to Matches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Match Header */}
      <div className="bg-gradient-primary text-white">
        <div className="container-custom py-8">
          {/* Season & Status */}
          <div className="flex items-center justify-between mb-6">
            <Link 
              href={`/seasons/${match.season._id}`}
              className="text-sm opacity-80 hover:opacity-100 transition-opacity"
            >
              {match.season.name}
            </Link>
            {getStatusBadge(match.status)}
          </div>

          {/* Teams & Score */}
          <div className="grid grid-cols-3 gap-8 items-center">
            {/* Home Team */}
            <div className="text-center">
              <Link 
                href={`/teams/${match.homeTeam._id}`}
                className="hover:opacity-80 transition-opacity"
              >
                {match.homeTeam.logo ? (
                  <img
                    src={match.homeTeam.logo}
                    alt={match.homeTeam.name}
                    className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
                    {match.homeTeam.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <h2 className="text-xl md:text-2xl font-bold">{match.homeTeam.name}</h2>
              </Link>
            </div>

            {/* Score */}
            <div className="text-center">
              {match.status === 'scheduled' ? (
                <div>
                  <div className="text-5xl md:text-6xl font-bold mb-2">VS</div>
                  <div className="text-lg opacity-90">{formatTime(match.matchDate)}</div>
                </div>
              ) : (
                <div>
                  <div className="text-6xl md:text-7xl font-bold mb-2">
                    {match.homeScore} - {match.awayScore}
                  </div>
                  {match.halfTimeScore && (
                    <div className="text-sm opacity-75">
                      HT: {match.halfTimeScore.home} - {match.halfTimeScore.away}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center">
              <Link 
                href={`/teams/${match.awayTeam._id}`}
                className="hover:opacity-80 transition-opacity"
              >
                {match.awayTeam.logo ? (
                  <img
                    src={match.awayTeam.logo}
                    alt={match.awayTeam.name}
                    className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
                    {match.awayTeam.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <h2 className="text-xl md:text-2xl font-bold">{match.awayTeam.name}</h2>
              </Link>
            </div>
          </div>

          {/* Match Info */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(match.matchDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(match.matchDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{match.venue.name}</span>
            </div>
            {match.attendance && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{match.attendance.toLocaleString()} attendance</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface border-b border-background-light sticky top-0 z-40">
        <div className="container-custom">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-4 ${
                    activeTab === tab.id
                      ? 'border-primary-green text-primary-green'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              {stats && (
                <div className="bg-surface rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-text-primary mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    {/* Possession */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold">{stats.homeTeam.possession}%</span>
                        <span className="text-text-secondary">Possession</span>
                        <span className="font-semibold">{stats.awayTeam.possession}%</span>
                      </div>
                      <div className="h-2 bg-background-light rounded-full overflow-hidden flex">
                        <div
                          className="bg-primary-green"
                          style={{ width: `${stats.homeTeam.possession}%` }}
                        ></div>
                        <div
                          className="bg-accent-blue"
                          style={{ width: `${stats.awayTeam.possession}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Shots */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold">{stats.homeTeam.shots}</span>
                        <span className="text-text-secondary">Shots</span>
                        <span className="font-semibold">{stats.awayTeam.shots}</span>
                      </div>
                      <div className="h-2 bg-background-light rounded-full overflow-hidden flex">
                        <div
                          className="bg-primary-green"
                          style={{ width: `${(stats.homeTeam.shots / (stats.homeTeam.shots + stats.awayTeam.shots)) * 100}%` }}
                        ></div>
                        <div className="bg-accent-blue flex-1"></div>
                      </div>
                    </div>

                    {/* Shots on Target */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold">{stats.homeTeam.shotsOnTarget}</span>
                        <span className="text-text-secondary">Shots on Target</span>
                        <span className="font-semibold">{stats.awayTeam.shotsOnTarget}</span>
                      </div>
                      <div className="h-2 bg-background-light rounded-full overflow-hidden flex">
                        <div
                          className="bg-primary-green"
                          style={{ width: `${(stats.homeTeam.shotsOnTarget / (stats.homeTeam.shotsOnTarget + stats.awayTeam.shotsOnTarget)) * 100}%` }}
                        ></div>
                        <div className="bg-accent-blue flex-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Events */}
              {events.length > 0 && (
                <div className="bg-surface rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-text-primary mb-4">Recent Events</h3>
                  <div className="space-y-3">
                    {events.slice(0, 5).map((event) => (
                      <div
                        key={event._id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-background-light"
                      >
                        <div className="flex-shrink-0 w-12 text-center">
                          <span className="font-bold text-primary-green">{event.minute}'</span>
                        </div>
                        <div className="flex-shrink-0">{getEventIcon(event.eventType)}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-text-primary">
                            {event.player.displayName}
                          </p>
                          {event.assistedBy && (
                            <p className="text-xs text-text-secondary">
                              Assist: {event.assistedBy.displayName}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Venue Info */}
              <div className="bg-surface rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">Venue</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-text-secondary">Stadium</p>
                    <p className="font-semibold text-text-primary">{match.venue.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Location</p>
                    <p className="font-semibold text-text-primary">{match.venue.location}</p>
                  </div>
                  {match.attendance && (
                    <div>
                      <p className="text-sm text-text-secondary">Attendance</p>
                      <p className="font-semibold text-text-primary">
                        {match.attendance.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Officials (Placeholder) */}
              <div className="bg-surface rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">Match Officials</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Referee:</span>
                    <span className="font-semibold">TBD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Assistant 1:</span>
                    <span className="font-semibold">TBD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Assistant 2:</span>
                    <span className="font-semibold">TBD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-surface rounded-xl shadow-md p-6">
            <h3 className="text-2xl font-bold text-text-primary mb-6">Match Events</h3>
            {events.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <Flag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No events recorded for this match yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      event.team === match.homeTeam._id
                        ? 'bg-primary-green/5 border-l-4 border-primary-green'
                        : 'bg-accent-blue/5 border-r-4 border-accent-blue'
                    }`}
                  >
                    <div className="flex-shrink-0 w-16 text-center">
                      <span className="font-bold text-2xl text-text-primary">{event.minute}'</span>
                    </div>
                    <div className="flex-shrink-0">{getEventIcon(event.eventType)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg text-text-primary">
                          {event.eventType.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="font-semibold text-text-primary">
                        {event.player.displayName}
                      </p>
                      {event.assistedBy && (
                        <p className="text-sm text-text-secondary">
                          Assisted by: {event.assistedBy.displayName}
                        </p>
                      )}
                      {event.additionalInfo && (
                        <p className="text-sm text-text-secondary mt-1">{event.additionalInfo}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="bg-surface rounded-xl shadow-md p-6">
            <h3 className="text-2xl font-bold text-text-primary mb-6">Match Statistics</h3>
            {!stats ? (
              <div className="text-center py-12 text-text-secondary">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Statistics not available for this match</p>
              </div>
            ) : (
              <div className="space-y-6">
                <StatBar
                  label="Possession"
                  homeValue={stats.homeTeam.possession}
                  awayValue={stats.awayTeam.possession}
                  isPercentage
                />
                <StatBar
                  label="Shots"
                  homeValue={stats.homeTeam.shots}
                  awayValue={stats.awayTeam.shots}
                />
                <StatBar
                  label="Shots on Target"
                  homeValue={stats.homeTeam.shotsOnTarget}
                  awayValue={stats.awayTeam.shotsOnTarget}
                />
                <StatBar
                  label="Corners"
                  homeValue={stats.homeTeam.corners}
                  awayValue={stats.awayTeam.corners}
                />
                <StatBar
                  label="Fouls"
                  homeValue={stats.homeTeam.fouls}
                  awayValue={stats.awayTeam.fouls}
                />
                <StatBar
                  label="Yellow Cards"
                  homeValue={stats.homeTeam.yellowCards}
                  awayValue={stats.awayTeam.yellowCards}
                />
                <StatBar
                  label="Red Cards"
                  homeValue={stats.homeTeam.redCards}
                  awayValue={stats.awayTeam.redCards}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Bar Component
function StatBar({
  label,
  homeValue,
  awayValue,
  isPercentage = false,
}: {
  label: string;
  homeValue: number;
  awayValue: number;
  isPercentage?: boolean;
}) {
  const total = homeValue + awayValue;
  const homePercentage = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPercentage = total > 0 ? (awayValue / total) * 100 : 50;

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-bold text-text-primary">
          {homeValue}{isPercentage ? '%' : ''}
        </span>
        <span className="text-text-secondary font-medium">{label}</span>
        <span className="font-bold text-text-primary">
          {awayValue}{isPercentage ? '%' : ''}
        </span>
      </div>
      <div className="h-3 bg-background-light rounded-full overflow-hidden flex">
        <div
          className="bg-primary-green transition-all"
          style={{ width: `${homePercentage}%` }}
        ></div>
        <div
          className="bg-accent-blue transition-all"
          style={{ width: `${awayPercentage}%` }}
        ></div>
      </div>
    </div>
  );
}
