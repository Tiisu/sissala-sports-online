'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Plus, Edit, Trash2, Search, ArrowLeft, Filter } from 'lucide-react';
import { playersApi, teamsApi } from '@/lib/api';

export default function AdminPlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
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
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [playersRes, teamsRes] = await Promise.all([
        playersApi.getAll(),
        teamsApi.getAll(),
      ]);
      setPlayers(playersRes.data.data || []);
      setTeams(teamsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`⚠️ Are you sure you want to delete "${name}"?\n\nThis will permanently remove:\n• Player profile\n• Career statistics\n• Match history\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      await playersApi.delete(id);
      alert(`✅ ${name} has been deleted successfully!`);
      fetchData();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`❌ Failed to delete player: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  const getPositionLabel = (pos: string) => {
    const positions: any = {
      GK: 'Goalkeeper',
      CB: 'Center Back',
      LB: 'Left Back',
      RB: 'Right Back',
      CDM: 'Defensive Mid',
      CM: 'Central Mid',
      CAM: 'Attacking Mid',
      LM: 'Left Mid',
      RM: 'Right Mid',
      LW: 'Left Wing',
      RW: 'Right Wing',
      ST: 'Striker',
      CF: 'Center Forward',
    };
    return positions[pos] || pos;
  };

  const getPositionColor = (pos: string) => {
    if (pos === 'GK') return 'bg-yellow-100 text-yellow-700';
    if (['CB', 'LB', 'RB'].includes(pos)) return 'bg-blue-100 text-blue-700';
    if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos)) return 'bg-green-100 text-green-700';
    return 'bg-red-100 text-red-700';
  };

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = !filterTeam || player.currentTeam?._id === filterTeam;
    const matchesPosition = !filterPosition || player.position === filterPosition;
    return matchesSearch && matchesTeam && matchesPosition;
  });

  const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-surface shadow-md sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-text-secondary hover:text-text-primary">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="font-bold text-xl text-primary-green">Manage Players</h1>
                <p className="text-sm text-text-secondary">View and manage all players</p>
              </div>
            </div>
            <Link
              href="/admin/players/create"
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Player</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Filters */}
        <div className="mb-6 bg-surface rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-text-secondary" />
            <h3 className="font-semibold text-text-primary">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
              />
            </div>

            {/* Team Filter */}
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
            >
              <option value="">All Teams</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>

            {/* Position Filter */}
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
            >
              <option value="">All Positions</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {getPositionLabel(pos)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Players Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary text-lg">No players found</p>
          </div>
        ) : (
          <div className="bg-surface rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-light border-b border-text-tertiary">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      Player
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      Team
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      Position
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-text-primary">
                      #
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-text-primary">
                      Apps
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-text-primary">
                      Goals
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-text-primary">
                      Assists
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-light">
                  {filteredPlayers.map((player) => (
                    <tr key={player._id} className="hover:bg-background-light transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-background-light flex items-center justify-center overflow-hidden">
                            {player.photo ? (
                              <img
                                src={player.photo}
                                alt={`${player.firstName} ${player.lastName}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-lg">👤</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary">
                              {player.firstName} {player.lastName}
                            </p>
                            <p className="text-sm text-text-secondary">{player.nationality}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-text-primary">
                          {player.currentTeam?.name || 
                           teams.find(t => t._id === player.currentTeam)?.name || 
                           'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPositionColor(
                            player.position
                          )}`}
                        >
                          {player.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-text-primary">
                          {player.jerseyNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-text-primary">
                          {player.statistics?.appearances || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-primary-green">
                          {player.statistics?.goals || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-text-primary">
                          {player.statistics?.assists || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/players/${player._id}/edit`}
                            className="p-2 rounded-lg text-primary-green hover:bg-green-50 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          {user.role === 'admin' && (
                            <button
                              onClick={() =>
                                handleDelete(
                                  player._id,
                                  `${player.firstName} ${player.lastName}`
                                )
                              }
                              className="p-2 rounded-lg text-status-error hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 bg-surface rounded-xl shadow-md p-6">
          <h3 className="font-bold text-lg text-text-primary mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-green">{players.length}</p>
              <p className="text-sm text-text-secondary">Total Players</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-green">
                {players.filter((p) => p.isActive).length}
              </p>
              <p className="text-sm text-text-secondary">Active Players</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-green">
                {players.reduce((sum, p) => sum + (p.statistics?.goals || 0), 0)}
              </p>
              <p className="text-sm text-text-secondary">Total Goals</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-green">
                {players.reduce((sum, p) => sum + (p.statistics?.assists || 0), 0)}
              </p>
              <p className="text-sm text-text-secondary">Total Assists</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
