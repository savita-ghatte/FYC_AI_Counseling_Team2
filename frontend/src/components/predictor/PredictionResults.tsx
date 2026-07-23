import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { ProbabilityChart } from './ProbabilityChart';

export const PredictionResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'safe' | 'moderate' | 'dream'>('safe');

  useEffect(() => {
    const fetchPredictions = async () => {
      const input = location.state?.input;
      if (!input) {
        navigate('/predictor');
        return;
      }
      
      try {
        // In real app, uncomment below
        // const res = await axios.post('/api/predictor/predict', input);
        // setPredictions(res.data.data.predictions);

        // Mock response to match predictorController.ts
        setTimeout(() => {
          setPredictions({
            safe: [
              { id: '3', name: 'VIT Pune', branch: input.preferredBranch || 'Computer Science', probability: 95, fees: 180000, type: 'Private' },
              { id: '4', name: 'PICT Pune', branch: input.preferredBranch || 'Information Technology', probability: 88, fees: 140000, type: 'Private' }
            ],
            moderate: [
              { id: '2', name: 'Delhi Technological University', branch: input.preferredBranch || 'Software Engineering', probability: 65, fees: 160000, type: 'Government' },
              { id: '5', name: 'NIT Trichy', branch: 'Mechanical', probability: 55, fees: 120000, type: 'Government' }
            ],
            dream: [
              { id: '1', name: 'IIT Bombay', branch: input.preferredBranch || 'Computer Science', probability: 15, fees: 200000, type: 'Government' },
              { id: '6', name: 'IIT Delhi', branch: 'Mathematics and Computing', probability: 25, fees: 210000, type: 'Government' }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchPredictions();
  }, [location.state, navigate]);

  if (loading) return <div className="text-center py-20 text-slate-500 text-lg animate-pulse">Running Prediction Engine...</div>;
  if (!predictions) return null;

  const currentList = predictions[activeTab];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <button onClick={() => navigate('/predictor')} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 font-medium transition-colors">
        <ArrowLeft size={18} /> Modify Inputs
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Col: Lists */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Your Admission Forecast</h1>
          
          <div className="flex gap-4 mb-6 border-b border-slate-200 pb-2 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('safe')}
              className={`flex items-center gap-2 pb-2 border-b-2 font-semibold transition-colors px-2 whitespace-nowrap ${activeTab === 'safe' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <CheckCircle2 size={18} /> Safe ({predictions.safe.length})
            </button>
            <button 
              onClick={() => setActiveTab('moderate')}
              className={`flex items-center gap-2 pb-2 border-b-2 font-semibold transition-colors px-2 whitespace-nowrap ${activeTab === 'moderate' ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <TrendingUp size={18} /> Moderate ({predictions.moderate.length})
            </button>
            <button 
              onClick={() => setActiveTab('dream')}
              className={`flex items-center gap-2 pb-2 border-b-2 font-semibold transition-colors px-2 whitespace-nowrap ${activeTab === 'dream' ? 'border-red-500 text-red-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <AlertCircle size={18} /> Dream ({predictions.dream.length})
            </button>
          </div>

          <div className="space-y-4">
            {currentList.map((college: any, idx: number) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => navigate(`/colleges/${college.id}`)}>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{college.name}</h3>
                  <p className="text-slate-500 text-sm">{college.branch}</p>
                  <p className="text-slate-400 text-xs mt-1">{college.type} • ₹{college.fees.toLocaleString()}/yr</p>
                </div>
                <div className="flex items-center justify-end">
                  <div className="text-right">
                    <span className="block text-xs uppercase tracking-wide text-slate-400 font-bold mb-1">Probability</span>
                    <span className={`text-2xl font-extrabold ${activeTab === 'safe' ? 'text-emerald-600' : activeTab === 'moderate' ? 'text-amber-500' : 'text-red-500'}`}>
                      {college.probability}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {currentList.length === 0 && (
              <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl">No colleges found in this category based on your inputs.</div>
            )}
          </div>
        </div>

        {/* Right Col: Analytics */}
        <div className="w-full md:w-80 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-8">
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Analysis Overview</h3>
            <ProbabilityChart 
              safe={predictions.safe.length} 
              moderate={predictions.moderate.length} 
              dream={predictions.dream.length} 
            />
            <p className="text-sm text-slate-500 mt-4 leading-relaxed">
              Based on historical cutoff trends, you have <strong className="text-slate-800">{predictions.safe.length + predictions.moderate.length} realistic options</strong> available. 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
