import { Award, Calendar, Coins, GraduationCap, MapPin, Building, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import type { ScholarshipMatch } from '../../types/scholarship';
import { Link } from 'react-router-dom';

interface ScholarshipCardProps {
  scholarship: ScholarshipMatch;
  viewMode: 'Grid' | 'List';
  matchType?: 'Eligible' | 'Partial';
}

export const ScholarshipCard = ({ scholarship, viewMode, matchType }: ScholarshipCardProps) => {
  const isGrid = viewMode === 'Grid';
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not announced';
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className={`bg-white rounded-xl border ${matchType === 'Eligible' ? 'border-emerald-200' : matchType === 'Partial' ? 'border-amber-200' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all overflow-hidden flex ${isGrid ? 'flex-col' : 'flex-col md:flex-row items-stretch'}`}>
      
      {/* Content Area */}
      <div className={`p-6 flex-1 flex flex-col ${!isGrid ? 'md:border-r md:border-slate-100' : ''}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
              {scholarship.provider || 'General'}
            </span>
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
              {scholarship.type}
            </span>
          </div>
          
          {matchType === 'Eligible' && (
            <div className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1 -mt-6 -mr-6">
              <CheckCircle2 size={14} /> 100% MATCH
            </div>
          )}
          {matchType === 'Partial' && (
            <div className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1 -mt-6 -mr-6">
              <AlertCircle size={14} /> {scholarship.matchScore}% MATCH
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{scholarship.name}</h3>
        
        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {scholarship.eligibilityCriteria || 'Click to view full eligibility criteria.'}
        </p>

        <div className="mt-auto grid grid-cols-2 gap-y-3 gap-x-4">
          <div className="flex items-start gap-2">
            <Coins className="text-emerald-500 h-4 w-4 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase">Amount</p>
              <p className="text-xs font-semibold text-slate-700">{scholarship.amountMax ? `₹${scholarship.amountMax.toLocaleString()}/yr` : 'Variable'}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Building className="text-indigo-500 h-4 w-4 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase">Income Limit</p>
              <p className="text-xs font-semibold text-slate-700">{scholarship.incomeLimit ? `< ₹${(scholarship.incomeLimit/100000).toFixed(1)}L` : 'None'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className={`bg-slate-50 p-6 flex flex-col justify-center ${isGrid ? 'border-t border-slate-100' : 'md:w-64'}`}>
        <div className="mb-4">
          <p className="text-[10px] text-slate-400 font-medium uppercase mb-1">Application Deadline</p>
          <div className="flex items-center gap-2 text-sm font-bold text-red-600">
            <Calendar size={16} />
            {formatDate(scholarship.deadline)}
          </div>
        </div>

        {scholarship.reasons && (
          <div className="mb-4 space-y-1">
            <p className="text-[10px] text-slate-400 font-medium uppercase mb-1">Match Analysis</p>
            {Object.entries(scholarship.reasons).map(([key, passed]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs">
                {passed ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
                <span className={passed ? 'text-slate-600 capitalize' : 'text-slate-400 line-through capitalize'}>{key}</span>
              </div>
            ))}
          </div>
        )}

        <Link 
          to={`/scholarships/${scholarship.id}`}
          className="mt-auto w-full bg-white border border-indigo-200 hover:border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 text-sm font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          View Details <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
};
