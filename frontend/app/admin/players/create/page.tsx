'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { playersApi, teamsApi } from '@/lib/api';

export default function CreatePlayerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: 'Ghana',
    position: '',
    jerseyNumber: '',
    currentTeam: '',
    height: '',
    weight: '',
    preferredFoot: 'Right',
    photo: '',
  });
  const [errors, setErrors] = useState<any>({});

  const positions = [
    { value: 'GK', label: 'Goalkeeper (GK)' },
    { value: 'CB', label: 'Center Back (CB)' },
    { value: 'LB', label: 'Left Back (LB)' },
    { value: 'RB', label: 'Right Back (RB)' },
    { value: 'CDM', label: 'Defensive Midfielder (CDM)' },
    { value: 'CM', label: 'Central Midfielder (CM)' },
    { value: 'CAM', label: 'Attacking Midfielder (CAM)' },
    { value: 'LM', label: 'Left Midfielder (LM)' },
    { value: 'RM', label: 'Right Midfielder (RM)' },
    { value: 'LW', label: 'Left Winger (LW)' },
    { value: 'RW', label: 'Right Winger (RW)' },
    { value: 'ST', label: 'Striker (ST)' },
    { value: 'CF', label: 'Center Forward (CF)' },
  ];

  useEffect(() => {
    checkAuth();
    fetchTeams();
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

  const fetchTeams = async () => {
    try {
      const response = await teamsApi.getAll();
      setTeams(response.data.data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
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
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.position) newErrors.position = 'Position is required';
    if (!formData.jerseyNumber) newErrors.jerseyNumber = 'Jersey number is required';
    if (!formData.currentTeam) newErrors.currentTeam = 'Team is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const submitData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        position: formData.position,
        jerseyNumber: parseInt(formData.jerseyNumber),
        currentTeam: formData.currentTeam,
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        preferredFoot: formData.preferredFoot,
        photo: formData.photo || undefined,
      };

      await playersApi.create(submitData);
      alert('Player created successfully!');
      router.push('/admin/players');
    } catch (error: any) {
      console.error('Error creating player:', error);
      alert(error.response?.data?.message || 'Failed to create player');
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
              <Link href="/admin/players" className="text-text-secondary hover:text-text-primary">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="font-bold text-xl text-primary-green">Create New Player</h1>
                <p className="text-sm text-text-secondary">Add a new player to the league</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-md p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    First Name <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.firstName ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                    placeholder="e.g., Mohammed"
                  />
                  {errors.firstName && <p className="text-status-error text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Last Name <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.lastName ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                    placeholder="e.g., Mensah"
                  />
                  {errors.lastName && <p className="text-status-error text-sm mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Date of Birth <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.dateOfBirth ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                  />
                  {errors.dateOfBirth && <p className="text-status-error text-sm mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Playing Information */}
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Playing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Position <span className="text-status-error">*</span>
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.position ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                  >
                    <option value="">Select position</option>
                    {positions.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                  {errors.position && <p className="text-status-error text-sm mt-1">{errors.position}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Jersey Number <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="number"
                    name="jerseyNumber"
                    value={formData.jerseyNumber}
                    onChange={handleChange}
                    min="1"
                    max="99"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.jerseyNumber ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                    placeholder="e.g., 10"
                  />
                  {errors.jerseyNumber && <p className="text-status-error text-sm mt-1">{errors.jerseyNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Current Team <span className="text-status-error">*</span>
                  </label>
                  <select
                    name="currentTeam"
                    value={formData.currentTeam}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.currentTeam ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                  >
                    <option value="">Select team</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  {errors.currentTeam && <p className="text-status-error text-sm mt-1">{errors.currentTeam}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Preferred Foot
                  </label>
                  <select
                    name="preferredFoot"
                    value={formData.preferredFoot}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                  >
                    <option value="Right">Right</option>
                    <option value="Left">Left</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Physical Attributes */}
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Physical Attributes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    min="150"
                    max="220"
                    className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                    placeholder="e.g., 180"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min="50"
                    max="120"
                    className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                    placeholder="e.g., 75"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Media</h3>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Photo URL
                </label>
                <input
                  type="url"
                  name="photo"
                  value={formData.photo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                  placeholder="https://example.com/photo.jpg"
                />
                <p className="text-sm text-text-secondary mt-1">
                  Or use UI Avatars: https://ui-avatars.com/api/?name=Player+Name
                </p>
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
                {loading ? 'Creating...' : 'Create Player'}
              </button>
              <Link
                href="/admin/players"
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
