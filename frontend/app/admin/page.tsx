'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Shield,
  Newspaper,
  Calendar,
  Trophy,
  UserCircle,
  Image,
  Settings,
  BarChart3,
  FileText,
  LogOut,
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    teams: 0,
    players: 0,
    matches: 0,
    news: 0,
    users: 0,
  });

  useEffect(() => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'editor') {
      alert('Access denied. Admin or Editor privileges required.');
      router.push('/');
      return;
    }

    setUser(parsedUser);
    
    // Load stats (would normally come from API)
    setStats({
      teams: 12,
      players: 240,
      matches: 15,
      news: 10,
      users: 3,
    });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  const adminMenuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin',
      description: 'Overview and statistics',
    },
    {
      title: 'Teams',
      icon: Shield,
      href: '/admin/teams',
      description: 'Manage teams',
    },
    {
      title: 'Players',
      icon: Users,
      href: '/admin/players',
      description: 'Manage players',
    },
    {
      title: 'Matches',
      icon: Calendar,
      href: '/admin/matches',
      description: 'Manage matches',
    },
    {
      title: 'News',
      icon: Newspaper,
      href: '/admin/news',
      description: 'Manage news articles',
    },
    {
      title: 'Seasons',
      icon: Trophy,
      href: '/admin/seasons',
      description: 'Manage seasons',
    },
    {
      title: 'Users',
      icon: UserCircle,
      href: '/admin/users',
      description: 'Manage users',
      adminOnly: true,
    },
    {
      title: 'Media',
      icon: Image,
      href: '/admin/media',
      description: 'Media library',
    },
    {
      title: 'Statistics',
      icon: BarChart3,
      href: '/admin/statistics',
      description: 'View reports',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/admin/settings',
      description: 'System settings',
      adminOnly: true,
    },
  ];

  const statCards = [
    { label: 'Total Teams', value: stats.teams, icon: Shield, color: 'bg-blue-500' },
    { label: 'Total Players', value: stats.players, icon: Users, color: 'bg-green-500' },
    { label: 'Matches', value: stats.matches, icon: Calendar, color: 'bg-purple-500' },
    { label: 'News Articles', value: stats.news, icon: Newspaper, color: 'bg-orange-500' },
    { label: 'Users', value: stats.users, icon: UserCircle, color: 'bg-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-background-light">
      {/* Admin Header */}
      <header className="bg-surface shadow-md sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                  ⚽
                </div>
                <div>
                  <h1 className="font-bold text-lg text-primary-green">Admin Panel</h1>
                  <p className="text-xs text-text-secondary">Sissala Football League</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-text-secondary capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-status-error text-white hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-text-secondary">
            Manage your football league content and settings from here.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-surface rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-text-secondary text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-text-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {adminMenuItems
              .filter((item) => !item.adminOnly || user.role === 'admin')
              .map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="bg-surface rounded-xl shadow-md p-6 hover:shadow-lg hover:scale-105 transition-all group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                      <item.icon className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-text-primary mb-1">{item.title}</h4>
                    <p className="text-sm text-text-secondary">{item.description}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-background-light">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-text-primary">Database seeded successfully</p>
                <p className="text-sm text-text-secondary">12 teams, 240 players added</p>
              </div>
              <span className="text-sm text-text-secondary">Just now</span>
            </div>
            <div className="flex items-center gap-4 pb-4 border-b border-background-light">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-text-primary">15 matches created</p>
                <p className="text-sm text-text-secondary">Including 1 live match</p>
              </div>
              <span className="text-sm text-text-secondary">Just now</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <Newspaper className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-text-primary">10 news articles published</p>
                <p className="text-sm text-text-secondary">Various categories</p>
              </div>
              <span className="text-sm text-text-secondary">Just now</span>
            </div>
          </div>
        </div>

        {/* Back to Site */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-green hover:text-primary-green/80 font-medium transition-colors"
          >
            ← Back to Main Site
          </Link>
        </div>
      </main>
    </div>
  );
}
