'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { statisticsApi, seasonsApi } from '@/lib/api';

export default function TablesPage() {
  const [standings, setStandings] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [topScorer, setTopScorer] = useState<any>(null);
  const [topAssists, setTopAssists] = useState<any>(null);

  // Fetch seasons
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await seasonsApi.getAll();
        const seasonsData = response.data.data || [];
        setSeasons(seasonsData);
        
        // Select current season or first season
        const currentSeason = seasonsData.find((s: any) => s.isCurrent) || seasonsData[0];
        if (currentSeason) {
          setSelectedSeason(currentSeason._id);
        }
      } catch (error) {
        console.error('Error fetching seasons:', error);
      }
    };

    fetchSeasons();
  }, []);

  // Fetch standings and statistics when season changes
  useEffect(() => {
    if (!selectedSeason) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch standings
        const standingsResponse = await statisticsApi.getSeasonTable(selectedSeason);
        console.log('Standings API Response:', standingsResponse.data);
        console.log('Response keys:', Object.keys(standingsResponse.data));
        
        // Handle different response structures
        const standingsData = standingsResponse.data.data?.standings || 
                             standingsResponse.data.data?.table || 
                             standingsResponse.data.standings || 
                             standingsResponse.data.table || 
                             standingsResponse.data.data || 
                             [];
        
        console.log('Extracted standings:', standingsData);
        console.log('Is array?', Array.isArray(standingsData));
        
        setStandings(Array.isArray(standingsData) ? standingsData : []);
        
        // Fetch top scorer
        try {
          const scorerResponse = await statisticsApi.getTopScorers(selectedSeason);
          const scorers = scorerResponse.data.data || [];
          setTopScorer(scorers[0] || null);
        } catch (error) {
          console.error('Error fetching top scorer:', error);
        }
        
        // Fetch top assists
        try {
          const assistsResponse = await statisticsApi.getTopAssists(selectedSeason);
          const assists = assistsResponse.data.data || [];
          setTopAssists(assists[0] || null);
        } catch (error) {
          console.error('Error fetching top assists:', error);
        }
      } catch (error) {
        console.error('Error fetching standings:', error);
        setStandings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSeason]);


  return (
    <MainLayout>
      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-[#1a2c4e] to-[#2a4a7c] text-white py-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(252,209,22,0.3),transparent)]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full text-sm font-medium mb-6 border border-yellow-500/30">
              <Trophy className="w-4 h-4" />
              <span>2024 Season Standings</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">League Table</h1>
            <p className="text-xl text-white/90">
              Current standings and team rankings for the Sissala Premier League
            </p>
          </div>
        </div>
      </section>

      {/* League Table */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Table Header - Desktop: Full table, Mobile: Simple compact */}
            <div className="hidden md:block bg-gradient-to-r from-[#1a2c4e] to-[#2a4a7c] text-white px-6 py-4 overflow-x-auto">
              <div className="grid grid-cols-[40px_minmax(200px,1fr)_60px_60px_60px_60px_60px_60px_80px_120px_80px] gap-4 text-sm font-semibold min-w-max">
                <div className="text-center">#</div>
                <div>Team</div>
                <div className="text-center">P</div>
                <div className="text-center">W</div>
                <div className="text-center">D</div>
                <div className="text-center">L</div>
                <div className="text-center">GF</div>
                <div className="text-center">GA</div>
                <div className="text-center">GD</div>
                <div className="text-center">Form</div>
                <div className="text-center font-bold">PTS</div>
              </div>
            </div>
            
            {/* Mobile Header - Simple like home page */}
            <div className="md:hidden bg-gradient-to-r from-[#1a2c4e] to-[#2a4a7c] text-white px-4 py-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-7">Team</div>
                <div className="col-span-2 text-center">P</div>
                <div className="col-span-2 text-center">PTS</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200 overflow-x-auto">
              {loading ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-4">🏆</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading standings...</h2>
                  <p className="text-gray-600">Please wait</p>
                </div>
              ) : standings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Standings Available</h3>
                  <p className="text-gray-600">Standings will appear once matches are completed</p>
                </div>
              ) : (
                standings.map((team, index) => (
                  <Link
                    key={team.team?._id || index}
                    href={`/teams/${team.team?._id}`}
                    className={`block ${
                      index === 0 ? 'bg-green-50' : 
                      index === 1 || index === 2 ? 'bg-blue-50' : 
                      index >= standings.length - 2 ? 'bg-red-50' : ''
                    }`}
                  >
                    {/* Mobile Compact Layout - Like home page */}
                    <div className="md:hidden px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-12 gap-2">
                        {/* Position */}
                        <div className="col-span-1 flex items-center justify-center">
                          <span className={`text-xs font-bold ${
                            index === 0 ? 'text-green-600' : 
                            index === 1 || index === 2 ? 'text-blue-600' : 
                            index >= standings.length - 2 ? 'text-red-600' : 
                            'text-gray-700'
                          }`}>
                            {team.position || index + 1}
                          </span>
                        </div>

                        {/* Team */}
                        <div className="col-span-7 flex items-center gap-2">
                          {team.team?.logo ? (
                            <img src={team.team.logo} alt={team.team.name} className="w-5 h-5 object-contain" />
                          ) : (
                            <span className="text-lg">🛡️</span>
                          )}
                          <span className="font-semibold text-sm text-gray-900 truncate">
                            {team.team?.name || 'Unknown Team'}
                          </span>
                        </div>

                        {/* Played */}
                        <div className="col-span-2 flex items-center justify-center text-xs text-gray-600">
                          {team.played || 0}
                        </div>

                        {/* Points */}
                        <div className="col-span-2 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-900">{team.points || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Table Row - Full */}
                    <div className="hidden md:grid grid-cols-[40px_minmax(200px,1fr)_60px_60px_60px_60px_60px_60px_80px_120px_80px] gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group min-w-max">
                  
                  {/* Position with change indicator */}
                  <div className="flex items-center justify-center gap-1">
                    <span className={`text-base font-bold ${
                      index === 0 ? 'text-green-600' : 
                      index === 1 || index === 2 ? 'text-blue-600' : 
                      index >= standings.length - 2 ? 'text-red-600' : 
                      'text-gray-700'
                    }`}>
                      {team.position || index + 1}
                    </span>
                  </div>

                  {/* Team */}
                  <div className="flex items-center gap-3">
                    {team.team?.logo ? (
                      <img src={team.team.logo} alt={team.team.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <span className="text-3xl">🛡️</span>
                    )}
                    <span className="font-semibold text-gray-900 group-hover:text-red-500 transition-colors">
                      {team.team?.name || 'Unknown Team'}
                    </span>
                  </div>

                  {/* Played */}
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    {team.played || 0}
                  </div>

                  {/* Won */}
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    {team.won || 0}
                  </div>

                  {/* Drawn */}
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    {team.drawn || 0}
                  </div>

                  {/* Lost */}
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    {team.lost || 0}
                  </div>

                  {/* Goals For */}
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    {team.goalsFor || team.gf || 0}
                  </div>

                  {/* Goals Against */}
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    {team.goalsAgainst || team.ga || 0}
                  </div>

                  {/* Goal Difference */}
                  <div className="flex items-center justify-center text-sm font-semibold text-gray-900">
                    {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference || 0}
                  </div>

                  {/* Form */}
                  <div className="flex items-center justify-center gap-1">
                    {team.form && team.form.length > 0 ? (
                      team.form.slice(-5).map((result: string, idx: number) => (
                        <span
                          key={idx}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            result === 'W' ? 'bg-green-500' : 
                            result === 'D' ? 'bg-gray-400' : 
                            'bg-red-500'
                          }`}
                        >
                          {result}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>

                  {/* Points */}
                  <div className="flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">{team.points || 0}</span>
                  </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>
      </section>

    </MainLayout>
  );
}
