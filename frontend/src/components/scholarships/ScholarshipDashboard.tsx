import { useState, useEffect } from 'react';
import { Search, GraduationCap, Filter, Grid, List, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../../utils/api';
import { ScholarshipCard } from './ScholarshipCard';
import type { Scholarship, ScholarshipMatch } from '../../types/scholarship';

export const ScholarshipDashboard = () => {
  const [eligible, setEligible] = useState<ScholarshipMatch[]>([]);
  const [partiallyEligible, setPartiallyEligible] = useState<ScholarshipMatch[]>([]);
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [providerFilter, setProviderFilter] = useState<'All' | 'MahaDBT' | 'Buddy4Study' | 'NSP'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'Grid' | 'List'>('Grid');
  const [showMatchesOnly, setShowMatchesOnly] = useState(true);

  useEffect(() => {
    fetchData();
  }, [showMatchesOnly]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (showMatchesOnly) {
        const res = await api.get('/scholarships/recommended');
        setEligible(res.data.data.eligible || []);
        setPartiallyEligible(res.data.data.partiallyEligible || []);
      } else {
        const res = await api.get('/scholarships');
        setAllScholarships(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch scholarships', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (list: any[]) => {
    return list.filter(s => {
      const matchesProvider = providerFilter === 'All' || s.provider === providerFilter;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (s.provider && s.provider.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesProvider && matchesSearch;
    });
  };

  const filteredEligible = applyFilters(eligible);
  const filteredPartially = applyFilters(partiallyEligible);
  const filteredAll = applyFilters(allScholarships);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Scholarship Finder</h1>
          <p className="text-sm text-slate-500 max-w-2xl">Discover and apply for scholarships across MahaDBT, Buddy4Study, and NSP. We automatically match you based on your profile.</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
          <span className="text-sm font-medium text-slate-700">AI Matching</span>
          <button 
            onClick={() => setShowMatchesOnly(!showMatchesOnly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showMatchesOnly ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showMatchesOnly ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search scholarships..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <Filter size={18} /> Provider:
          </div>
          <div className="flex bg-slate-100 rounded-lg p-1">
            {['All', 'MahaDBT', 'Buddy4Study', 'NSP'].map((f) => (
              <button
                key={f}
                onClick={() => setProviderFilter(f as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  providerFilter === f ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="hidden md:flex bg-slate-100 rounded-lg p-1 ml-4">
            <button onClick={() => setViewMode('Grid')} className={`p-1.5 rounded-md ${viewMode === 'Grid' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
              <Grid size={18} />
            </button>
            <button onClick={() => setViewMode('List')} className={`p-1.5 rounded-md ${viewMode === 'List' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : showMatchesOnly ? (
        <div className="space-y-12">
          {/* Fully Eligible */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="text-emerald-500 h-6 w-6" />
              <h2 className="text-xl font-bold text-slate-900">100% Eligible Matches ({filteredEligible.length})</h2>
            </div>
            
            {filteredEligible.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">No fully eligible scholarships found for your profile.</div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'Grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredEligible.map(s => <ScholarshipCard key={s.id} scholarship={s} viewMode={viewMode} matchType="Eligible" />)}
              </div>
            )}
          </section>

          {/* Partially Eligible */}
          {filteredPartially.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="text-amber-500 h-6 w-6" />
                <h2 className="text-xl font-bold text-slate-900">Partially Eligible / Check Details ({filteredPartially.length})</h2>
              </div>
              <div className={`grid gap-6 ${viewMode === 'Grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredPartially.map(s => <ScholarshipCard key={s.id} scholarship={s} viewMode={viewMode} matchType="Partial" />)}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* All Scholarships */
        <section>
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="text-indigo-600 h-6 w-6" />
            <h2 className="text-xl font-bold text-slate-900">All Scholarships ({filteredAll.length})</h2>
          </div>
          {filteredAll.length === 0 ? (
             <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">No scholarships found.</div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'Grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredAll.map(s => <ScholarshipCard key={s.id} scholarship={s} viewMode={viewMode} />)}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
