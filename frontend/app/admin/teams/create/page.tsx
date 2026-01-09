'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { teamsApi, seasonsApi, venuesApi, leaguesApi } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';

export default function CreateTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    city: '',
    foundedYear: new Date().getFullYear(),
    league: '',
    homeVenue: '',
    currentSeason: '',
    managerName: '',
    colors: ['#059669', '#FFFFFF'],
    logo: '',
    stadium: '',
    website: '',
    email: '',
    phone: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [teamPhotoFile, setTeamPhotoFile] = useState<File | null>(null);
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
    if (user.role !== 'admin' && user.role !== 'manager') {
      alert('Access denied');
      router.push('/admin');
    }
  };

  const fetchData = async () => {
    try {
      const [seasonsRes, venuesRes, leaguesRes] = await Promise.all([
        seasonsApi.getAll(),
        venuesApi.getAll(),
        leaguesApi.getAll(),
      ]);
      setSeasons(seasonsRes.data.data || []);
      setVenues(venuesRes.data.data || []);
      setLeagues(leaguesRes.data.data || []);
      
      // Set current season and league as defaults
      const currentSeason = seasonsRes.data.data?.find((s: any) => s.isCurrent);
      if (currentSeason) {
        setFormData(prev => ({ 
          ...prev, 
          currentSeason: currentSeason._id,
          league: currentSeason.league?._id || currentSeason.league || ''
        }));
      }
      
      // If no current season, set first league as default
      if (!currentSeason && leaguesRes.data.data?.length > 0) {
        setFormData(prev => ({ ...prev, league: leaguesRes.data.data[0]._id }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
    if (errors.logo) {
      setErrors((prev: any) => ({ ...prev, logo: '' }));
    }
  };

  const handleTeamPhotoChange = (file: File | null) => {
    setTeamPhotoFile(file);
    if (errors.stadium) {
      setErrors((prev: any) => ({ ...prev, stadium: '' }));
    }
  };

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...formData.colors];
    newColors[index] = value;
    setFormData(prev => ({ ...prev, colors: newColors }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Team name is required';
    if (!formData.shortName.trim()) newErrors.shortName = 'Short name is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.league) newErrors.league = 'League is required';
    if (!formData.homeVenue) newErrors.homeVenue = 'Home venue is required';
    if (!formData.currentSeason) newErrors.currentSeason = 'Season is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add basic fields
      submitData.append('name', formData.name);
      if (formData.shortName) submitData.append('shortName', formData.shortName);
      if (formData.foundedYear) submitData.append('foundedYear', formData.foundedYear.toString());
      if (formData.league) submitData.append('league', formData.league);
      if (formData.homeVenue) submitData.append('homeVenue', formData.homeVenue);
      if (formData.currentSeason) submitData.append('currentSeason', formData.currentSeason);
      if (formData.website) submitData.append('website', formData.website);
      if (formData.email) submitData.append('email', formData.email);
      if (formData.phone) submitData.append('phone', formData.phone);
      
      // Add colors
      submitData.append('primaryColor', formData.colors[0]);
      submitData.append('secondaryColor', formData.colors[1]);
      
      // Add manager as JSON string
      if (formData.managerName) {
        submitData.append('manager', JSON.stringify({ name: formData.managerName }));
      }
      
      // Add address as JSON string
      submitData.append('address', JSON.stringify({
        city: formData.city || undefined,
        country: 'Ghana',
      }));
      
      // Add file uploads
      if (logoFile) {
        submitData.append('teamLogo', logoFile);
      }
      if (teamPhotoFile) {
        submitData.append('teamPhoto', teamPhotoFile);
      }

      await teamsApi.create(submitData);
      alert('Team created successfully!');
      router.push('/admin/teams');
    } catch (error: any) {
      console.error('Error creating team:', error);
      alert(error.response?.data?.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

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
                <h1 className="font-bold text-xl text-primary-green">Create New Team</h1>
                <p className="text-sm text-text-secondary">Add a new team to the league</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-md p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Team Name <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                    placeholder="e.g., Tumu Warriors"
                  />
                  {errors.name && <p className="text-status-error text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Short Name <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleChange}
                    maxLength={3}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.shortName ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                    placeholder="e.g., TUM"
                  />
                  {errors.shortName && <p className="text-status-error text-sm mt-1">{errors.shortName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    City <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.city ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                    placeholder="e.g., Tumu"
                  />
                  {errors.city && <p className="text-status-error text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    name="foundedYear"
                    value={formData.foundedYear}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                  />
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Home Venue <span className="text-status-error">*</span>
                  </label>
                  <select
                    name="homeVenue"
                    value={formData.homeVenue}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.homeVenue ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                  >
                    <option value="">Select venue</option>
                    {venues.map((venue) => (
                      <option key={venue._id} value={venue._id}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                  {errors.homeVenue && <p className="text-status-error text-sm mt-1">{errors.homeVenue}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Season <span className="text-status-error">*</span>
                  </label>
                  <select
                    name="currentSeason"
                    value={formData.currentSeason}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.currentSeason ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                  >
                    <option value="">Select season</option>
                    {seasons.map((season) => (
                      <option key={season._id} value={season._id}>
                        {season.name} {season.isCurrent ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                  {errors.currentSeason && <p className="text-status-error text-sm mt-1">{errors.currentSeason}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Manager/Coach Name
                  </label>
                  <input
                    type="text"
                    name="managerName"
                    value={formData.managerName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                    placeholder="e.g., John Doe"
                  />
                </div>
              </div>
            </div>

            {/* Team Colors */}
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Team Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.colors[0]}
                      onChange={(e) => handleColorChange(0, e.target.value)}
                      className="w-16 h-12 rounded border border-text-tertiary cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.colors[0]}
                      onChange={(e) => handleColorChange(0, e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                      placeholder="#059669"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.colors[1]}
                      onChange={(e) => handleColorChange(1, e.target.value)}
                      className="w-16 h-12 rounded border border-text-tertiary cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.colors[1]}
                      onChange={(e) => handleColorChange(1, e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Media */}
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Media</h3>
              <div className="space-y-6">
                <ImageUpload
                  label="Team Logo"
                  onImageChange={handleLogoChange}
                  error={errors.logo}
                  maxSize={5}
                />

                <ImageUpload
                  label="Team Photo (First Eleven)"
                  onImageChange={handleTeamPhotoChange}
                  error={errors.stadium}
                  maxSize={10}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                    placeholder="team@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                    placeholder="+233 XX XXX XXXX"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                    placeholder="https://example.com"
                  />
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
                {loading ? 'Creating...' : 'Create Team'}
              </button>
              <Link
                href="/admin/teams"
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
