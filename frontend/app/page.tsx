'use client';

import MainLayout from '@/components/layout/MainLayout';
import { ArrowRight, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { matchesApi, statisticsApi, seasonsApi, newsApi } from '@/lib/api';
import { format } from 'date-fns';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [upcomingFixtures, setUpcomingFixtures] = useState<any[]>([]);
  const [leagueStandings, setLeagueStandings] = useState<any[]>([]);
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Static background image for all slides - cropped to show stadium lights
  const heroBackgroundImage = 'https://res.cloudinary.com/dxbpwvuar/image/upload/v1767581097/Football_dream_cinematic_wallpaper_l73k89.jpg';

  // Slider data - multiple featured stories with overlay images
  const slides = [
    {
      id: 1,
      title: 'Welcome to Sissala Sports - Where Passion Meets Glory',
      badge: 'FEATURED STORY',
      playerImage: 'https://res.cloudinary.com/dxbpwvuar/image/upload/v1767579450/heroimage_lgycsj.png',
      link: '/news/1',
    },
    {
      id: 2,
      title: 'Will Sissala United dominate the league this season?',
      badge: 'LEAGUE UPDATE',
      playerImage: 'https://res.cloudinary.com/dxbpwvuar/image/upload/v1767582073/eagle_hnmqch.png',
      link: '/news/2',
    },
    {
      id: 3,
      title: 'Top scorers battle for the golden boot in intense rivalry',
      badge: 'MATCH HIGHLIGHTS',
      playerImage: 'https://res.cloudinary.com/dxbpwvuar/image/upload/v1767586474/niii_zz6ekt.png',
      link: '/news/3',
    },
    {
      id: 4,
      title: 'Youth academy players making breakthrough into first team',
      badge: 'RISING STARS',
      playerImage: 'https://res.cloudinary.com/dxbpwvuar/image/upload/v1767586955/yussif_ghwyts.png',
      link: '/news/4',
    },
  ];

  // Fetch all data on page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch upcoming matches
        const matchesResponse = await matchesApi.getUpcoming();
        setUpcomingFixtures(matchesResponse.data.data.matches || []);
        
        // Fetch league standings
        try {
          const seasonsResponse = await seasonsApi.getAll();
          const seasons = seasonsResponse.data.data || [];
          const currentSeason = seasons.find((s: any) => s.isCurrent) || seasons[0];
          
          if (currentSeason) {
            const standingsResponse = await statisticsApi.getSeasonTable(currentSeason._id);
            const standings = standingsResponse.data.data?.table || [];
            setLeagueStandings(standings.slice(0, 6)); // Top 6 teams
          }
        } catch (error) {
          console.error('Error fetching standings:', error);
        }
        
        // Fetch latest news
        try {
          const newsResponse = await newsApi.getAll({ limit: 3 });
          setNewsArticles(newsResponse.data.data || []);
        } catch (error) {
          console.error('Error fetching news:', error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setUpcomingFixtures([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  // Video playlist - will be replaced with real API data
  const videoPlaylist = [
    {
      id: 1,
      title: 'Match Highlights: Sissala United vs Tumu City FC',
      thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop',
      duration: '5:32',
      category: 'Highlights',
      views: '12.5K',
      date: '2 days ago',
      videoUrl: 'https://www.youtube.com/watch?v=example1'
    },
    {
      id: 2,
      title: 'Top 10 Goals of the Month - December 2024',
      thumbnail: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop',
      duration: '8:15',
      category: 'Goals',
      views: '25.3K',
      date: '5 days ago',
      videoUrl: 'https://www.youtube.com/watch?v=example2'
    },
    {
      id: 3,
      title: 'Behind the Scenes: Training Session with Warriors FC',
      thumbnail: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=600&h=400&fit=crop',
      duration: '12:45',
      category: 'Behind the Scenes',
      views: '8.7K',
      date: '1 week ago',
      videoUrl: 'https://www.youtube.com/watch?v=example3'
    },
    {
      id: 4,
      title: 'Player Interview: Kwame Mensah on his Golden Boot Journey',
      thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=400&fit=crop',
      duration: '15:20',
      category: 'Interviews',
      views: '18.9K',
      date: '1 week ago',
      videoUrl: 'https://www.youtube.com/watch?v=example4'
    },
  ];

  // Top scorers - will be replaced with real API data
  const topScorers = [
    { 
      id: 1, 
      name: 'Kwame Mensah', 
      team: 'Sissala United', 
      teamLogo: '🛡️',
      goals: 18, 
      matches: 15,
      image: 'https://res.cloudinary.com/dxbpwvuar/image/upload/v1767582073/eagle_hnmqch.png',
      nationality: '🇬🇭'
    },
    { 
      id: 2, 
      name: 'Yaw Boateng', 
      team: 'Tumu City FC', 
      teamLogo: '⚔️',
      goals: 15, 
      matches: 15,
      image: 'https://res.cloudinary.com/dxbpwvuar/image/upload/v1767586474/niii_zz6ekt.png',
      nationality: '🇬🇭'
    },
    { 
      id: 3, 
      name: 'Kofi Owusu', 
      team: 'Warriors FC', 
      teamLogo: '🦁',
      goals: 13, 
      matches: 14,
      image: 'https://res.cloudinary.com/dxbpwvuar/image/upload/v1767586955/yussif_ghwyts.png',
      nationality: '🇬🇭'
    },
  ];

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  // Video navigation functions
  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videoPlaylist.length);
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videoPlaylist.length) % videoPlaylist.length);
  };

  const goToVideo = (index: number) => {
    setCurrentVideoIndex(index);
  };

  return (
    <MainLayout>
      {/* Hero Section with Slider and Player Card */}
      <section className="relative pb-80 overflow-hidden">
        {/* Single background image covering entire hero section including player card */}
        <div className="absolute inset-0">
          <img
            src={heroBackgroundImage}
            alt="Background"
            className="w-full h-full object-cover object-top"
            style={{ objectPosition: 'center 20%' }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Featured Story Slider - 2/3 width, no background */}
            <div className="lg:col-span-2">
              <div className="relative h-[600px]">
                {/* Slides - Only content changes */}
                <div className="relative h-full">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-700 ${
                        index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                    >
                      <div className="h-full relative">
                        {/* Player Image Overlay (if exists) - positioned on top of background */}
                        {slide.playerImage && (
                          <div className="absolute h-[120%] w-auto max-w-[55%] hidden md:block"
                               style={{
                                 bottom: slide.id === 2 || slide.id === 3 ? '-180px' : slide.id === 4 ? '-120px' : slide.id === 1 ? '-120px' : '-60px',
                                 right: slide.id === 1 ? '-100px' : '0'
                               }}>
                            <img
                              src={slide.playerImage}
                              alt="Featured Player"
                              className="h-full w-auto object-contain object-bottom"
                              style={{
                                transform: slide.id === 2 || slide.id === 3 || slide.id === 4 ? 'scale(1.2)' : 'scale(1.1)',
                                transformOrigin: 'center bottom',
                                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'
                              }}
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="relative z-20 px-8 md:px-12 h-full flex flex-col justify-end pb-12 max-w-xl space-y-6">
                          {/* Badge and Logo */}
                          <div>
                            <div className="flex items-center gap-3 mb-6">
                              {/* Team Logo Badge */}
                              <div className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-2xl">⚽</span>
                              </div>
                              {/* Small checkmark badge */}
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center -ml-4 z-10 border-2 border-white">
                                <span className="text-white text-xs">✓</span>
                              </div>
                              {/* Category Badge */}
                              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wide">
                                {slide.badge}
                              </span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
                              {slide.title}
                            </h1>
                          </div>

                          {/* CTAs - Action buttons */}
                          <div className="flex flex-wrap gap-4">
                            <Link href={slide.link} className="btn bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg uppercase tracking-wide text-sm inline-flex items-center gap-2">
                              Read More
                              <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/matches" className="btn bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-lg transition-colors border-2 border-white/30 uppercase tracking-wide text-sm">
                              View Matches
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Arrows - No background, shows on hover */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all ${
                        index === currentSlide
                          ? 'w-8 h-2 bg-white'
                          : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                      } rounded-full`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Slide Counter */}
                <div className="absolute top-6 right-6 z-20 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
                  {currentSlide + 1} / {slides.length}
                </div>
              </div>
            </div>

            {/* Upcoming Fixtures Card - 1/3 width, transparent on background */}
            <div className="lg:col-span-1">
              <div className="bg-[#1a2c4e]/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl p-6 h-[600px] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                  <h2 className="text-2xl font-bold text-white">Upcoming Fixtures</h2>
                  <Link href="/matches" className="text-red-500 hover:text-red-400 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                {/* Fixtures List - Show only 2 matches */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {loading ? (
                    <div className="text-white/60 text-center py-8">Loading fixtures...</div>
                  ) : upcomingFixtures.length === 0 ? (
                    <div className="text-white/60 text-center py-8">No upcoming fixtures</div>
                  ) : (
                    upcomingFixtures.slice(0, 2).map((fixture) => (
                      <Link
                        key={fixture._id}
                        href={`/matches/${fixture._id}`}
                        className="block bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-colors border border-white/10"
                      >
                        {/* Competition Badge */}
                        <div className="text-xs text-red-500 font-semibold mb-3 uppercase tracking-wide">
                          {fixture.league?.name || fixture.season?.name || 'League Match'}
                        </div>

                        {/* Teams */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 flex-1">
                            {fixture.homeTeam?.logo ? (
                              <img src={fixture.homeTeam.logo} alt={fixture.homeTeam.name} className="w-6 h-6 object-contain" />
                            ) : (
                              <span className="text-2xl">🛡️</span>
                            )}
                            <span className="text-white font-semibold text-sm">{fixture.homeTeam?.name}</span>
                          </div>
                          <div className="text-white/60 font-bold px-3">VS</div>
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="text-white font-semibold text-sm">{fixture.awayTeam?.name}</span>
                            {fixture.awayTeam?.logo ? (
                              <img src={fixture.awayTeam.logo} alt={fixture.awayTeam.name} className="w-6 h-6 object-contain" />
                            ) : (
                              <span className="text-2xl">⚔️</span>
                            )}
                          </div>
                        </div>

                        {/* Date, Time, Venue */}
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <span>📅</span>
                            <span>{format(new Date(fixture.matchDate), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>⏰</span>
                            <span>{format(new Date(fixture.matchDate), 'HH:mm')}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <span>📍</span>
                          <span>{fixture.venue?.name || 'TBD'}</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                {/* View All Button */}
                <Link 
                  href="/matches" 
                  className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg uppercase tracking-wide text-sm"
                >
                  View All Fixtures
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Articles Section - Overlays on hero section */}
      <section className="relative -mt-64 z-30">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* News Cards Column */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full text-center py-8 text-gray-500">Loading news...</div>
                ) : newsArticles.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">No news articles available</div>
                ) : (
                  newsArticles.map((article: any) => (
                    <Link
                      key={article._id}
                      href={`/news/${article._id}`}
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={article.featuredImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop'}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-gray-500 mb-2 uppercase">{article.category?.replace('_', ' ')}</div>
                        <h3 className="font-bold text-sm mb-2 line-clamp-3 group-hover:text-red-500 transition-colors">
                          {article.title}
                        </h3>
                        <div className="flex items-center text-red-500 text-sm font-medium">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

              {/* News Spotlight Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">News spotlight</h2>
                  <Link href="/news">
                    <ArrowRight className="w-5 h-5 text-red-500 hover:text-red-600 cursor-pointer" />
                  </Link>
                </div>

                <div className="space-y-6">
                  {loading ? (
                    <div className="text-center py-4 text-gray-500">Loading...</div>
                  ) : newsArticles.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No news available</div>
                  ) : (
                    newsArticles.map((item: any, index: number) => (
                      <div key={item._id}>
                        <Link
                          href={`/news/${item._id}`}
                          className="block group"
                        >
                          <div className="text-xs text-gray-500 mb-2 uppercase">{item.category?.replace('_', ' ')}</div>
                          <h3 className="font-bold text-sm mb-2 group-hover:text-red-500 transition-colors">
                            {item.title}
                          </h3>
                          <div className="flex items-center text-red-500 text-xs font-medium">
                            Read More
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </div>
                        </Link>
                        {index !== newsArticles.length - 1 && (
                          <div className="border-b border-gray-200 mt-6"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Scorers & League Standings Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Scorers - Left Side */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Top Scorers</h2>
                  <p className="text-gray-600">2024 Season - Golden Boot Race</p>
                </div>
                <Link 
                  href="/statistics" 
                  className="text-red-500 hover:text-red-600 font-semibold flex items-center gap-2 transition-colors"
                >
                  View All
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topScorers.map((player, index) => (
              <div
                key={player.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative">
                  {/* Rank Badge */}
                  <div className={`absolute top-3 left-3 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Player Image */}
                  <div className="aspect-square bg-gradient-to-br from-[#1a2c4e] to-[#2a4a7c] relative overflow-hidden">
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Goals Badge */}
                    <div className="absolute bottom-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xl font-bold">{player.goals}</span>
                        <div className="text-xs uppercase">
                          <div>Goals</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Player Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-0.5 group-hover:text-red-500 transition-colors">
                        {player.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="text-base">{player.teamLogo}</span>
                        <span>{player.team}</span>
                      </div>
                    </div>
                    <span className="text-xl">{player.nationality}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{player.matches}</div>
                      <div className="text-xs text-gray-500 uppercase">Matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-500">{(player.goals / player.matches).toFixed(2)}</div>
                      <div className="text-xs text-gray-500 uppercase">Goals/Match</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
              </div>
            </div>

            {/* League Standings - Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">League Table</h2>
                    <p className="text-sm text-gray-600">2024 Season</p>
                  </div>
                  <Link 
                    href="/tables" 
                    className="text-red-500 hover:text-red-600 font-semibold text-sm flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {/* Table Header */}
                  <div className="bg-gradient-to-r from-[#1a2c4e] to-[#2a4a7c] text-white px-4 py-3 sticky top-0 z-10">
                    <div className="grid grid-cols-12 gap-2 text-xs font-semibold">
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-7">Team</div>
                      <div className="col-span-2 text-center">P</div>
                      <div className="col-span-2 text-center">PTS</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">Loading standings...</div>
                    ) : leagueStandings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No standings available</div>
                    ) : (
                      leagueStandings.map((standing: any, index: number) => (
                        <Link
                          key={standing.position}
                          href={`/teams/${standing.team?._id}`}
                          className={`grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-50 transition-colors ${
                            index === 0 ? 'bg-green-50' : index === 1 || index === 2 ? 'bg-blue-50' : ''
                          }`}
                        >
                          {/* Position */}
                          <div className="col-span-1 flex items-center justify-center">
                            <span className={`text-xs font-bold ${
                              index === 0 ? 'text-green-600' : index === 1 || index === 2 ? 'text-blue-600' : 'text-gray-700'
                            }`}>
                              {standing.position}
                            </span>
                          </div>

                          {/* Team */}
                          <div className="col-span-7 flex items-center gap-2">
                            {standing.team?.logo ? (
                              <img src={standing.team.logo} alt={standing.team.name} className="w-5 h-5 object-contain" />
                            ) : (
                              <span className="text-lg">⚽</span>
                            )}
                            <span className="font-semibold text-sm text-gray-900 truncate">{standing.team?.name || 'Unknown Team'}</span>
                          </div>

                          {/* Played */}
                          <div className="col-span-2 flex items-center justify-center text-xs text-gray-600">
                            {standing.played}
                          </div>

                          {/* Points */}
                          <div className="col-span-2 flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-900">{standing.points}</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Playlist Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Video Highlights</h2>
              <p className="text-gray-600">Latest matches, goals, and exclusive content</p>
            </div>
            <Link 
              href="/media" 
              className="text-red-500 hover:text-red-600 font-semibold flex items-center gap-2 transition-colors"
            >
              View All Videos
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Video Player with Side Thumbnails */}
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-center">
              {/* Left Thumbnails - 2 Previous Videos */}
              <div className="lg:col-span-1 hidden lg:block space-y-4">
                {[...Array(2)].map((_, i) => {
                  const index = (currentVideoIndex - 2 + i + videoPlaylist.length) % videoPlaylist.length;
                  const video = videoPlaylist[index];
                  return (
                    <button
                      key={index}
                      onClick={() => goToVideo(index)}
                      className="group block w-full text-left"
                    >
                      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all">
                        <div className="relative aspect-video bg-gray-200">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <div className="w-10 h-10 bg-red-500/80 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black/90 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                            {video.duration}
                          </div>
                          <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded font-semibold">
                            {video.category}
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-red-500 transition-colors">
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{video.views} views</span>
                            <span>•</span>
                            <span>{video.date}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Center - Featured Video */}
              <div className="lg:col-span-5 relative">
                {/* Navigation Buttons */}
                <button
                  onClick={prevVideo}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextVideo}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <Link
                  href={videoPlaylist[currentVideoIndex].videoUrl}
                  className="group block"
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gray-200">
                      <img
                        src={videoPlaylist[currentVideoIndex].thumbnail}
                        alt={videoPlaylist[currentVideoIndex].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-4 right-4 bg-black/90 text-white text-sm font-bold px-4 py-2 rounded">
                        {videoPlaylist[currentVideoIndex].duration}
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded shadow-lg">
                        {videoPlaylist[currentVideoIndex].category}
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="bg-white p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-500 transition-colors">
                        {videoPlaylist[currentVideoIndex].title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {videoPlaylist[currentVideoIndex].views} views
                        </span>
                        <span>•</span>
                        <span>{videoPlaylist[currentVideoIndex].date}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Right Thumbnails - 2 Next Videos */}
              <div className="lg:col-span-1 hidden lg:block space-y-4">
                {[...Array(2)].map((_, i) => {
                  const index = (currentVideoIndex + 1 + i) % videoPlaylist.length;
                  const video = videoPlaylist[index];
                  return (
                    <button
                      key={index}
                      onClick={() => goToVideo(index)}
                      className="group block w-full text-left"
                    >
                      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all">
                        <div className="relative aspect-video bg-gray-200">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <div className="w-10 h-10 bg-red-500/80 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black/90 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                            {video.duration}
                          </div>
                          <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded font-semibold">
                            {video.category}
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-red-500 transition-colors">
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{video.views} views</span>
                            <span>•</span>
                            <span>{video.date}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Navigation Dots */}
            <div className="flex lg:hidden items-center justify-center gap-2 mt-6">
              {videoPlaylist.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToVideo(index)}
                  className={`transition-all ${
                    index === currentVideoIndex
                      ? 'w-8 h-2 bg-red-500'
                      : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                  } rounded-full`}
                />
              ))}
            </div>
          </div>

          {/* Hidden old code */}
          <div className="hidden">
            <div className="lg:col-span-1 space-y-4">
              {videoPlaylist.slice(1).map((video) => (
                <Link
                  key={video.id}
                  href={video.videoUrl}
                  className="group block"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="grid grid-cols-5 gap-3">
                      {/* Thumbnail */}
                      <div className="col-span-2 relative aspect-video bg-gray-200">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>

                        {/* Duration Badge */}
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                          {video.duration}
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="col-span-3 p-3 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-red-500 transition-colors">
                            {video.title}
                          </h4>
                          <span className="text-xs text-gray-500">{video.views} views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="mt-12 bg-gradient-to-r from-[#1a2c4e] to-[#2a4a7c] rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Never Miss a Moment
            </h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Subscribe to our channel for exclusive highlights, player interviews, behind-the-scenes content, and match replays.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/media" 
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg uppercase tracking-wide text-sm inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Subscribe Now
              </Link>
              <Link 
                href="/auth/register" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-lg transition-colors border-2 border-white/30 uppercase tracking-wide text-sm"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
