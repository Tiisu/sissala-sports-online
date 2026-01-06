'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { newsApi, teamsApi } from '@/lib/api';

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
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
    fetchData();
  }, [newsId]);

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
      const [newsRes, teamsRes] = await Promise.all([
        newsApi.getById(newsId),
        teamsApi.getAll(),
      ]);
      
      console.log('News API Response:', newsRes.data);
      console.log('Teams API Response:', teamsRes.data);
      
      // Backend returns { status, message, data: { news: {...} } }
      // So newsRes.data = { news: {...} }
      // We need to access newsRes.data.news directly
      let article = newsRes.data.news;
      
      // Fallback: if news is wrapped again (newsRes.data = { data: { news } })
      if (!article && newsRes.data.data) {
        article = newsRes.data.data.news || newsRes.data.data;
      }
      
      console.log('Extracted article:', article);
      
      if (!article) {
        console.error('Article is null or undefined');
        throw new Error('News article not found');
      }
      
      const newFormData = {
        title: article.title || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        category: article.category || 'general',
        featuredImage: article.featuredImage || '',
        tags: article.tags ? article.tags.join(', ') : '',
        relatedTeam: article.relatedTeam?._id || article.relatedTeam || '',
        isFeatured: article.isFeatured || false,
        status: article.status || 'published',
      };
      
      console.log('Setting form data:', newFormData);
      setFormData(newFormData);
      
      // Set image preview if featuredImage exists
      if (article.featuredImage) {
        setImagePreview(article.featuredImage);
      }
      
      // Teams API uses sendPaginated which returns { data: [...] } directly
      const teamsList = teamsRes.data.data || teamsRes.data || [];
      console.log('Teams list:', teamsList);
      setTeams(teamsList);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load news article');
      router.push('/admin/news');
    } finally {
      setLoading(false);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      setSaving(true);
      
      // Use FormData if there's an image file to upload
      if (imageFile) {
        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('excerpt', formData.excerpt);
        submitData.append('content', formData.content);
        submitData.append('category', formData.category);
        submitData.append('isFeatured', formData.isFeatured.toString());
        submitData.append('status', formData.status);
        
        if (formData.tags) {
          formData.tags.split(',').map(t => t.trim()).forEach(tag => {
            submitData.append('tags[]', tag);
          });
        }
        
        if (formData.relatedTeam) {
          submitData.append('relatedTeam', formData.relatedTeam);
        }
        
        // Append the image file
        submitData.append('newsImage', imageFile);
        
        await newsApi.update(newsId, submitData);
      } else {
        // Use JSON if no image file
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

        await newsApi.update(newsId, submitData);
      }
      
      alert('News article updated successfully!');
      router.push('/admin/news');
    } catch (error: any) {
      console.error('Error updating news:', error);
      alert(error.response?.data?.message || 'Failed to update news article');
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
              <Link href="/admin/news" className="text-text-secondary hover:text-text-primary">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="font-bold text-xl text-primary-green">Edit News Article</h1>
                <p className="text-sm text-text-secondary">Update article information</p>
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
                  />
                  {errors.content && <p className="text-status-error text-sm mt-1">{errors.content}</p>}
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
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Media</h3>
              
              {/* Upload New Image */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Upload New Featured Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                />
                <p className="text-sm text-text-secondary mt-1">
                  Upload a new image (PNG, JPG, or GIF). This will replace the current featured image.
                </p>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    {imageFile ? 'New Image Preview' : 'Current Featured Image'}
                  </label>
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-md h-48 rounded-lg object-cover border"
                    />
                    {imageFile && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        New Image Selected
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Or Use URL (Optional) */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Or Enter Image URL
                </label>
                <input
                  type="url"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
                  disabled={!!imageFile}
                />
                <p className="text-sm text-text-secondary mt-1">
                  {imageFile ? 'Clear the file upload above to use a URL instead.' : 'Enter an image URL if you prefer not to upload a file.'}
                </p>
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
                    Feature this article
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
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

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
