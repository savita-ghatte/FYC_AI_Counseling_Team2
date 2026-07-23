import { useState, useEffect } from 'react';
import { Search, GraduationCap, Coins, FolderOpen, Calendar, ExternalLink, ArrowRight, Award } from 'lucide-react';
import { api } from '../../utils/api';

export const ScholarshipDashboard = () => {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Central' | 'State' | 'Private' | 'Minority'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [matchProfile, setMatchProfile] = useState(false);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        setLoading(true);
        const endpoint = matchProfile ? '/scholarships/recommended' : '/scholarships';
        const res = await api.get(endpoint);
        
        let data = [];
        if (matchProfile && res.data.data.matches) {
          data = res.data.data.matches;
        } else {
          data = res.data.data || [];
        }
        
        setScholarships(data);
      } catch (err) {
        console.error('Failed to fetch scholarships', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchScholarships();
  }, [matchProfile]);

  const filteredScholarships = scholarships.filter(s => {
    const matchesFilter = filter === 'All' || s.type === filter;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.provider && s.provider.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">AI Scholarship Finder</h1>
          <p className="text-sm text-slate-500">Discover central, state-level, private and minority schemes that offset your tuition, exam, or hostel costs.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
          <Award size={18} />
          <span className="text-sm font-medium">Eligible Schemes matched: {filteredScholarships.length}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search scholarships..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm overflow-x-auto w-full md:w-auto">
          {['All', 'Central', 'State', 'Private', 'Minority'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-sm text-slate-600 font-medium">Show only matching my profile</span>
          <button 
            onClick={() => setMatchProfile(!matchProfile)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${matchProfile ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${matchProfile ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading scholarships...</div>
        ) : filteredScholarships.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">No scholarships found matching your criteria.</div>
        ) : (
          filteredScholarships.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-indigo-100 p-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">
                      {s.type} PROVIDER SCHEME
                    </span>
                  </div>
                  <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1 -mt-6 -mr-6">
                    <Award size={14} />
                    ELIGIBLE MATCH
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-6">{s.name}</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                      <GraduationCap size={16} className="text-amber-600" /> Eligibility Criteria
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{s.eligibilityCriteria}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                      <Coins size={16} className="text-emerald-500" /> Financial Benefits
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {s.amountMax ? `Up to ₹${s.amountMax.toLocaleString()} per year.` : 'Variable financial assistance.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                      <FolderOpen size={16} className="text-amber-500" /> Required Documents
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {s.requiredDocuments?.map((doc: string, i: number) => (
                        <span key={i} className="bg-slate-50 border border-slate-200 text-slate-500 px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-500">
                  <Calendar size={16} /> 
                  Deadline: {new Date(s.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} (Every Year)
                </div>
                
                <div className="flex items-center gap-4">
                  <a href={s.applicationUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                    <ExternalLink size={16} /> Official Portal
                  </a>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 px-5 rounded-lg transition-colors flex items-center gap-2">
                    How to Apply <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
