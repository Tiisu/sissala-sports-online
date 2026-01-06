'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, UserPlus } from 'lucide-react';
import { teamsApi, playersApi } from '@/lib/api';

export default function TeamSquadPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, [teamId]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamRes, playersRes] = await Promise.all([
        teamsApi.getById(teamId),
        playersApi.getAll({ team: teamId }),
      ]);
      
      const teamData = teamRes.data.data?.team || teamRes.data.data;
      setTeam(teamData);
      
      // Filter players by current team
      const allPlayers = playersRes.data.data || [];
      const teamPlayers = allPlayers.filter((p: any) => 
        p.currentTeam === teamId || p.currentTeam?._id === teamId
      );
      setPlayers(teamPlayers);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByPosition = () => {
    const groups: any = {
      GK: [],
      Defenders: [],
      Midfielders: [],
      Forwards: [],
    };

    players.forEach((player) => {
      if (player.position === 'GK') {
        groups.GK.push(player);
      } else if (['CB', 'LB', 'RB'].includes(player.position)) {
        groups.Defenders.push(player);
      } else if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(player.position)) {
        groups.Midfielders.push(player);
      } else if (['LW', 'RW', 'ST', 'CF'].includes(player.position)) {
        groups.Forwards.push(player);
      }
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  const groupedPlayers = groupByPosition();

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-surface shadow-md sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/teams" className="text-text-secondary hover:text-text-primary">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="font-bold text-xl text-primary-green">
                  {team?.name} - Squad
                </h1>
                <p className="text-sm text-text-secondary">
                  {players.length} players in squad
                </p>
              </div>
            </div>
            <Link
              href={`/admin/players/create?team=${teamId}`}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Player</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Team Info */}
        <div className="bg-surface rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-6">
            {team?.logo && (
              <img src={team.logo} alt={team.name} className="w-20 h-20 rounded-lg" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-text-primary">{team?.name}</h2>
              <p className="text-text-secondary">
                Manager: {team?.manager?.name || 'Not assigned'}
              </p>
            </div>
          </div>
        </div>

        {/* Squad by Position */}
        <div className="space-y-6">
          {/* Goalkeepers */}
          <div className="bg-surface rounded-xl shadow-md p-6">
            <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              Goalkeepers ({groupedPlayers.GK.length})
            </h3>
            {groupedPlayers.GK.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedPlayers.GK.map((player: any) => (
                  <PlayerCard key={player._id} player={player} />
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">No goalkeepers</p>
            )}
          </div>

          {/* Defenders */}
          <div className="bg-surface rounded-xl shadow-md p-6">
            <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              Defenders ({groupedPlayers.Defenders.length})
            </h3>
            {groupedPlayers.Defenders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedPlayers.Defenders.map((player: any) => (
                  <PlayerCard key={player._id} player={player} />
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">No defenders</p>
            )}
          </div>

          {/* Midfielders */}
          <div className="bg-surface rounded-xl shadow-md p-6">
            <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Midfielders ({groupedPlayers.Midfielders.length})
            </h3>
            {groupedPlayers.Midfielders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedPlayers.Midfielders.map((player: any) => (
                  <PlayerCard key={player._id} player={player} />
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">No midfielders</p>
            )}
          </div>

          {/* Forwards */}
          <div className="bg-surface rounded-xl shadow-md p-6">
            <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              Forwards ({groupedPlayers.Forwards.length})
            </h3>
            {groupedPlayers.Forwards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedPlayers.Forwards.map((player: any) => (
                  <PlayerCard key={player._id} player={player} />
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">No forwards</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function PlayerCard({ player }: { player: any }) {
  return (
    <div className="bg-background-light rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center font-bold text-primary-green text-lg">
          {player.jerseyNumber}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary truncate">
            {player.firstName} {player.lastName}
          </p>
          <p className="text-sm text-text-secondary">{player.position}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="font-semibold text-text-primary">{player.statistics?.appearances || 0}</p>
          <p className="text-text-secondary">Apps</p>
        </div>
        <div>
          <p className="font-semibold text-primary-green">{player.statistics?.goals || 0}</p>
          <p className="text-text-secondary">Goals</p>
        </div>
        <div>
          <p className="font-semibold text-text-primary">{player.statistics?.assists || 0}</p>
          <p className="text-text-secondary">Assists</p>
        </div>
      </div>
      <Link
        href={`/admin/players/${player._id}/edit`}
        className="mt-3 w-full btn-secondary text-sm py-2 flex items-center justify-center gap-2"
      >
        <Edit className="w-4 h-4" />
        Edit
      </Link>
    </div>
  );
}
