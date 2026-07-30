import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, TrendingUp, HelpCircle, Sparkles, Loader2, Bookmark, Award, Building2, Wallet, Briefcase, Filter, Download, ArrowRightLeft } from 'lucide-react';
import { api } from '../../utils/api';

export const PredictionResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Safe' | 'Moderate' | 'Reach' | 'Dream'>('Safe');
  const [explanations, setExplanations] = useState<{ [key: string]: string }>({});
  const [loadingExplanation, setLoadingExplanation] = useState<string | null>(null);
  const [savedColleges, setSavedColleges] = useState<Set<string>>(new Set());
  const [selectedToCompare, setSelectedToCompare] = useState<string[]>([]);
  
  // Filters
  const [ownershipFilter, setOwnershipFilter] = useState<string>('All');
  const [maxFeesFilter, setMaxFeesFilter] = useState<number>(500000);

  const input = location.state?.input;

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!input) {
        navigate('/predictor');
        return;
      }
      
      try {
        const res = await api.post('/predictions/generate', { input });
        
        if (res.data.status === 'success') {
          const grouped = {
            Safe: [] as any[],
            Moderate: [] as any[],
            Reach: [] as any[],
            Dream: [] as any[],
          };

          res.data.data.predictions.forEach((p: any) => {
            if (grouped[p.status as keyof typeof grouped]) {
              grouped[p.status as keyof typeof grouped].push(p);
            }
          });

          setPredictions(grouped);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, [input, navigate]);

  const handleAskGemini = async (college: any) => {
    if (explanations[college.collegeId]) return;
    
    setLoadingExplanation(college.collegeId);
    try {
      const res = await api.post('/predictions/explain', {
        predictionData: college,
        userProfile: input,
      });
      if (res.data.status === 'success') {
        setExplanations(prev => ({ ...prev, [college.collegeId]: res.data.data.explanation }));
      }
    } catch (error) {
      console.error(error);
      setExplanations(prev => ({ ...prev, [college.collegeId]: "Explanation unavailable at the moment." }));
    } finally {
      setLoadingExplanation(null);
    }
  };

  const toggleSaveCollege = (collegeId: string) => {
    setSavedColleges(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collegeId)) {
        newSet.delete(collegeId);
      } else {
        newSet.add(collegeId);
      }
      return newSet;
    });
  };

  const toggleCompare = (collegeId: string) => {
    setSelectedToCompare(prev => {
      if (prev.includes(collegeId)) {
        return prev.filter(id => id !== collegeId);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 colleges at a time.");
        return prev;
      }
      return [...prev, collegeId];
    });
  };

  const downloadReport = () => {
    alert("Downloading your prediction report PDF...");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <div className="text-slate-500 text-lg font-medium">Analyzing historical data & generating predictions...</div>
    </div>
  );
  
  if (!predictions) return null;

  let currentList = predictions[activeTab] || [];
  
  // Apply Filters
  currentList = currentList.filter((college: any) => {
    if (ownershipFilter !== 'All' && college.collegeDetails?.ownership !== ownershipFilter) return false;
    if (college.collegeDetails?.averageFees && college.collegeDetails.averageFees > maxFeesFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        
        {/* Top Header */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/predictor')} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Your College Predictions</h1>
              <p className="text-sm text-slate-500 font-medium">
                Based on {input.examName} {input.scoreType === 'rank' ? 'Rank' : 'Percentile'}: <span className="text-indigo-600 font-bold">{input.scoreValue}</span> | Category: {input.category}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button onClick={downloadReport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 rounded-xl text-sm font-semibold transition-all">
              <Download size={16} /> Download Report
            </button>
            {selectedToCompare.length > 0 && (
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 transition-all">
                <ArrowRightLeft size={16} /> Compare ({selectedToCompare.length})
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar: Filters */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 sticky top-4">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
                <Filter size={18} className="text-indigo-500" /> Filters
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Ownership</label>
                  <select 
                    value={ownershipFilter}
                    onChange={(e) => setOwnershipFilter(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-500"
                  >
                    <option value="All">All Institutions</option>
                    <option value="Public">Public / Government</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    Max Fees (1st Year): ₹{(maxFeesFilter / 100000).toFixed(1)}L
                  </label>
                  <input 
                    type="range" 
                    min="50000" 
                    max="500000" 
                    step="50000"
                    value={maxFeesFilter}
                    onChange={(e) => setMaxFeesFilter(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1 font-medium">
                    <span>₹50K</span>
                    <span>₹5L+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Results */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200 mb-6 flex overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('Safe')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'Safe' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <CheckCircle2 size={18} /> Safe ({predictions.Safe.length})
              </button>
              <button 
                onClick={() => setActiveTab('Moderate')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'Moderate' ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <TrendingUp size={18} /> Moderate ({predictions.Moderate.length})
              </button>
              <button 
                onClick={() => setActiveTab('Reach')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'Reach' ? 'bg-orange-50 text-orange-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <HelpCircle size={18} /> Reach ({predictions.Reach.length})
              </button>
              <button 
                onClick={() => setActiveTab('Dream')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === 'Dream' ? 'bg-red-50 text-red-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <AlertCircle size={18} /> Dream ({predictions.Dream.length})
              </button>
            </div>

            <div className="space-y-4">
              {currentList.map((college: any, idx: number) => (
                <div key={idx} className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
                  
                  {/* Top Right Actions */}
                  <div className="absolute top-5 right-5 flex gap-3">
                    <button 
                      onClick={() => toggleSaveCollege(college.collegeId)}
                      className={`transition-colors ${savedColleges.has(college.collegeId) ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
                      title="Save College"
                    >
                      <Bookmark size={22} className={savedColleges.has(college.collegeId) ? "fill-current" : ""} />
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-5 items-start">
                    {/* Logo Area */}
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 text-indigo-600">
                      <Award size={32} strokeWidth={1.5} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pr-12">
                      <h3 className="font-bold text-xl text-slate-800 leading-tight mb-1 hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => navigate(`/colleges/${college.collegeId}`)}>
                        {college.collegeName}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">{college.collegeDetails.location}</p>
                      
                      {college.isFallback && (
                        <div className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold mb-4 inline-block border border-orange-200">
                          <AlertCircle size={14} className="inline mr-1" />
                          Alternative Recommendation
                        </div>
                      )}

                      {/* Highlight Badges */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                          <Building2 size={14} className="text-slate-400" />
                          {college.collegeDetails.ownership || 'Public'}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                          <Wallet size={14} className="text-emerald-500" />
                          {college.collegeDetails.averageFees ? `₹${(college.collegeDetails.averageFees / 100000).toFixed(2)} L/yr` : 'Fees N/A'}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                          <Briefcase size={14} className="text-indigo-500" />
                          {college.collegeDetails.placementRate ? `${college.collegeDetails.placementRate}% Placed` : 'Placement N/A'}
                        </div>
                      </div>

                      <div className="bg-indigo-50/50 rounded-xl p-3 mb-4 inline-flex items-center gap-2 border border-indigo-50">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <span className="text-sm font-semibold text-indigo-900">{college.courseName}</span>
                      </div>

                      {/* Ask AI & Probability */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleAskGemini(college)}
                            disabled={loadingExplanation === college.collegeId}
                            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl transition-colors border border-indigo-100"
                          >
                            {loadingExplanation === college.collegeId ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Sparkles size={16} />
                            )}
                            Predictor Insights
                          </button>
                          
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 px-3 py-2.5 rounded-xl transition-colors select-none">
                            <input 
                              type="checkbox" 
                              checked={selectedToCompare.includes(college.collegeId)}
                              onChange={() => toggleCompare(college.collegeId)}
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            Compare
                          </label>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                          <div className="flex flex-col items-end border-r border-slate-200 pr-4">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Confidence</span>
                            <span className={`text-xs font-bold ${college.confidenceLevel === 'High' ? 'text-emerald-600' : college.confidenceLevel === 'Medium' ? 'text-amber-600' : 'text-red-500'}`}>
                              {college.confidenceLevel || 'Low'}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Chances</span>
                            <span className={`text-xl leading-none font-black ${activeTab === 'Safe' ? 'text-emerald-500' : activeTab === 'Moderate' ? 'text-amber-500' : activeTab === 'Reach' ? 'text-orange-500' : 'text-red-500'}`}>
                              {college.probability}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Explanation Dropdown */}
                  {explanations[college.collegeId] && (
                    <div className="mt-5 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100/50">
                      <h4 className="flex items-center gap-2 text-indigo-800 font-bold mb-3 text-sm">
                        <Sparkles size={16} className="text-indigo-600" /> Why this prediction?
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                        {explanations[college.collegeId]}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {currentList.length === 0 && (
                <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Filter size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">No colleges found</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    Try adjusting your filters or checking a different prediction category to see more options.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
