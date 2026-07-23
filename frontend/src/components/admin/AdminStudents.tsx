import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export const AdminStudents = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/admin/students');
        if (response.data.status === 'success') {
          setStudents(response.data.data.users || []);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Student Management</h1>
        <button className="btn-primary py-2 px-4 text-sm">Export CSV</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading students...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">State</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500">No students found.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">{student.profile?.fullName || 'N/A'}</td>
                    <td className="p-4 text-slate-600">{student.email}</td>
                    <td className="p-4 text-slate-600">{student.profile?.homeState || '-'}</td>
                    <td className="p-4">
                      {student.isVerified ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Verified</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Pending</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">View</button>
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">Ban</button>
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
