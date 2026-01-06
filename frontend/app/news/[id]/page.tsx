'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, Calendar, User, Eye, Share2, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { newsApi } from '@/lib/api';
import { format } from 'date-fns';

export default function NewsDetailPage() {
  const params = useParams();
  const articleId = params.id as string;
  
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the main article
        const response = await newsApi.getById(articleId);
        
        // Backend returns { status, message, data: { news: {...} } }
        // So response.data = { news: {...} }
        let articleData = response.data.news;
        
        // Fallback: if news is wrapped again
        if (!articleData && response.data.data) {
          articleData = response.data.data.news || response.data.data;
        }
        
        if (!articleData) {
          throw new Error('Article not found');
        }
        
        setArticle(articleData);
        
        // Fetch related articles (same category or just latest)
        try {
          const relatedResponse = await newsApi.getAll({ limit: 3 });
          const allArticles = relatedResponse.data.data || [];
          // Filter out the current article
          const filtered = allArticles.filter((a: any) => a._id !== articleId);
          setRelatedArticles(filtered.slice(0, 3));
        } catch (err) {
          console.error('Error fetching related articles:', err);
          setRelatedArticles([]);
        }
      } catch (err: any) {
        console.error('Error fetching article:', err);
        setError(err.response?.data?.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !article) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The article you are looking for does not exist.'}</p>
            <Link href="/news" className="btn-primary">
              Back to News
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Calculate reading time (approx 200 words per minute)
  const wordCount = article.content?.split(/\s+/).length || 0;
  const readTime = wordCount > 0 ? Math.ceil(wordCount / 200) : 1;
  
  // Format category for display
  const categoryDisplay = article.category?.replace('_', ' ').toUpperCase() || 'NEWS';

  return (
    <MainLayout>
      {/* Back Button & Category */}
      <section className="bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <Link 
            href="/news" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to News</span>
          </Link>
          <div className="inline-block bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold ml-4">
            {categoryDisplay}
          </div>
        </div>
      </section>

      {/* Article Header */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-medium">{article.author?.name || 'Admin'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {(() => {
                    const date = article.publishedAt || article.createdAt;
                    if (!date) return 'N/A';
                    try {
                      return format(new Date(date), 'MMM dd, yyyy');
                    } catch (err) {
                      return 'N/A';
                    }
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{article.views || 0} views</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📖</span>
                <span>{readTime} min read</span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-gray-600 font-semibold">Share:</span>
              <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors">
                <LinkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {article.featuredImage && (
        <section className="bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Article Excerpt */}
      {article.excerpt && (
        <section className="bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-700 italic border-l-4 border-blue-500 pl-6">
                {article.excerpt}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div 
              className="prose prose-lg max-w-none"
              style={{
                fontSize: '18px',
                lineHeight: '1.8',
                color: '#374151',
                whiteSpace: 'pre-wrap'
              }}
            >
              {article.content ? (
                article.content.split('\n').map((paragraph: string, index: number) => (
                  paragraph.trim() && <p key={index} className="mb-4">{paragraph}</p>
                ))
              ) : (
                <p className="text-gray-500 italic">No content available</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <Link
                    key={related._id}
                    href={`/news/${related._id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={related.featuredImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop'}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                          {related.category?.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-red-500 transition-colors line-clamp-2">
                          {related.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {(() => {
                              const date = related.publishedAt || related.createdAt;
                              if (!date) return 'N/A';
                              try {
                                return format(new Date(date), 'MMM dd, yyyy');
                              } catch (err) {
                                return 'N/A';
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </MainLayout>
  );
}
