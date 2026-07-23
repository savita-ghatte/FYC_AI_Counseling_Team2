import { useState, useEffect } from 'react';
import { Bot, Sparkles, CheckCircle2 } from 'lucide-react';
// import axios from 'axios';

export const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In real app:
    // axios.get('/api/scholarships/recommended').then(res => setRecommendations(res.data.data.matches));
    
    // Mock response simulating AI matching
    setTimeout(() => {
      setRecommendations([
        {
          id: '1',
          name: 'AI-Matched Post Matric Scholarship',
          provider: 'State Government',
          type: 'Government',
          amountMax: 15000,
          matchScore: 98,
          eligibilityCriteria: 'Matches your selected category and home state perfectly.',
          requiredDocuments: ['Income Certificate', 'Domicile Certificate'],
          deadline: '2027-11-01',
        },
        {
          id: '2',
          name: 'Tech Innovators Grant',
          provider: 'Private Foundation',
          type: 'Private',
          amountMax: 50000,
          matchScore: 85,
          eligibilityCriteria: 'Matches your selected Engineering branch preference.',
          requiredDocuments: ['College ID', 'Project Proposal'],
          deadline: '2027-12-01',
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Bot size={48} className="text-purple-400 mb-4 animate-bounce" />
        <h3 className="text-xl font-semibold text-slate-700">AI is analyzing your profile...</h3>
        <p>Finding the best scholarship matches for you.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 p-2.5 rounded-lg text-purple-700">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Your AI Matches</h2>
          <p className="text-sm text-slate-500">Based on your profile data</p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map(s => (
          <div key={s.id} className="bg-white border-2 border-purple-100 rounded-xl p-6 flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
              {s.matchScore}% Match
            </div>
            
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1 block">{s.type}</span>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{s.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{s.provider}</p>
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                <span className="text-xs font-semibold text-slate-700 block mb-1">Why it matches you:</span>
                <p className="text-sm text-slate-600 flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  {s.eligibilityCriteria}
                </p>
              </div>
            </div>

            <div className="md:w-48 flex flex-col justify-between items-end md:border-l border-slate-100 md:pl-6">
              <div className="text-right w-full mb-4">
                <span className="block text-2xl font-black text-emerald-600">₹{s.amountMax.toLocaleString()}</span>
                <span className="text-xs text-slate-400 font-medium">Potential Aid</span>
              </div>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm">
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
