import { FileText, Download, TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const userGrowthData = [
  { name: 'Jan', users: 400 },
  { name: 'Feb', users: 600 },
  { name: 'Mar', users: 850 },
  { name: 'Apr', users: 1100 },
  { name: 'May', users: 1450 },
  { name: 'Jun', users: 1800 },
  { name: 'Jul', users: 2200 },
];

const aiUsageData = [
  { name: 'Mon', queries: 120 },
  { name: 'Tue', queries: 150 },
  { name: 'Wed', queries: 180 },
  { name: 'Thu', queries: 140 },
  { name: 'Fri', queries: 210 },
  { name: 'Sat', queries: 280 },
  { name: 'Sun', queries: 250 },
];

export const AdminReports = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
        <button className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Download size={16} /> Export All
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-96">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">User Growth</h3>
              <p className="text-sm text-slate-500">Monthly student registrations in 2027</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                />
                <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Usage Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-96">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">AI Usage Frequency</h3>
              <p className="text-sm text-slate-500">Daily queries to the AI Counsellor</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="queries" fill="#9333ea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
