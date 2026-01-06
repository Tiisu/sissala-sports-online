'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Plus, Edit, Trash2, Search, ArrowLeft, Users } from 'lucide-react';
import { teamsApi } from '@/lib/api';

export default function AdminTeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
    fetchTeams();
  }, [router]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamsApi.getAll();
      setTeams(response.data.data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`⚠️ Are you sure you want to delete "${name}"?\n\nThis will permanently remove:\n• Team information\n• All associated data\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      await teamsApi.delete(id);
      alert(`✅ ${name} has been deleted successfully!`);
      fetchTeams();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`❌ Failed to delete team: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <h1 className="font-bold text-xl text-primary-green">Manage Teams</h1>
                <p className="text-sm text-text-secondary">View and manage all teams</p>
              </div>
            </div>
            <Link
              href="/admin/teams/create"
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Team</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
            />
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary text-lg">No teams found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div
                key={team._id}
                className="bg-surface rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Team Header */}
                <div className="p-6 border-b border-background-light">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-background-light flex-shrink-0">
                      {team.logo ? (
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          ⚽
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-text-primary truncate mb-1">
                        {team.name}
                      </h3>
                      <p className="text-sm text-text-secondary">{team.city}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {team.colors?.map((color: string, index: number) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded border border-text-tertiary"
                            style={{ backgroundColor: color }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Stats */}
                <div className="p-4 bg-background-light">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary-green">
                        {team.statistics?.played || 0}
                      </p>
                      <p className="text-xs text-text-secondary">Matches</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary-green">
                        {team.statistics?.points || 0}
                      </p>
                      <p className="text-xs text-text-secondary">Points</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 flex items-center gap-2">
                  <Link
                    href={`/admin/teams/${team._id}/edit`}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm py-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <Link
                    href={`/admin/teams/${team._id}/squad`}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm py-2"
                  >
                    <Users className="w-4 h-4" />
                    Squad
                  </Link>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(team._id, team.name)}
                      className="px-4 py-2 rounded-lg border border-status-error text-status-error hover:bg-status-error hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 bg-surface rounded-xl shadow-md p-6">
          <h3 className="font-bold text-lg text-text-primary mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-green">{teams.length}</p>
              <p className="text-sm text-text-secondary">Total Teams</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-green">
                {teams.filter((t) => t.isActive).length}
              </p>
              <p className="text-sm text-text-secondary">Active Teams</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-green">
                {teams.reduce((sum, t) => sum + (t.statistics?.played || 0), 0)}
              </p>
              <p className="text-sm text-text-secondary">Total Matches</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-green">
                {teams.reduce((sum, t) => sum + (t.statistics?.goalsFor || 0), 0)}
              </p>
              <p className="text-sm text-text-secondary">Total Goals</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
