import { useState, useEffect } from 'react';
import { Users, Building, GraduationCap, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import axios from 'axios';

const data = [
  { name: 'Jan', users: 400 },
  { name: 'Feb', users: 300 },
  { name: 'Mar', users: 200 },
  { name: 'Apr', users: 278 },
  { name: 'May', users: 189 },
  { name: 'Jun', users: 239 },
  { name: 'Jul', users: 349 },
];

export const AdminOverview = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // In real app:
    // axios.get('/api/admin/stats').then(res => setStats(res.data.data));

    // Mock stats
    setTimeout(() => {
      setStats({
        totalUsers: 1250,
        totalColleges: 84,
        totalScholarships: 45,
        verifiedUsers: 1100
      });
    }, 500);
  }, []);

  if (!stats) return <div className="text-center py-10 text-slate-500">Loading Dashboard...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Platform Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Users</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalUsers}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Verified Students</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.verifiedUsers}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Active Colleges</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalColleges}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <Building size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Scholarships</p>
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalScholarships}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <GraduationCap size={24} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">User Growth Analytics</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="users" stroke="#4F46E5" fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
