'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { newsApi, teamsApi } from '@/lib/api';

export default function CreateNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'general',
    featuredImage: '',
    tags: '',
    relatedTeam: '',
    isFeatured: false,
    status: 'published',
  });
  const [errors, setErrors] = useState<any>({});

  const categories = [
    { value: 'match_report', label: 'Match Report' },
    { value: 'transfer', label: 'Transfer News' },
    { value: 'interview', label: 'Interview' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'injury', label: 'Injury Update' },
    { value: 'general', label: 'General News' },
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
    if (user.role !== 'admin' && user.role !== 'editor') {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const submitData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        featuredImage: formData.featuredImage || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        relatedTeam: formData.relatedTeam || undefined,
        isFeatured: formData.isFeatured,
        status: formData.status,
      };

      await newsApi.create(submitData);
      alert('News article created successfully!');
      router.push('/admin/news');
    } catch (error: any) {
      console.error('Error creating news:', error);
      alert(error.response?.data?.message || 'Failed to create news article');
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
              <Link href="/admin/news" className="text-text-secondary hover:text-text-primary">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="font-bold text-xl text-primary-green">Create News Article</h1>
                <p className="text-sm text-text-secondary">Publish a new news article</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-md p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Article Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Title <span className="text-status-error">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.title ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                    placeholder="e.g., Tumu Warriors Win Derby Match"
                  />
                  {errors.title && <p className="text-status-error text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Excerpt <span className="text-status-error">*</span>
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.excerpt ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none`}
                    placeholder="Brief summary of the article (2-3 sentences)"
                  />
                  {errors.excerpt && <p className="text-status-error text-sm mt-1">{errors.excerpt}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Content <span className="text-status-error">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={12}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.content ? 'border-status-error' : 'border-text-tertiary'
                    } focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none font-mono text-sm`}
                    placeholder="Full article content (HTML supported: <p>, <h2>, <strong>, <em>, <ul>, <ol>, etc.)"
                  />
                  {errors.content && <p className="text-status-error text-sm mt-1">{errors.content}</p>}
                  <p className="text-sm text-text-secondary mt-1">
                    You can use HTML tags for formatting. Example: &lt;p&gt;Your text&lt;/p&gt;
                  </p>
                </div>
              </div>
            </div>

            {/* Category & Metadata */}
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Category & Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Related Team
                  </label>
                  <select
                    name="relatedTeam"
                    value={formData.relatedTeam}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                  >
                    <option value="">None</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                    placeholder="e.g., football, derby, victory (comma-separated)"
                  />
                  <p className="text-sm text-text-secondary mt-1">
                    Separate tags with commas
                  </p>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Media</h3>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-text-secondary mt-1">
                  Use Unsplash: https://source.unsplash.com/800x600/?football,soccer
                </p>
                {formData.featuredImage && (
                  <div className="mt-3">
                    <img
                      src={formData.featuredImage}
                      alt="Preview"
                      className="w-full max-w-md h-48 rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Publishing Options */}
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Publishing Options</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-text-tertiary text-primary-green focus:ring-primary-green"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-text-primary cursor-pointer">
                    Feature this article (will appear in featured section)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                  >
                    <option value="published">Publish Now</option>
                    <option value="draft">Save as Draft</option>
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
                {loading ? 'Creating...' : formData.status === 'published' ? 'Publish Article' : 'Save Draft'}
              </button>
              <Link
                href="/admin/news"
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
