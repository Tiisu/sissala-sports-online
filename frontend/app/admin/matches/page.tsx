'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Plus, Edit, Trash2, Search, ArrowLeft, Filter, Clock } from 'lucide-react';
import { matchesApi } from '@/lib/api';
import { format } from 'date-fns';

export default function AdminMatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'editor') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    fetchMatches();
  }, [router]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await matchesApi.getAll();
      setMatches(response.data.data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      scheduled: 'bg-blue-100 text-blue-700',
      live: 'bg-status-live text-white',
      halftime: 'bg-orange-100 text-orange-700',
      finished: 'bg-gray-100 text-gray-700',
      postponed: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredMatches = matches.filter((match) => {
    // Handle both object and string IDs for teams
    const homeTeamName = typeof match.homeTeam === 'object' ? match.homeTeam?.name : '';
    const awayTeamName = typeof match.awayTeam === 'object' ? match.awayTeam?.name : '';
    
    const matchesSearch =
      !searchQuery ||
      (homeTeamName && homeTeamName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (awayTeamName && awayTeamName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = !filterStatus || match.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <header className="bg-surface shadow-md sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-text-secondary hover:text-text-primary">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="font-bold text-xl text-primary-green">Manage Matches</h1>
                <p className="text-sm text-text-secondary">View and manage all matches</p>
              </div>
            </div>
            <Link href="/admin/matches/create" className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Match</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        {/* Filters */}
        <div className="mb-6 bg-surface rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-text-secondary" />
            <h3 className="font-semibold text-text-primary">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                placeholder="Search matches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="finished">Finished</option>
              <option value="postponed">Postponed</option>
            </select>
          </div>
        </div>

        {/* Matches List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary text-lg">No matches found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <div
                key={match._id}
                className="bg-surface rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Match Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(match.status)}`}>
                          {match.status.toUpperCase()}
                        </span>
                        <span className="text-sm text-text-secondary flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {match.matchDate ? format(new Date(match.matchDate), 'MMM dd, yyyy') : 'TBD'}
                        </span>
                        <span className="text-sm text-text-secondary flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {match.kickoffTime || 'TBD'}
                        </span>
                      </div>

                      {/* Teams */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-background-light flex-shrink-0">
                            {match.homeTeam?.logo ? (
                              <img src={match.homeTeam.logo} alt={match.homeTeam?.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">⚽</div>
                            )}
                          </div>
                          <p className="font-semibold text-text-primary">{match.homeTeam?.name || 'TBD'}</p>
                        </div>

                        <div className="text-center">
                          {match.status === 'finished' || match.status === 'live' ? (
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-primary-green">{match.score?.home || 0}</span>
                              <span className="text-text-secondary">-</span>
                              <span className="text-2xl font-bold text-primary-green">{match.score?.away || 0}</span>
                            </div>
                          ) : (
                            <span className="text-text-secondary font-medium">VS</span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <p className="font-semibold text-text-primary text-right">{match.awayTeam?.name || 'TBD'}</p>
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-background-light flex-shrink-0">
                            {match.awayTeam?.logo ? (
                              <img src={match.awayTeam.logo} alt={match.awayTeam?.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">⚽</div>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-text-secondary mt-3">
                        📍 {match.venue?.name || 'Venue TBD'} • Round {match.round || 'N/A'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/matches/${match._id}/edit`}
                        className="px-4 py-2 rounded-lg bg-primary-green text-white hover:bg-primary-green/90 transition-colors flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            const matchName = `${match.homeTeam?.name} vs ${match.awayTeam?.name}`;
                            if (confirm(`⚠️ Are you sure you want to delete this match?\n\n${matchName}\nDate: ${match.matchDate ? new Date(match.matchDate).toLocaleDateString() : 'TBD'}\n\nThis action cannot be undone!`)) {
                              matchesApi.delete(match._id)
                                .then(() => {
                                  alert('✅ Match deleted successfully!');
                                  fetchMatches();
                                })
                                .catch((error: any) => {
                                  alert(`❌ Failed to delete match: ${error.response?.data?.message || 'Unknown error'}`);
                                });
                            }
                          }}
                          className="px-4 py-2 rounded-lg border border-status-error text-status-error hover:bg-status-error hover:text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 bg-surface rounded-xl shadow-md p-6">
          <h3 className="font-bold text-lg text-text-primary mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-green">{matches.length}</p>
              <p className="text-sm text-text-secondary">Total Matches</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {matches.filter((m) => m.status === 'scheduled').length}
              </p>
              <p className="text-sm text-text-secondary">Scheduled</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-status-live">
                {matches.filter((m) => m.status === 'live').length}
              </p>
              <p className="text-sm text-text-secondary">Live</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-600">
                {matches.filter((m) => m.status === 'finished').length}
              </p>
              <p className="text-sm text-text-secondary">Finished</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-green">
                {matches.reduce((sum, m) => sum + (m.score?.home || 0) + (m.score?.away || 0), 0)}
              </p>
              <p className="text-sm text-text-secondary">Total Goals</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
