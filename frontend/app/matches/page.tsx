'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Calendar, MapPin, Clock, Filter, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { matchesApi } from '@/lib/api';
import { format } from 'date-fns';

export default function MatchesPage() {
  const [filter, setFilter] = useState('all');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Fetch matches from API
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        let response;
        let matchesData = [];
        
        if (filter === 'live') {
          response = await matchesApi.getLive();
          matchesData = response.data.data.matches || [];
          setTotalPages(1);
          setTotalItems(matchesData.length);
        } else if (filter === 'scheduled') {
          response = await matchesApi.getUpcoming();
          matchesData = response.data.data.matches || [];
          setTotalPages(1);
          setTotalItems(matchesData.length);
        } else if (filter === 'finished') {
          response = await matchesApi.getRecent();
          matchesData = response.data.data.matches || [];
          setTotalPages(1);
          setTotalItems(matchesData.length);
        } else {
          // Get all matches - paginated endpoint returns array directly in data
          response = await matchesApi.getAll({ limit: itemsPerPage, page: currentPage });
          matchesData = response.data.data || [];
          
          // Set pagination info
          const pagination = response.data.pagination;
          setTotalPages(pagination?.totalPages || 1);
          setTotalItems(pagination?.totalItems || matchesData.length);
        }
        
        setMatches(matchesData);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [filter, currentPage]);

  const filteredMatches = matches;

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
              <span className="live-dot"></span>
              <span>Live Matches & Fixtures</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Matches</h1>
            <p className="text-xl text-white/90">
              Follow all fixtures, live scores, and results from the 2024 season
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white py-8 -mt-8 relative z-10 shadow-md">
        <div className="container mx-auto px-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">Filter by:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-[#1a2c4e] text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All Matches
              </button>
              <button
                onClick={() => setFilter('live')}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  filter === 'live'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {filter === 'live' && <span className="live-dot"></span>}
                Live Now
              </button>
              <button
                onClick={() => setFilter('scheduled')}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                  filter === 'scheduled'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('finished')}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                  filter === 'finished'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Results
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Matches Table */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:block bg-gradient-to-r from-[#1a2c4e] to-[#2a4a7c] text-white px-6 py-4">
              <div className="grid grid-cols-12 gap-4 text-sm font-semibold">
                <div className="col-span-2">Date & Time</div>
                <div className="col-span-8 text-center">Match</div>
                <div className="col-span-2">Venue</div>
              </div>
            </div>
            
            {/* Mobile Header */}
            <div className="md:hidden bg-gradient-to-r from-[#1a2c4e] to-[#2a4a7c] text-white px-4 py-3">
              <h2 className="text-lg font-bold">Fixtures</h2>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="text-center py-16">
                  <div className="text-2xl font-bold text-gray-900 mb-2">Loading matches...</div>
                  <p className="text-gray-600">Please wait</p>
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">⚽</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Matches Found</h3>
                  <p className="text-gray-600">Try selecting a different filter</p>
                </div>
              ) : (
                filteredMatches.map((match) => (
                  <div
                    key={match._id}
                    className={`transition-colors ${
                      match.status === 'live' || match.status === 'halftime' ? 'bg-red-50' : ''
                    }`}
                  >
                    {/* Mobile Card Layout */}
                    <div className="md:hidden px-4 py-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-gray-900">
                            {format(new Date(match.matchDate), 'MMM dd')}
                          </span>
                          <span className="text-gray-500">
                            {format(new Date(match.matchDate), 'HH:mm')}
                          </span>
                        </div>
                        {(match.status === 'live' || match.status === 'halftime') && (
                          <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                            <span className="live-dot"></span>
                            {match.status === 'halftime' ? 'HT' : 'LIVE'}
                          </span>
                        )}
                        {match.status === 'finished' && (
                          <span className="text-xs text-green-600 font-semibold">FT</span>
                        )}
                      </div>
                      
                      {/* Teams and Score */}
                      <div className="space-y-3">
                        {/* Home Team */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            {match.homeTeam?.logo ? (
                              <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-6 h-6 object-contain" />
                            ) : (
                              <span className="text-xl">🛡️</span>
                            )}
                            <span className="font-semibold text-gray-900">
                              {match.homeTeam?.name}
                            </span>
                          </div>
                          {match.status !== 'scheduled' && (
                            <span className="text-xl font-bold text-gray-900">{match.score?.home || 0}</span>
                          )}
                        </div>
                        
                        {/* Away Team */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            {match.awayTeam?.logo ? (
                              <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-6 h-6 object-contain" />
                            ) : (
                              <span className="text-xl">⚔️</span>
                            )}
                            <span className="font-semibold text-gray-900">
                              {match.awayTeam?.name}
                            </span>
                          </div>
                          {match.status !== 'scheduled' && (
                            <span className="text-xl font-bold text-gray-900">{match.score?.away || 0}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Venue */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{match.venue?.name || 'TBD'}</span>
                      </div>
                    </div>

                    {/* Desktop Grid Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-5">
                    {/* Date & Time */}
                    <div className="col-span-2 flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        {format(new Date(match.matchDate), 'MMM dd, yyyy')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(match.matchDate), 'HH:mm')}
                      </span>
                      {(match.status === 'live' || match.status === 'halftime') && (
                        <span className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1">
                          <span className="live-dot"></span>
                          {match.status === 'halftime' ? 'HT' : `LIVE ${match.currentMinute || 0}'`}
                        </span>
                      )}
                      {match.status === 'finished' && (
                        <span className="text-xs text-green-600 font-semibold mt-1">FT</span>
                      )}
                    </div>

                    {/* Home Team */}
                    <div className="col-span-3 flex items-center gap-3">
                      {match.homeTeam?.logo ? (
                        <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-3xl">🛡️</span>
                      )}
                      <span className="font-semibold text-gray-900">
                        {match.homeTeam?.name}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="col-span-2 flex items-center justify-center">
                      {match.status === 'scheduled' ? (
                        <span className="text-gray-400 font-bold text-lg">VS</span>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-gray-900">{match.score?.home || 0}</span>
                          <span className="text-gray-400">-</span>
                          <span className="text-2xl font-bold text-gray-900">{match.score?.away || 0}</span>
                        </div>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="col-span-3 flex items-center gap-3">
                      {match.awayTeam?.logo ? (
                        <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-3xl">⚔️</span>
                      )}
                      <span className="font-semibold text-gray-900">
                        {match.awayTeam?.name}
                      </span>
                    </div>

                    {/* Venue */}
                    <div className="col-span-2 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{match.venue?.name || 'TBD'}</span>
                    </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination - Only show for 'all' filter */}
            {filter === 'all' && totalPages > 1 && !loading && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  {/* Info */}
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                    <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                    <span className="font-semibold">{totalItems}</span> matches
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-[#1a2c4e] hover:text-white border border-gray-300'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage = 
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1);
                        
                        // Show ellipsis
                        const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                        const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

                        if (showEllipsisBefore || showEllipsisAfter) {
                          return (
                            <span key={page} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }

                        if (!showPage) return null;

                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[40px] h-10 rounded-lg font-semibold transition-all ${
                              currentPage === page
                                ? 'bg-[#1a2c4e] text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-[#1a2c4e] hover:text-white border border-gray-300'
                      }`}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
