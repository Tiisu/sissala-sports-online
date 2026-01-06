'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { matchesApi, teamsApi, venuesApi, seasonsApi, leaguesApi } from '@/lib/api';

export default function EditMatchPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    homeScore: '',
    awayScore: '',
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    checkAuth();
    fetchData();
  }, [matchId]);

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
      setLoading(true);
      const [matchRes, teamsRes, venuesRes, seasonsRes, leaguesRes] = await Promise.all([
        matchesApi.getById(matchId),
        teamsApi.getAll(),
        venuesApi.getAll(),
        seasonsApi.getAll(),
        leaguesApi.getAll(),
      ]);
      
      console.log('Match API Response:', matchRes.data);
      console.log('Response keys:', Object.keys(matchRes.data));
      
      // Handle both response structures: data.data.match or data.match or data.data
      const match = matchRes.data.data?.match || matchRes.data.match || matchRes.data.data || matchRes.data;
      
      console.log('Extracted Match data:', match);
      console.log('Match keys:', match ? Object.keys(match) : 'null');
      console.log('HomeTeam:', match?.homeTeam);
      console.log('AwayTeam:', match?.awayTeam);
      
      if (!match || !match._id) {
        throw new Error('Invalid match data structure received from API');
      }
      
      const formValues = {
        homeTeam: match.homeTeam?._id || match.homeTeam || '',
        awayTeam: match.awayTeam?._id || match.awayTeam || '',
        venue: match.venue?._id || match.venue || '',
        season: match.season?._id || match.season || '',
        league: match.league?._id || match.league || '',
        matchDate: match.matchDate ? new Date(match.matchDate).toISOString().split('T')[0] : '',
        kickoffTime: match.kickoffTime || '15:00',
        matchNumber: match.matchNumber?.toString() || '',
        round: match.round || '',
        status: match.status || 'scheduled',
        homeScore: match.score?.home?.toString() || '',
        awayScore: match.score?.away?.toString() || '',
      };
      
      console.log('Setting form data:', formValues);
      setFormData(formValues);
      
      setTeams(teamsRes.data.data || []);
      setVenues(venuesRes.data.data || []);
      setSeasons(seasonsRes.data.data || []);
      setLeagues(leaguesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load match data');
      router.push('/admin/matches');
    } finally {
      setLoading(false);
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
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const submitData: any = {
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

      // Add scores if status is finished or live
      if (formData.status === 'finished' || formData.status === 'live') {
        submitData.score = {
          home: parseInt(formData.homeScore) || 0,
          away: parseInt(formData.awayScore) || 0,
        };
      }

      await matchesApi.update(matchId, submitData);
      alert('Match updated successfully!');
      router.push('/admin/matches');
    } catch (error: any) {
      console.error('Error updating match:', error);
      alert(error.response?.data?.message || 'Failed to update match');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
      </div>
    );
  }

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
                <h1 className="font-bold text-xl text-primary-green">Edit Match</h1>
                <p className="text-sm text-text-secondary">Update match information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          {/* Debug Info - Remove after testing */}
          <div className="mb-4 p-4 bg-gray-100 rounded text-xs">
            <strong>Debug Info:</strong>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </div>
          
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
                    <option value="live">Live</option>
                    <option value="halftime">Half Time</option>
                    <option value="finished">Finished</option>
                    <option value="postponed">Postponed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Score (only if status is live or finished) */}
            {(formData.status === 'live' || formData.status === 'finished') && (
              <div>
                <h3 className="font-bold text-lg text-text-primary mb-4">Score</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Home Score
                    </label>
                    <input
                      type="number"
                      name="homeScore"
                      value={formData.homeScore}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Away Score
                    </label>
                    <input
                      type="number"
                      name="awayScore"
                      value={formData.awayScore}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-background-light">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
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
