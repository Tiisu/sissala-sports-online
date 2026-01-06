'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Users, Trophy, MapPin, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { teamsApi } from '@/lib/api';

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch teams from API
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await teamsApi.getAll();
        setTeams(response.data.data || []);
      } catch (error) {
        console.error('Error fetching teams:', error);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full text-sm font-medium mb-6 border border-red-500/30">
              <Trophy className="w-4 h-4" />
              <span>Sissala Premier League</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Teams</h1>
            <p className="text-xl text-white/90">
              Discover all teams competing in the 2024 season
            </p>
          </div>
        </div>
      </section>

      {/* Teams Directory Table */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-[#1a2c4e] to-[#2a4a7c] text-white px-6 py-4">
              <div className="grid grid-cols-12 gap-4 text-sm font-semibold">
                <div className="col-span-4">Team Info</div>
                <div className="col-span-2">Home Ground</div>
                <div className="col-span-2">Manager</div>
                <div className="col-span-2">Founded</div>
                <div className="col-span-2 text-center">Details</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="text-center py-16">
                  <div className="text-2xl font-bold text-gray-900 mb-2">Loading teams...</div>
                  <p className="text-gray-600">Please wait</p>
                </div>
              ) : teams.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Teams Found</h3>
                  <p className="text-gray-600">No teams available at the moment</p>
                </div>
              ) : (
                teams.map((team) => (
                  <Link
                    key={team._id}
                    href={`/teams/${team._id}`}
                    className="grid grid-cols-12 gap-4 px-6 py-6 hover:bg-gray-50 transition-colors group"
                  >
                    {/* Team Info */}
                    <div className="col-span-4 flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                        {team.logo ? (
                          <img src={team.logo} alt={team.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          <span className="text-4xl">🛡️</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-900 group-hover:text-red-500 transition-colors">
                          {team.name}
                        </div>
                        {team.nickname && (
                          <div className="text-sm text-gray-500 italic">"{team.nickname}"</div>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          {team.city && (
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                              {typeof team.city === 'string' ? team.city : team.city?.name || ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stadium */}
                    <div className="col-span-2 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {typeof team.stadium === 'string' 
                            ? team.stadium 
                            : team.stadium?.name || team.homeVenue?.name || team.homeVenue || 'TBD'}
                        </div>
                        {team.stadiumCapacity && (
                          <div className="text-xs text-gray-500">Capacity: {team.stadiumCapacity.toLocaleString()}</div>
                        )}
                      </div>
                    </div>

                    {/* Manager */}
                    <div className="col-span-2 flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {typeof team.manager === 'string' 
                            ? team.manager 
                            : team.manager?.name || 'TBD'}
                        </div>
                        <div className="text-xs text-gray-500">Head Coach</div>
                      </div>
                    </div>

                    {/* Founded */}
                    <div className="col-span-2 flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-gray-900">{team.founded || team.yearFounded || 'N/A'}</div>
                        {team.founded && (
                          <div className="text-xs text-gray-500">Est. {new Date().getFullYear() - team.founded} years</div>
                        )}
                      </div>
                    </div>

                    {/* View Details */}
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
                        <span>View Profile</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
