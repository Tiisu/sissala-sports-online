'use client';

import MainLayout from '@/components/layout/MainLayout';
import { MapPin, Users, Calendar, Trophy, ArrowLeft, TrendingUp, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { teamsApi, statisticsApi, seasonsApi } from '@/lib/api';

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;
  
  const [team, setTeam] = useState<any>(null);
  const [squad, setSquad] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamStats, setTeamStats] = useState<any>(null);

  // Fetch team details and squad
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        
        // Fetch team details
        const teamResponse = await teamsApi.getById(teamId);
        const teamData = teamResponse.data.data?.team || teamResponse.data.data || teamResponse.data.team || null;
        setTeam(teamData);
        
        // Fetch team stats from current season standings
        try {
          const seasonsResponse = await seasonsApi.getAll();
          const seasons = seasonsResponse.data.data || [];
          const currentSeason = seasons.find((s: any) => s.isCurrent) || seasons[0];
          
          if (currentSeason) {
            const standingsResponse = await statisticsApi.getSeasonTable(currentSeason._id);
            const standings = standingsResponse.data.data?.table || [];
            const teamStanding = standings.find((s: any) => s.team?._id === teamId);
            
            if (teamStanding) {
              setTeamStats(teamStanding);
            }
          }
        } catch (error) {
          console.error('Error fetching team stats:', error);
        }
        
        // Fetch squad
        try {
          const squadResponse = await teamsApi.getSquad(teamId);
          const squadData = squadResponse.data.data?.squad || squadResponse.data.data?.players || squadResponse.data.squad || squadResponse.data.players || squadResponse.data.data || [];
          setSquad(Array.isArray(squadData) ? squadData : []);
        } catch (error) {
          console.error('Error fetching squad:', error);
          setSquad([]);
        }
      } catch (error) {
        console.error('Error fetching team:', error);
        setTeam(null);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">⚽</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading team...</h2>
            <p className="text-gray-600">Please wait</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!team) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Not Found</h2>
            <p className="text-gray-600 mb-4">The team you're looking for doesn't exist</p>
            <Link href="/teams" className="text-red-500 hover:text-red-600 font-semibold">
              ← Back to Teams
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Group squad by position
  const squadArray = Array.isArray(squad) ? squad : [];
  const squadByPosition = {
    Goalkeeper: squadArray.filter(p => p.position === 'Goalkeeper' || p.position === 'GK'),
    Defender: squadArray.filter(p => p.position === 'Defender' || p.position?.includes('B')),
    Midfielder: squadArray.filter(p => p.position === 'Midfielder' || p.position?.includes('M')),
    Forward: squadArray.filter(p => p.position === 'Forward' || p.position?.includes('W') || p.position?.includes('ST') || p.position?.includes('CF')),
  };

  const recentMatches: any[] = [];

  return (
    <MainLayout>
      {/* Hero Section with Team Banner */}
      <section className="relative bg-gradient-to-br from-[#1a2c4e] to-[#2a4a7c] text-white py-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(252,209,22,0.3),transparent)]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Back Button */}
          <Link 
            href="/teams" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Teams</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Team Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start gap-6">
                {/* Team Logo */}
                <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0 overflow-hidden">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-full h-full object-contain p-4" />
                  ) : (
                    <span className="text-7xl">🛡️</span>
                  )}
                </div>

                {/* Team Details */}
                <div className="flex-1">
                  <h1 className="text-4xl md:text-6xl font-bold mb-2">{team.name}</h1>
                  {team.nickname && (
                    <p className="text-xl text-white/90 italic mb-4">"{team.nickname}"</p>
                  )}
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    {(team.city || team.address?.city) && (
                      <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                        {team.address?.city || (typeof team.city === 'string' ? team.city : team.city?.name) || ''}
                      </span>
                    )}
                    {team.founded && (
                      <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                        Est. {team.founded}
                      </span>
                    )}
                  </div>

                  {team.description && (
                    <p className="text-white/80 leading-relaxed">
                      {team.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold mb-4">Season Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Matches Won</span>
                    <span className="text-2xl font-bold text-green-400">{teamStats?.won || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Matches Drawn</span>
                    <span className="text-2xl font-bold text-gray-400">{teamStats?.drawn || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Matches Lost</span>
                    <span className="text-2xl font-bold text-red-400">{teamStats?.lost || 0}</span>
                  </div>
                  <div className="border-t border-white/20 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Goals Scored</span>
                      <span className="text-2xl font-bold text-blue-400">{teamStats?.goalsFor || 0}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Goals Conceded</span>
                    <span className="text-2xl font-bold text-red-400">{teamStats?.goalsAgainst || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Goal Difference</span>
                    <span className="text-2xl font-bold text-yellow-400">
                      {teamStats?.goalDifference > 0 ? '+' : ''}{teamStats?.goalDifference || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Photo & Info Section */}
      {team.teamPhoto && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Team Photo</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Team Photo */}
              <div className="lg:col-span-2 relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={team.teamPhoto}
                  alt={`${team.name} Team Photo`}
                  className="w-full h-full object-cover"
                />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{team.name}</h3>
                <p className="text-white/80">2024 Season Squad</p>
                <p className="text-white/70 text-sm mt-2">Team photo with players, coaching staff, and management</p>
              </div>
            </div>

            {/* Team & Stadium Details */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stadium Info Card */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Home Ground</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">Home Ground</div>
                      <div className="text-sm text-gray-600">
                        {team.homeVenue || 
                         (typeof team.stadium === 'string' ? team.stadium : team.stadium?.name) || 
                         'TBD'}
                      </div>
                      {team.address?.city && (
                        <div className="text-sm text-gray-500">{team.address.city}</div>
                      )}
                    </div>
                  </div>
                  {(team.capacity || team.stadiumCapacity) && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Capacity</div>
                        <div className="text-sm text-gray-600">
                          {(team.capacity || team.stadiumCapacity)?.toLocaleString()} spectators
                        </div>
                      </div>
                    </div>
                  )}
                  {(team.foundedYear || team.founded || team.yearFounded) && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-900">Founded</div>
                        <div className="text-sm text-gray-600">
                          {team.foundedYear || team.founded || team.yearFounded}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {team.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <a href={`mailto:${team.email}`} className="text-sm font-semibold text-blue-600 hover:underline">
                          {team.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {team.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Phone</div>
                        <a href={`tel:${team.phone}`} className="text-sm font-semibold text-blue-600 hover:underline">
                          {team.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {team.website && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Website</div>
                        <a href={team.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">
                          {team.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Squad Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Squad</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {squadArray.map((player) => (
              <div
                key={player._id || player.id}
                className="group"
              >
                <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-default">
                  {/* Player Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-[#1a2c4e] to-[#2a4a7c]">
                    {player.photo ? (
                      <img
                        src={player.photo}
                        alt={`${player.firstName} ${player.lastName}`}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">👤</span>
                      </div>
                    )}
                    {/* Jersey Number */}
                    <div className="absolute top-3 left-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-lg font-bold text-gray-900">#{player.jerseyNumber || player.number || '?'}</span>
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-red-500 transition-colors mb-1">
                      {player.firstName} {player.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{player.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Matches & Form */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Recent Form</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Guide */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Last 5 Matches</h3>
                <div className="flex gap-2 mb-6">
                  {teamStats?.form && teamStats.form.length > 0 ? (
                    teamStats.form.slice(-5).map((result: string, index: number) => (
                      <div
                        key={index}
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                          result === 'W' ? 'bg-green-500' :
                          result === 'D' ? 'bg-gray-400' :
                          'bg-red-500'
                        }`}
                      >
                        {result}
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No recent matches</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wins:</span>
                    <span className="font-bold text-green-600">{teamStats?.won || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Draws:</span>
                    <span className="font-bold text-gray-600">{teamStats?.drawn || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Losses:</span>
                    <span className="font-bold text-red-600">{teamStats?.lost || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Matches List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {recentMatches.map((match) => (
                    <div key={match.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                            match.result === 'W' ? 'bg-green-500' :
                            match.result === 'D' ? 'bg-gray-400' :
                            'bg-red-500'
                          }`}>
                            {match.result}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{team.name} vs {match.opponent}</div>
                            <div className="text-sm text-gray-500">{match.date}</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{match.score}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Management */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1a2c4e] to-[#2a4a7c] rounded-full flex items-center justify-center text-white text-2xl mb-4">
                👤
              </div>
              <h3 className="font-bold text-gray-900 text-xl mb-1">
                {typeof team.manager === 'string' ? team.manager : team.manager?.name || 'TBD'}
              </h3>
              <p className="text-gray-600 mb-2">Head Coach</p>
              <p className="text-sm text-gray-500">Leading the team since {team.founded}</p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
