import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Bookmark, ExternalLink, Calendar, MapPin, Briefcase, GraduationCap, Coins, Users, FileText, Phone, Mail } from 'lucide-react';
import { api } from '../../utils/api';
import type { Scholarship } from '../../types/scholarship';

export const ScholarshipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/scholarships/${id}`);
      setScholarship(res.data.data);
      
      // Check if saved
      const savedRes = await api.get('/scholarships/student/saved');
      const isSaved = savedRes.data.data.some((s: any) => s.id === id);
      setSaved(isSaved);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async () => {
    try {
      setSaving(true);
      await api.post(`/scholarships/${id}/save`);
      setSaved(!saved);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Scholarship Not Found</h2>
        <button onClick={() => navigate('/scholarships')} className="mt-4 text-indigo-600 hover:underline">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <button 
        onClick={() => navigate('/scholarships')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Scholarships
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 p-8 md:p-10 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 opacity-10">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="100" fill="white"/>
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                  {scholarship.provider || 'General'}
                </span>
                <span className="bg-indigo-500/50 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm border border-indigo-400">
                  {scholarship.status}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{scholarship.name}</h1>
              <p className="text-indigo-100 max-w-2xl text-sm md:text-base">{scholarship.eligibilityCriteria}</p>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
              <a 
                href={scholarship.applicationUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-indigo-900 text-center font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Apply Now <ExternalLink size={18} />
              </a>
              <button 
                onClick={toggleSave}
                disabled={saving}
                className={`text-center font-bold py-3 px-6 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  saved 
                  ? 'bg-indigo-800 border-indigo-600 text-white hover:bg-indigo-900' 
                  : 'bg-transparent border-indigo-400 text-white hover:bg-white/10'
                }`}
              >
                <Bookmark size={18} className={saved ? "fill-white" : ""} /> {saved ? 'Saved' : 'Save for later'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Coins className="text-emerald-500" /> Financial Details
              </h3>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-slate-500 text-sm">Maximum Amount</span>
                  <span className="font-semibold text-slate-900">{scholarship.amountMax ? `₹${scholarship.amountMax.toLocaleString()} / year` : 'Variable'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500 text-sm">Family Income Limit</span>
                  <span className="font-semibold text-slate-900">{scholarship.incomeLimit ? `Up to ₹${(scholarship.incomeLimit/100000).toFixed(1)} Lakhs` : 'No Limit'}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Calendar className="text-rose-500" /> Important Dates
              </h3>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-slate-500 text-sm">Application Starts</span>
                  <span className="font-semibold text-slate-900">{scholarship.applicationStart ? new Date(scholarship.applicationStart).toLocaleDateString() : 'TBA'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500 text-sm">Deadline</span>
                  <span className="font-semibold text-red-600">{scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'TBA'}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Users className="text-indigo-500" /> Demographic Eligibility
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">State</p>
                <p className="font-semibold text-slate-900">{scholarship.stateEligibility.length ? scholarship.stateEligibility.join(', ') : 'All India'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Caste Category</p>
                <p className="font-semibold text-slate-900">{scholarship.casteEligibility.length ? scholarship.casteEligibility.join(', ') : 'All Categories'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Gender</p>
                <p className="font-semibold text-slate-900">{scholarship.genderEligibility || 'All'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Minority Only</p>
                <p className="font-semibold text-slate-900">{scholarship.minorityEligibility ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <FileText className="text-amber-500" /> Required Documents
              </h3>
              <ul className="space-y-2">
                {scholarship.requiredDocuments.length > 0 ? scholarship.requiredDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    {doc}
                  </li>
                )) : (
                  <li className="text-sm text-slate-500 italic">No specific documents mentioned.</li>
                )}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Phone className="text-blue-500" /> Contact & Help
              </h3>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3">
                    <Mail size={16} className="text-indigo-500" />
                    <span className="text-slate-700 font-medium">{scholarship.contactEmail || 'Not provided'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone size={16} className="text-indigo-500" />
                    <span className="text-slate-700 font-medium">{scholarship.helplineNumber || 'Not provided'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
