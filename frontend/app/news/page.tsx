'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Search, Filter, Calendar, User, ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { newsApi } from '@/lib/api';
import { format } from 'date-fns';

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: 'all', label: 'All News' },
    { value: 'match_report', label: 'Match Reports' },
    { value: 'transfer', label: 'Transfers' },
    { value: 'injury', label: 'Injuries' },
    { value: 'announcement', label: 'Announcements' },
    { value: 'interview', label: 'Interviews' },
    { value: 'general', label: 'General' },
  ];

  // Fetch news from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        let response;
        
        if (selectedCategory === 'all') {
          response = await newsApi.getAll({ limit: 50 });
        } else {
          response = await newsApi.getByCategory(selectedCategory);
        }
        
        // Backend returns different structures: getAll returns paginated data, getByCategory returns {news: [...]}
        const data = response.data.data?.news || response.data.data;
        setNewsArticles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNewsArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCategory]);


  // When we fetch by category from the API, the results are already filtered
  // We only need to apply search filter
  const filteredNews = Array.isArray(newsArticles) ? newsArticles.filter((article) => {
    const matchesSearch = searchQuery === '' || 
                         article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) : [];

  const featuredArticle = filteredNews.find(article => article.featured);
  const regularArticles = filteredNews.filter(article => !article.featured);

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
              <span>📰</span>
              <span>Latest Updates</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">News & Updates</h1>
            <p className="text-xl text-white/90">
              Stay updated with the latest news, match reports, and exclusive interviews
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-white py-8 -mt-8 relative z-10 shadow-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search news articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1a2c4e] focus:outline-none transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1a2c4e] focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="text-4xl mb-4">📰</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading news...</h2>
            <p className="text-gray-600">Please wait</p>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && filteredNews.length === 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="text-6xl mb-4">📰</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No News Found</h2>
            <p className="text-gray-600">Try adjusting your search or filter</p>
          </div>
        </section>
      )}

      {/* Featured Article */}
      {!loading && featuredArticle && selectedCategory === 'all' && !searchQuery && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Story</h2>
            <Link href={`/news/${featuredArticle._id}`} className="group">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* Image */}
                  <div className="relative h-64 lg:h-auto">
                    <img
                      src={featuredArticle.featuredImage || featuredArticle.image}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col justify-between">
                    <div>
                      <span className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                        {featuredArticle.category}
                      </span>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-red-500 transition-colors">
                        {featuredArticle.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {featuredArticle.excerpt}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{featuredArticle.author?.name || featuredArticle.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(featuredArticle.publishedAt || featuredArticle.createdAt), "MMM dd, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{featuredArticle.views}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-red-500 font-semibold">
                        <span>Read Full Story</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* News Grid */}
      {!loading && regularArticles.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedCategory === 'all' ? 'Latest News' : categories.find(c => c.value === selectedCategory)?.label}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article) => (
              <Link
                key={article._id}
                href={`/news/${article._id}`}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden h-full flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={article.featuredImage || article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {article.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-500 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                      {article.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{article.author?.name || article.author}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(article.publishedAt || article.createdAt), "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{article.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}
    </MainLayout>
  );
}
