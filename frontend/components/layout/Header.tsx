'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search, User, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navigation = [
    { name: 'LIVE', href: '/matches?live=true' },
    { name: 'COMPETITIONS', href: '/tables' },
    { name: 'MATCHES', href: '/matches' },
    { name: 'TEAMS', href: '/teams' },
    { name: 'PLAYERS', href: '/players' },
    { name: 'NEWS', href: '/news' },
  ];

  // Mock live matches - will be replaced with real data
  const liveMatches = [
    { homeTeam: 'Anzhi Arsenal', awayTeam: 'Tula II', homeScore: 0, awayScore: 2, league: 'Youth Premier Liga \'89', time: '22:00 5th January, 2018' },
    { homeTeam: 'Orenburg', awayTeam: 'Ural', homeScore: 0, awayScore: 1, league: 'Premier Liga \'70', time: '22:00 5th January, 2018' },
    { homeTeam: 'Sangju Sanmu', awayTeam: 'Seongnam FC', homeScore: 1, awayScore: 3, league: 'K League', time: '22:00 5th January, 2018' },
    { homeTeam: 'Perth Glory', awayTeam: 'Adelaide United', homeScore: 0, awayScore: 3, league: 'A League', time: '22:00 5th January, 2018' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#1a2c4e] text-white shadow-lg">
      {/* Live Match Ticker - Scrolling Marquee */}
      <div className="bg-white border-b border-gray-200 overflow-hidden">
        <div className="relative">
          <div className="flex animate-scroll-left py-3">
            {/* Duplicate matches for seamless loop */}
            {[...liveMatches, ...liveMatches].map((match, index) => (
              <div key={index} className="flex items-center gap-3 min-w-[320px] px-4 border-r border-gray-200 flex-shrink-0">
                <div className="text-xs text-gray-500 min-w-[100px] font-semibold">{match.league}</div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">🛡️</div>
                    <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{match.homeTeam}</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 bg-red-500 text-white rounded text-sm font-bold min-w-[50px] justify-center">
                    {match.homeScore} - {match.awayScore}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">⚔️</div>
                    <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{match.awayTeam}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">
              ⚽
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">
                Sissala Sports Online
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  item.name === 'NEWS' 
                    ? 'text-red-500' 
                    : 'text-white hover:text-red-500'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Selector */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
              <span className="text-sm font-medium">EN</span>
              <ChevronRight className="w-4 h-4" />
            </div>

            {/* User Profile */}
            <button
              className="hidden md:flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar (Expandable) */}
      {searchOpen && (
        <div className="border-t border-white/10 animate-slide-up bg-[#1a2c4e]">
          <div className="container mx-auto px-4 py-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search player, club, country..."
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 animate-slide-up bg-[#1a2c4e]">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-all font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
