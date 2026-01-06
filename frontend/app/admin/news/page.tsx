'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Newspaper, Plus, Edit, Trash2, Search, ArrowLeft, Eye } from 'lucide-react';
import { newsApi } from '@/lib/api';
import { format } from 'date-fns';

export default function AdminNewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'editor') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    fetchNews();
  }, [router]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsApi.getAll();
      setNews(response.data.data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const badges: any = {
      match_report: 'bg-blue-100 text-blue-700',
      transfer: 'bg-green-100 text-green-700',
      interview: 'bg-purple-100 text-purple-700',
      announcement: 'bg-orange-100 text-orange-700',
      injury: 'bg-red-100 text-red-700',
      general: 'bg-gray-100 text-gray-700',
    };
    return badges[category] || 'bg-gray-100 text-gray-700';
  };

  const filteredNews = news.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
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
              <Link href="/admin" className="text-text-secondary hover:text-text-primary">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="font-bold text-xl text-primary-green">Manage News</h1>
                <p className="text-sm text-text-secondary">View and manage news articles</p>
              </div>
            </div>
            <Link href="/admin/news/create" className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add News</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-text-tertiary focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
            />
          </div>
        </div>

        {/* News List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary text-lg">No news articles found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNews.map((article) => (
              <div
                key={article._id}
                className="bg-surface rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  {/* Featured Image */}
                  {article.featuredImage && (
                    <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-background-light flex-shrink-0">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-text-primary mb-2 truncate">
                          {article.title}
                        </h3>
                        <p className="text-sm text-text-secondary line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadge(article.category)}`}>
                        {article.category.replace('_', ' ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.views || 0} views
                      </span>
                      <span>
                        {article.publishedAt
                          ? format(new Date(article.publishedAt), 'MMM dd, yyyy')
                          : 'Draft'}
                      </span>
                      {article.isFeatured && (
                        <span className="px-2 py-1 rounded bg-primary-yellow text-text-primary text-xs font-semibold">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col items-center gap-2">
                    <Link
                      href={`/admin/news/${article._id}/edit`}
                      className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-primary-green text-white hover:bg-primary-green/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          if (confirm(`⚠️ Are you sure you want to delete this article?\n\n"${article.title}"\n\nThis action cannot be undone!`)) {
                            newsApi.delete(article._id)
                              .then(() => {
                                alert('✅ News article deleted successfully!');
                                fetchNews();
                              })
                              .catch((error: any) => {
                                alert(`❌ Failed to delete article: ${error.response?.data?.message || 'Unknown error'}`);
                              });
                          }
                        }}
                        className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-status-error text-status-error hover:bg-status-error hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 bg-surface rounded-xl shadow-md p-6">
          <h3 className="font-bold text-lg text-text-primary mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-green">{news.length}</p>
              <p className="text-sm text-text-secondary">Total Articles</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-green">
                {news.filter((n) => n.status === 'published').length}
              </p>
              <p className="text-sm text-text-secondary">Published</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-green">
                {news.filter((n) => n.isFeatured).length}
              </p>
              <p className="text-sm text-text-secondary">Featured</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-green">
                {news.reduce((sum, n) => sum + (n.views || 0), 0)}
              </p>
              <p className="text-sm text-text-secondary">Total Views</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
