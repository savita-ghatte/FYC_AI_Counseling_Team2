import { useState, useEffect } from 'react';
import { Bell, Bookmark, MessageSquare, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export const StudentDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [savedColleges] = useState<any[]>([]); // Start empty

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/student/profile');
        setProfile(res.data.data.profile);
      } catch (err) {
        console.error('Error fetching profile', err);
      }
    };
    if (token) {
      fetchProfile();
      // Fetch saved colleges here if API exists, for now we leave it empty as per requirement
    }
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user?.fullName?.split(' ')[0] || profile?.fullName?.split(' ')[0] || 'Student'}! 👋</h1>
          <p className="text-slate-500">Here is your admission journey overview.</p>
        </div>
        <button onClick={() => navigate('/profile')} className="btn-secondary text-sm">Edit Profile</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/predictor')} className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-md text-left transition-transform hover:-translate-y-1">
              <Sparkles className="mb-4" size={28} />
              <h3 className="font-bold text-lg mb-1">AI Predictor</h3>
              <p className="text-indigo-100 text-sm">See where you can get admitted</p>
            </button>
            <button onClick={() => navigate('/scholarships')} className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-md text-left transition-transform hover:-translate-y-1">
              <TrendingUp className="mb-4" size={28} />
              <h3 className="font-bold text-lg mb-1">Scholarships</h3>
              <p className="text-emerald-100 text-sm">View AI matched grants</p>
            </button>
          </div>

          {/* Saved Colleges */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Bookmark size={20} className="text-blue-500" /> Saved Colleges</h3>
              <button onClick={() => navigate('/colleges')} className="text-sm text-blue-600 font-medium">Browse All</button>
            </div>
            <div className="space-y-3">
              {savedColleges.length > 0 ? (
                savedColleges.map((c, i) => (
                  <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors cursor-pointer">
                    <div>
                      <h4 className="font-bold text-slate-700">{c.name}</h4>
                      <p className="text-xs text-slate-500">{c.branch}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md">{c.match} Match</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-sm text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  You haven't saved any colleges yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4"><Bell size={20} className="text-amber-500" /> Notifications</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-slate-100 shadow-sm bg-white">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-slate-900 text-sm">New Scholarship</div>
                    <time className="text-xs text-emerald-500 font-medium">Just now</time>
                  </div>
                  <div className="text-slate-500 text-xs">AI matched you with a new grant!</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Chat History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><MessageSquare size={20} className="text-purple-500" /> AI Chats</h3>
              <button onClick={() => navigate('/ai-counsellor')} className="text-sm text-purple-600 font-medium">New Chat</button>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-100">
                <span className="block text-xs font-bold text-slate-400 mb-1">Yesterday</span>
                "What are my chances for NIT Trichy CSE?"
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
