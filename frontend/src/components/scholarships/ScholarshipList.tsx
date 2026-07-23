import { useState } from 'react';
import { Calendar, FileText, CheckCircle2 } from 'lucide-react';

export const ScholarshipList = () => {
  const [filter, setFilter] = useState<'All' | 'Government' | 'Private'>('All');
  
  // Mock data as DB is empty
  const [scholarships] = useState<any[]>([
    {
      id: '1',
      name: 'Post Matric Scholarship for Minorities',
      provider: 'Ministry of Minority Affairs',
      type: 'Government',
      amountMax: 10000,
      eligibilityCriteria: 'Students belonging to minority communities with 50% marks.',
      requiredDocuments: ['Income Certificate', 'Aadhar Card', 'Previous Marksheet'],
      deadline: '2027-10-31',
    },
    {
      id: '2',
      name: 'Reliance Foundation Undergraduate Scholarships',
      provider: 'Reliance Foundation',
      type: 'Private',
      amountMax: 200000,
      eligibilityCriteria: 'Meritorious students pursuing UG courses.',
      requiredDocuments: ['12th Marksheet', 'College ID', 'Income Proof'],
      deadline: '2027-12-15',
    },
    {
      id: '3',
      name: 'Central Sector Scheme of Scholarships',
      provider: 'Department of Higher Education',
      type: 'Government',
      amountMax: 20000,
      eligibilityCriteria: 'Above 80th percentile of successful candidates in relevant stream.',
      requiredDocuments: ['Aadhar Card', 'Bank Passbook', 'Income Certificate'],
      deadline: '2027-11-30',
    }
  ]);

  const filtered = filter === 'All' ? scholarships : scholarships.filter(s => s.type === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Browse Directory</h2>
        <div className="flex gap-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="input-field py-1.5 min-w-[150px]"
          >
            <option value="All">All Types</option>
            <option value="Government">Government Only</option>
            <option value="Private">Private Only</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold mb-2 ${s.type === 'Government' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                  {s.type}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{s.name}</h3>
                <p className="text-sm text-slate-500">{s.provider}</p>
              </div>
              <div className="text-right">
                <span className="block text-xl font-bold text-emerald-600">₹{s.amountMax.toLocaleString()}</span>
                <span className="text-xs text-slate-400">Max Amount</span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <CheckCircle2 size={16} className="text-emerald-500" /> Eligibility
              </h4>
              <p className="text-sm text-slate-600">{s.eligibilityCriteria}</p>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                <FileText size={16} className="text-blue-500" /> Required Documents
              </h4>
              <div className="flex flex-wrap gap-2">
                {s.requiredDocuments.map((doc: string, i: number) => (
                  <span key={i} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{doc}</span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                <Calendar size={16} /> 
                Deadline: {new Date(s.deadline).toLocaleDateString()}
              </div>
              <button className="btn-secondary py-1.5 px-4 text-sm">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
