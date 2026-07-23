import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Building, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

export const CollegeSearch = () => {
  const [colleges, setColleges] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [state, setState] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [maxFee, setMaxFee] = useState('');
  const [branch, setBranch] = useState('');

  const fetchColleges = async () => {
    setLoading(true);
    try {
      let url = `/colleges?page=${page}&limit=10`;
      if (query) url += `&query=${query}`;
      if (state) url += `&state=${state}`;
      if (type) url += `&type=${type}`;
      if (maxFee) url += `&maxFee=${maxFee}`;
      if (branch) url += `&branch=${branch}`;
      
      const res = await api.get(url);
      setColleges(res.data.data.colleges);
      setTotalPages(res.data.data.pagination.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [page, state, type, maxFee, branch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchColleges();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Filter size={20} /> Filters
        </h2>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Institution Type</label>
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Types</option>
            <option value="Government">Government</option>
            <option value="Private">Private</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
          <select value={state} onChange={(e) => { setState(e.target.value); setPage(1); }} className="input-field">
            <option value="">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Branch / Specialization</label>
          <input 
            type="text" 
            placeholder="e.g. CSE, ECE" 
            value={branch}
            onChange={(e) => { setBranch(e.target.value); setPage(1); }}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Max Tuition Fee (₹)</label>
          <input 
            type="number" 
            placeholder="e.g. 200000" 
            value={maxFee}
            onChange={(e) => { setMaxFee(e.target.value); setPage(1); }}
            className="input-field"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search colleges by name or city..." 
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="btn-primary py-3 px-6 rounded-lg">Search</button>
        </form>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading colleges...</div>
        ) : (
          <div className="space-y-4">
            {colleges.map((college) => (
              <div 
                key={college.id} 
                onClick={() => navigate(`/colleges/${college.id}`)}
                className="card p-6 hover:shadow-md cursor-pointer transition-shadow flex flex-col md:flex-row justify-between gap-4"
              >
                <div>
                  <h3 className="text-xl font-bold text-blue-900">{college.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1"><MapPin size={16} /> {college.city}, {college.state}</span>
                    <span className="flex items-center gap-1"><Building size={16} /> {college.type}</span>
                    {college.nirfRank && <span className="flex items-center gap-1"><GraduationCap size={16} /> NIRF: {college.nirfRank}</span>}
                  </div>
                </div>
                {college.courses && college.courses.length > 0 && (
                  <div className="text-right flex flex-col justify-center">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Avg Fees</span>
                    <span className="text-xl font-bold text-emerald-600">₹{college.courses[0].tuitionFee?.toLocaleString() ?? 'N/A'}</span>
                  </div>
                )}
              </div>
            ))}

            {colleges.length === 0 && (
              <div className="text-center py-10 text-slate-500">No colleges found matching your criteria.</div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="p-2 border border-slate-300 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-slate-700">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="p-2 border border-slate-300 rounded-lg disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
