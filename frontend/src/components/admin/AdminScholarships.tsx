import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { api } from '../../utils/api';
import type { Scholarship } from '../../types/scholarship';

export const AdminScholarships = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Basic implementation for prototype
  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const res = await api.get('/scholarships');
      setScholarships(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this scholarship?')) return;
    try {
      await api.delete(`/admin/scholarships/${id}`);
      fetchScholarships();
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  const handleCreateMock = async () => {
    try {
      const mockData = {
        name: "MahaDBT Rajarshi Chhatrapati Shahu Maharaj Scheme " + Math.floor(Math.random() * 100),
        provider: "MahaDBT",
        category: "EBC",
        type: "Government",
        amountMax: 50000,
        incomeLimit: 800000,
        eligibilityCriteria: "Must be a resident of Maharashtra admitted through CAP rounds with family income less than 8 Lakhs.",
        applicableCourses: ["B.Tech", "B.E."],
        stateEligibility: ["Maharashtra"],
        minorityEligibility: false,
        casteEligibility: ["OPEN", "EWS"],
        genderEligibility: "All",
        pwdEligibility: false,
        applicationMode: "Online",
        applicationUrl: "https://mahadbt.maharashtra.gov.in",
        status: "Open",
        requiredDocuments: ["Income Certificate", "Domicile Certificate", "CAP Allotment Letter"],
        isActive: true
      };
      
      await api.post('/admin/scholarships', mockData);
      fetchScholarships();
    } catch (err) {
      console.error(err);
      alert('Failed to create mock data');
    }
  };

  const filtered = scholarships.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.provider && s.provider.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Scholarships</h1>
          <p className="text-slate-500 text-sm">Add, update, or remove scholarships from the MahaDBT and Buddy4Study databases.</p>
        </div>
        <button 
          onClick={handleCreateMock}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus size={18} /> Add Mock Scholarship
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-sm font-medium text-slate-500">Total: {filtered.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Scholarship Name</th>
                <th className="px-6 py-4 font-semibold">Provider</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Income Limit</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">No scholarships found.</td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{s.name}</td>
                    <td className="px-6 py-4 text-slate-600">{s.provider || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${s.status === 'Open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{s.incomeLimit ? `₹${(s.incomeLimit/100000).toFixed(1)}L` : 'None'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
