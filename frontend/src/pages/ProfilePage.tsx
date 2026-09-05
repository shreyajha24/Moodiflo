import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Globe, Shield, Heart, ListMusic, History, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { EmptyState } from '../components/common/EmptyState';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <EmptyState
        icon={User}
        title="Profile Details"
        description="Please sign in to view your profile settings, preferences, and personal statistics."
        actionText="Sign In"
        onAction={() => navigate('/login')}
      />
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Profile Card */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-1 flex-shrink-0 shadow-xl shadow-violet-900/30">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-[#12141c] rounded-full flex items-center justify-center text-3xl font-extrabold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{user.name}</h1>
              {user.role && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30 w-fit mx-auto sm:mx-0">
                  <Shield className="w-3.5 h-3.5" />
                  {user.role}
                </span>
              )}
            </div>

            <p className="text-sm text-slate-400 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              {user.email}
            </p>

            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-2">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              Preferred Language: <span className="text-slate-200 font-medium capitalize">{user.preferredLanguage || 'English'}</span>
            </p>
          </div>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer self-center sm:self-start"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Your Moodify Activity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/favorites')}
            className="glass-panel-hover p-6 rounded-2xl text-left group transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              Favorites
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">Quickly access all your loved tracks.</p>
          </button>

          <button
            onClick={() => navigate('/playlists')}
            className="glass-panel-hover p-6 rounded-2xl text-left group transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 text-violet-400 group-hover:scale-110 transition-transform">
              <ListMusic className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              Playlists
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">Manage custom mixes and playlists.</p>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="glass-panel-hover p-6 rounded-2xl text-left group transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              History
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">View recently streamed music sessions.</p>
          </button>
        </div>
      </div>
    </div>
  );
};
