'use client';

import { useState, useEffect } from 'react';
import { Trophy, Target, Users, TrendingUp, Award, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { statisticsApi, seasonsApi } from '@/lib/api';

interface Season {
  _id: string;
  name: string;
  league: {
    _id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  status: string;
}

interface TopScorer {
  player: {
    _id: string;
    displayName: string;
    photo?: string;
    team: {
      _id: string;
      name: string;
      logo?: string;
    };
  };
  goals: number;
  assists: number;
  appearances: number;
}

interface TableEntry {
  team: {
    _id: string;
    name: string;
    logo?: string;
  };
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[];
}

interface DisciplinaryRecord {
  player: {
    _id: string;
    displayName: string;
    team: {
      name: string;
    };
  };
  yellowCards: number;
  redCards: number;
}

export default function StatisticsPage() {
  // Mock data
  const mockSeasons: Season[] = [
    {
      _id: '1',
      name: '2024 Season',
      league: { _id: '1', name: 'Sissala Premier League' },
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active'
    },
    {
      _id: '2',
      name: '2023 Season',
      league: { _id: '1', name: 'Sissala Premier League' },
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      status: 'completed'
    }
  ];

  const mockTable: TableEntry[] = [
    {
      team: { _id: '1', name: 'Sissala United FC', logo: '' },
      position: 1,
      played: 15,
      won: 11,
      drawn: 3,
      lost: 1,
      goalsFor: 32,
      goalsAgainst: 10,
      goalDifference: 22,
      points: 36,
      form: ['W', 'W', 'D', 'W', 'W']
    },
    {
      team: { _id: '2', name: 'Tumu City FC', logo: '' },
      position: 2,
      played: 15,
      won: 10,
      drawn: 2,
      lost: 3,
      goalsFor: 28,
      goalsAgainst: 15,
      goalDifference: 13,
      points: 32,
      form: ['W', 'L', 'W', 'W', 'D']
    },
    {
      team: { _id: '3', name: 'Warriors FC', logo: '' },
      position: 3,
      played: 15,
      won: 8,
      drawn: 4,
      lost: 3,
      goalsFor: 25,
      goalsAgainst: 18,
      goalDifference: 7,
      points: 28,
      form: ['D', 'W', 'W', 'L', 'D']
    },
    {
      team: { _id: '4', name: 'Lions FC', logo: '' },
      position: 4,
      played: 15,
      won: 7,
      drawn: 5,
      lost: 3,
      goalsFor: 22,
      goalsAgainst: 16,
      goalDifference: 6,
      points: 26,
      form: ['D', 'W', 'D', 'W', 'L']
    },
    {
      team: { _id: '5', name: 'Eagles FC', logo: '' },
      position: 5,
      played: 15,
      won: 6,
      drawn: 4,
      lost: 5,
      goalsFor: 20,
      goalsAgainst: 20,
      goalDifference: 0,
      points: 22,
      form: ['L', 'D', 'W', 'L', 'W']
    },
    {
      team: { _id: '6', name: 'Thunder FC', logo: '' },
      position: 6,
      played: 15,
      won: 5,
      drawn: 5,
      lost: 5,
      goalsFor: 18,
      goalsAgainst: 19,
      goalDifference: -1,
      points: 20,
      form: ['D', 'L', 'D', 'W', 'L']
    },
    {
      team: { _id: '7', name: 'Phoenix FC', logo: '' },
      position: 7,
      played: 15,
      won: 4,
      drawn: 6,
      lost: 5,
      goalsFor: 16,
      goalsAgainst: 20,
      goalDifference: -4,
      points: 18,
      form: ['D', 'D', 'L', 'D', 'W']
    },
    {
      team: { _id: '8', name: 'Sharks FC', logo: '' },
      position: 8,
      played: 15,
      won: 2,
      drawn: 4,
      lost: 9,
      goalsFor: 12,
      goalsAgainst: 30,
      goalDifference: -18,
      points: 10,
      form: ['L', 'L', 'D', 'L', 'L']
    }
  ];

  const mockScorers: TopScorer[] = [
    {
      player: {
        _id: '1',
        displayName: 'Kwame Mensah',
        photo: '',
        team: { _id: '1', name: 'Sissala United FC', logo: '' }
      },
      goals: 18,
      assists: 5,
      appearances: 15
    },
    {
      player: {
        _id: '2',
        displayName: 'Yaw Boateng',
        photo: '',
        team: { _id: '2', name: 'Tumu City FC', logo: '' }
      },
      goals: 14,
      assists: 7,
      appearances: 15
    },
    {
      player: {
        _id: '3',
        displayName: 'Kofi Owusu',
        photo: '',
        team: { _id: '3', name: 'Warriors FC', logo: '' }
      },
      goals: 12,
      assists: 4,
      appearances: 14
    },
    {
      player: {
        _id: '4',
        displayName: 'Abdul Rahman',
        photo: '',
        team: { _id: '4', name: 'Lions FC', logo: '' }
      },
      goals: 10,
      assists: 6,
      appearances: 15
    },
    {
      player: {
        _id: '5',
        displayName: 'Samuel Adjei',
        photo: '',
        team: { _id: '1', name: 'Sissala United FC', logo: '' }
      },
      goals: 9,
      assists: 3,
      appearances: 15
    }
  ];

  const mockAssists: TopScorer[] = [
    {
      player: {
        _id: '6',
        displayName: 'Ibrahim Mohammed',
        photo: '',
        team: { _id: '2', name: 'Tumu City FC', logo: '' }
      },
      goals: 5,
      assists: 11,
      appearances: 15
    },
    {
      player: {
        _id: '7',
        displayName: 'Francis Addo',
        photo: '',
        team: { _id: '1', name: 'Sissala United FC', logo: '' }
      },
      goals: 6,
      assists: 9,
      appearances: 15
    },
    {
      player: {
        _id: '2',
        displayName: 'Yaw Boateng',
        photo: '',
        team: { _id: '2', name: 'Tumu City FC', logo: '' }
      },
      goals: 14,
      assists: 7,
      appearances: 15
    },
    {
      player: {
        _id: '4',
        displayName: 'Abdul Rahman',
        photo: '',
        team: { _id: '4', name: 'Lions FC', logo: '' }
      },
      goals: 10,
      assists: 6,
      appearances: 15
    },
    {
      player: {
        _id: '1',
        displayName: 'Kwame Mensah',
        photo: '',
        team: { _id: '1', name: 'Sissala United FC', logo: '' }
      },
      goals: 18,
      assists: 5,
      appearances: 15
    }
  ];

  const mockDisciplinary: DisciplinaryRecord[] = [
    {
      player: {
        _id: '8',
        displayName: 'Richard Mensah',
        team: { name: 'Thunder FC' }
      },
      yellowCards: 8,
      redCards: 2
    },
    {
      player: {
        _id: '9',
        displayName: 'John Acheampong',
        team: { name: 'Warriors FC' }
      },
      yellowCards: 7,
      redCards: 1
    },
    {
      player: {
        _id: '10',
        displayName: 'Daniel Oppong',
        team: { name: 'Phoenix FC' }
      },
      yellowCards: 6,
      redCards: 1
    },
    {
      player: {
        _id: '11',
        displayName: 'Eric Asante',
        team: { name: 'Lions FC' }
      },
      yellowCards: 6,
      redCards: 0
    },
    {
      player: {
        _id: '12',
        displayName: 'Peter Mensah',
        team: { name: 'Eagles FC' }
      },
      yellowCards: 5,
      redCards: 1
    }
  ];

  const [seasons, setSeasons] = useState<Season[]>(mockSeasons);
  const [selectedSeason, setSelectedSeason] = useState<string>('1');
  const [activeTab, setActiveTab] = useState<'table' | 'scorers' | 'assists' | 'discipline'>('table');
  const [loading, setLoading] = useState(false);

  // Data states
  const [table, setTable] = useState<TableEntry[]>(mockTable);
  const [topScorers, setTopScorers] = useState<TopScorer[]>(mockScorers);
  const [topAssists, setTopAssists] = useState<TopScorer[]>(mockAssists);
  const [disciplinary, setDisciplinary] = useState<DisciplinaryRecord[]>(mockDisciplinary);

  // Commented out API calls - using mock data
  // useEffect(() => {
  //   fetchSeasons();
  // }, []);

  // useEffect(() => {
  //   if (selectedSeason) {
  //     fetchStatistics();
  //   }
  // }, [selectedSeason, activeTab]);

  // const fetchSeasons = async () => {
  //   try {
  //     const response = await seasonsApi.getAll();
  //     const seasonsList = response.data.data || [];
  //     setSeasons(seasonsList);
      
  //     // Select active season or most recent
  //     const activeSeason = seasonsList.find((s: Season) => s.status === 'active');
  //     if (activeSeason) {
  //       setSelectedSeason(activeSeason._id);
  //     } else if (seasonsList.length > 0) {
  //       setSelectedSeason(seasonsList[0]._id);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching seasons:', error);
  //   }
  // };

  // const fetchStatistics = async () => {
  //   if (!selectedSeason) return;

  //   try {
  //     setLoading(true);

  //     switch (activeTab) {
  //       case 'table':
  //         const tableResponse = await statisticsApi.getSeasonTable(selectedSeason);
  //         setTable(tableResponse.data.data || []);
  //         break;

  //       case 'scorers':
  //         const scorersResponse = await statisticsApi.getTopScorers(selectedSeason);
  //         setTopScorers(scorersResponse.data.data || []);
  //         break;

  //       case 'assists':
  //         const assistsResponse = await statisticsApi.getTopAssists(selectedSeason);
  //         setTopAssists(assistsResponse.data.data || []);
  //         break;

  //       case 'discipline':
  //         const disciplineResponse = await statisticsApi.getDisciplinary(selectedSeason);
  //         setDisciplinary(disciplineResponse.data.data || []);
  //         break;
  //     }
  //   } catch (error) {
  //     console.error('Error fetching statistics:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const tabs = [
    { id: 'table', label: 'League Table', icon: Trophy },
    { id: 'scorers', label: 'Top Scorers', icon: Target },
    { id: 'assists', label: 'Top Assists', icon: Users },
    { id: 'discipline', label: 'Discipline', icon: AlertCircle },
  ];

  const getFormBadge = (result: string) => {
    const styles: Record<string, string> = {
      W: 'bg-status-success text-white',
      D: 'bg-text-secondary text-white',
      L: 'bg-status-error text-white',
    };
    return styles[result] || 'bg-text-tertiary text-white';
  };

  const getPositionColor = (position: number) => {
    if (position <= 2) return 'text-status-success font-bold'; // Top positions
    if (position >= table.length - 2) return 'text-status-error font-bold'; // Bottom positions
    return 'text-text-primary';
  };

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header Section */}
      <div className="bg-gradient-primary text-white">
        <div className="container-custom py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Statistics</h1>
          <p className="text-lg opacity-90">
            Complete statistics and records from Sissala Sports Online
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Season Selector */}
        <div className="bg-surface rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-1">Select Season</h2>
              <p className="text-sm text-text-secondary">View statistics from different seasons</p>
            </div>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none bg-white min-w-[250px]"
            >
              {seasons.map((season) => (
                <option key={season._id} value={season._id}>
                  {season.name} {season.status === 'active' && '(Current)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-surface rounded-xl shadow-md mb-8 overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all border-b-4 ${
                    activeTab === tab.id
                      ? 'border-primary-green text-primary-green bg-primary-green/5'
                      : 'border-transparent text-text-secondary hover:bg-background-light'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          // Loading State
          <div className="bg-surface rounded-xl p-8 animate-pulse">
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-12 bg-background-light rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-xl shadow-md overflow-hidden">
            {/* League Table */}
            {activeTab === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background-light">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Pos
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        P
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        W
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        D
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        L
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        GF
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        GA
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        GD
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Pts
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Form
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-background-light">
                    {table.map((entry) => (
                      <tr
                        key={entry.team._id}
                        className="hover:bg-background-light transition-colors"
                      >
                        <td className={`px-4 py-4 font-bold ${getPositionColor(entry.position)}`}>
                          {entry.position}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/teams/${entry.team._id}`}
                            className="flex items-center gap-3 hover:text-primary-green transition-colors"
                          >
                            {entry.team.logo ? (
                              <img
                                src={entry.team.logo}
                                alt={entry.team.name}
                                className="w-8 h-8 object-contain"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-primary-green/20 rounded-full flex items-center justify-center text-xs font-bold">
                                {entry.team.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium">{entry.team.name}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-center text-text-secondary">{entry.played}</td>
                        <td className="px-4 py-4 text-center text-text-secondary">{entry.won}</td>
                        <td className="px-4 py-4 text-center text-text-secondary">{entry.drawn}</td>
                        <td className="px-4 py-4 text-center text-text-secondary">{entry.lost}</td>
                        <td className="px-4 py-4 text-center text-text-secondary">{entry.goalsFor}</td>
                        <td className="px-4 py-4 text-center text-text-secondary">{entry.goalsAgainst}</td>
                        <td className="px-4 py-4 text-center font-medium text-text-primary">
                          {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-primary-green text-lg">
                          {entry.points}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-1">
                            {entry.form?.slice(-5).map((result, index) => (
                              <span
                                key={index}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getFormBadge(result)}`}
                              >
                                {result}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {table.length === 0 && (
                  <div className="text-center py-12 text-text-secondary">
                    No table data available for this season
                  </div>
                )}
              </div>
            )}

            {/* Top Scorers */}
            {activeTab === 'scorers' && (
              <div className="p-6">
                <div className="space-y-4">
                  {topScorers.map((scorer, index) => (
                    <div
                      key={scorer.player._id}
                      className="flex items-center gap-4 p-4 rounded-lg"
                    >
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-primary-yellow text-background-dark' :
                        index === 1 ? 'bg-text-secondary text-white' :
                        index === 2 ? 'bg-accent-orange text-white' :
                        'bg-background-light text-text-secondary'
                      }`}>
                        {index + 1}
                      </div>

                      {scorer.player.photo ? (
                        <img
                          src={scorer.player.photo}
                          alt={scorer.player.displayName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary-green/20"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary-green/20 flex items-center justify-center font-bold text-xl">
                          {scorer.player.displayName.substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-text-primary group-hover:text-primary-green transition-colors">
                          {scorer.player.displayName}
                        </h3>
                        <p className="text-sm text-text-secondary">{scorer.player.team.name}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary-green">{scorer.goals}</div>
                        <div className="text-xs text-text-secondary">goals</div>
                      </div>

                      <div className="text-right hidden sm:block">
                        <div className="text-lg font-semibold text-accent-blue">{scorer.assists || 0}</div>
                        <div className="text-xs text-text-secondary">assists</div>
                      </div>

                    </div>
                  ))}
                </div>

                {topScorers.length === 0 && (
                  <div className="text-center py-12 text-text-secondary">
                    No scorer data available for this season
                  </div>
                )}
              </div>
            )}

            {/* Top Assists */}
            {activeTab === 'assists' && (
              <div className="p-6">
                <div className="space-y-4">
                  {topAssists.map((assister, index) => (
                    <div
                      key={assister.player._id}
                      className="flex items-center gap-4 p-4 rounded-lg"
                    >
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-primary-yellow text-background-dark' :
                        index === 1 ? 'bg-text-secondary text-white' :
                        index === 2 ? 'bg-accent-orange text-white' :
                        'bg-background-light text-text-secondary'
                      }`}>
                        {index + 1}
                      </div>

                      {assister.player.photo ? (
                        <img
                          src={assister.player.photo}
                          alt={assister.player.displayName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-accent-blue/20"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-accent-blue/20 flex items-center justify-center font-bold text-xl">
                          {assister.player.displayName.substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-text-primary group-hover:text-accent-blue transition-colors">
                          {assister.player.displayName}
                        </h3>
                        <p className="text-sm text-text-secondary">{assister.player.team.name}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-bold text-accent-blue">{assister.assists || 0}</div>
                        <div className="text-xs text-text-secondary">assists</div>
                      </div>

                      <div className="text-right hidden sm:block">
                        <div className="text-lg font-semibold text-primary-green">{assister.goals || 0}</div>
                        <div className="text-xs text-text-secondary">goals</div>
                      </div>

                    </div>
                  ))}
                </div>

                {topAssists.length === 0 && (
                  <div className="text-center py-12 text-text-secondary">
                    No assist data available for this season
                  </div>
                )}
              </div>
            )}

            {/* Discipline */}
            {activeTab === 'discipline' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background-light">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Yellow Cards
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Red Cards
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-background-light">
                    {disciplinary.map((record, index) => (
                      <tr key={record.player._id} className="hover:bg-background-light transition-colors">
                        <td className="px-4 py-4 font-bold text-text-primary">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium">
                            {record.player.displayName}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-text-secondary">
                          {record.player.team.name}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-primary-yellow/20 text-primary-yellow font-bold rounded">
                            {record.yellowCards}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-status-error/20 text-status-error font-bold rounded">
                            {record.redCards}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-text-primary">
                          {record.yellowCards + record.redCards}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {disciplinary.length === 0 && (
                  <div className="text-center py-12 text-text-secondary">
                    No disciplinary data available for this season
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
