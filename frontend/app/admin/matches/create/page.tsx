'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { matchesApi, teamsApi, venuesApi, seasonsApi, leaguesApi } from '@/lib/api';

export default function CreateMatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    venue: '',
    season: '',
    league: '',
    matchDate: '',
    kickoffTime: '15:00',
    matchNumber: '',
    round: '',
    status: 'scheduled',
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== 'admin' && user.role !== 'editor') {
      alert('Access denied');
      router.push('/admin');
    }
  };

  const fetchData = async () => {
    try {
      const [teamsRes, venuesRes, seasonsRes, leaguesRes] = await Promise.all([
        teamsApi.getAll(),
        venuesApi.getAll(),
        seasonsApi.getAll(),
        leaguesApi.getAll(),
      ]);
      
      const teamsData = teamsRes.data.data || [];
      const venuesData = venuesRes.data.data || [];
      const seasonsData = seasonsRes.data.data || [];
      const leaguesData = leaguesRes.data.data || [];
      
      setTeams(teamsData);
      setVenues(venuesData);
      setSeasons(seasonsData);
      setLeagues(leaguesData);
      
      console.log('Data fetched:', {
        teams: teamsData.length,
        venues: venuesData.length,
        seasons: seasonsData.length,
        leagues: leaguesData.length
      });
      
      // Set default values for season and league
      const currentSeason = seasonsData?.find((s: any) => s.isCurrent);
      const firstSeason = seasonsData?.[0];
      const firstLeague = leaguesData?.[0];
      
      console.log('Setting defaults:', {
        currentSeason: currentSeason?.name,
        firstSeason: firstSeason?.name,
        firstLeague: firstLeague?.name
      });
      
      // Always set the league (priority: first league found)
      const leagueToSet = firstLeague?._id || '';
      
      // Set season (priority: current season, then first season)
      const seasonToSet = currentSeason?._id || firstSeason?._id || '';
      
      if (leagueToSet || seasonToSet) {
        setFormData(prev => ({
          ...prev,
          ...(seasonToSet && { season: seasonToSet }),
          ...(leagueToSet && { league: leagueToSet }),
        }));
        
        console.log('Form defaults set:', {
          season: seasonToSet,
          league: leagueToSet
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load form data. Please refresh the page.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.homeTeam) newErrors.homeTeam = 'Home team is required';
    if (!formData.awayTeam) newErrors.awayTeam = 'Away team is required';
    if (formData.homeTeam === formData.awayTeam) {
      newErrors.awayTeam = 'Away team must be different from home team';
    }
    if (!formData.venue) newErrors.venue = 'Venue is required';
    if (!formData.season) newErrors.season = 'Season is required';
    if (!formData.league) newErrors.league = 'League is required';
    if (!formData.matchDate) newErrors.matchDate = 'Match date is required';
    if (!formData.kickoffTime) newErrors.kickoffTime = 'Kickoff time is required';
    if (!formData.matchNumber) newErrors.matchNumber = 'Match number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Validation failed with errors:', errors);
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      alert(`Please fix the following errors:\n${Object.values(errors).join('\n')}`);
      return;
    }

    console.log('Validation passed, creating match...');
    try {
      setLoading(true);
      
      const submitData = {
        homeTeam: formData.homeTeam,
        awayTeam: formData.awayTeam,
        venue: formData.venue,
        season: formData.season,
        league: formData.league,
        matchDate: formData.matchDate,
        kickoffTime: formData.kickoffTime,
        matchNumber: parseInt(formData.matchNumber),
        round: formData.round || `Round ${formData.matchNumber}`,
        status: formData.status,
      };

      console.log('Submitting match data:', submitData);
      await matchesApi.create(submitData);
      alert('Match created successfully!');
      router.push('/admin/matches');
    } catch (error: any) {
      console.error('Error creating match:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create match';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light">
      <header className="bg-surface shadow-md sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/matches" className="text-text-secondary hover:text-text-primary">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="font-bold text-xl text-primary-green">Create New Match</h1>
                <p className="text-sm text-text-secondary">Schedule a new match</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-md p-6 space-y-6">
            {/* Teams */}
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Teams</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Home Team <span className="text-status-error">*</span>
                  </label>
                  <select
                    name="homeTeam"
                    value={formData.homeTeam}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.homeTeam ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                  >
                    <option value="">Select home team</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  {errors.homeTeam && <p className="text-status-error text-sm mt-1">{errors.homeTeam}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Away Team <span className="text-status-error">*</span>
                  </label>
                  <select
                    name="awayTeam"
                    value={formData.awayTeam}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.awayTeam ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                  >
                    <option value="">Select away team</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  {errors.awayTeam && <p className="text-status-error text-sm mt-1">{errors.awayTeam}</p>}
                </div>
              </div>
            </div>

            {/* Match Details */}
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Match Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Venue <span className="text-status-error">*</span>
                  </label>
                  <select
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.venue ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                  >
                    <option value="">Select venue</option>
                    {venues.map((venue) => (
                      <option key={venue._id} value={venue._id}>
                        {venue.name} ({venue.city})
                      </option>
                    ))}
                  </select>
                  {errors.venue && <p className="text-status-error text-sm mt-1">{errors.venue}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    League <span className="text-status-error">*</span>
                  </label>
                  <select
                    name="league"
                    value={formData.league}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.league ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                  >
                    <option value="">Select league</option>
                    {leagues.map((league) => (
                      <option key={league._id} value={league._id}>
                        {league.name}
                      </option>
                    ))}
                  </select>
                  {errors.league && <p className="text-status-error text-sm mt-1">{errors.league}</p>}
                  {!errors.league && formData.league && leagues.length > 0 && (
                    <p className="text-primary-green text-sm mt-1">
                      ✓ {leagues.find(l => l._id === formData.league)?.name} selected
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Season <span className="text-status-error">*</span>
                  </label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.season ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                  >
                    <option value="">Select season</option>
                    {seasons.map((season) => (
                      <option key={season._id} value={season._id}>
                        {season.name} {season.isCurrent ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                  {errors.season && <p className="text-status-error text-sm mt-1">{errors.season}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Match Date <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="date"
                    name="matchDate"
                    value={formData.matchDate}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.matchDate ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                  />
                  {errors.matchDate && <p className="text-status-error text-sm mt-1">{errors.matchDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Kickoff Time <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="time"
                    name="kickoffTime"
                    value={formData.kickoffTime}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.kickoffTime ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                  />
                  {errors.kickoffTime && <p className="text-status-error text-sm mt-1">{errors.kickoffTime}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Match Number <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="number"
                    name="matchNumber"
                    value={formData.matchNumber}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.matchNumber ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                    placeholder="e.g., 1"
                  />
                  {errors.matchNumber && <p className="text-status-error text-sm mt-1">{errors.matchNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Round
                  </label>
                  <input
                    type="text"
                    name="round"
                    value={formData.round}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                    placeholder="e.g., Round 1 or Quarter Final"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="postponed">Postponed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-background-light">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Creating...' : 'Create Match'}
              </button>
              <Link
                href="/admin/matches"
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
