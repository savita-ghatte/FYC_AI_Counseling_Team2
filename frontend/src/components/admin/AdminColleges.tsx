import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export const AdminColleges = () => {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await api.get('/admin/colleges');
        if (response.data.status === 'success') {
          setColleges(response.data.data.colleges || []);
        }
      } catch (error) {
        console.error('Failed to fetch colleges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">College Management</h1>
        <button className="btn-primary py-2 px-4 text-sm">+ Add College</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading colleges...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-semibold">College Name</th>
                <th className="p-4 font-semibold">State</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {colleges.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500">No colleges found.</td>
                </tr>
              ) : (
                colleges.map((college) => (
                  <tr key={college.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">{college.name}</td>
                    <td className="p-4 text-slate-600">{college.state}</td>
                    <td className="p-4 text-slate-600">{college.type}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Active</span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
