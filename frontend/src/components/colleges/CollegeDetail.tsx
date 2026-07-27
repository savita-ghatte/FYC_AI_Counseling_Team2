import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Building, GraduationCap, Globe, ArrowLeft } from 'lucide-react';
import { api } from '../../utils/api';

export const CollegeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const res = await api.get(`/colleges/${id}`);
        const data = res.data.data.college;
        // Map backend fields to frontend expected names
        setCollege({
          ...data,
          type: data.instituteType,
          website: data.websiteUrl
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollege();
  }, [id]);

  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // Check if bookmarked
    const saved = JSON.parse(localStorage.getItem('savedColleges') || '[]');
    if (saved.includes(id)) {
      setIsBookmarked(true);
    }
  }, [id]);

  const toggleBookmark = () => {
    const saved = JSON.parse(localStorage.getItem('savedColleges') || '[]');
    if (isBookmarked) {
      const newSaved = saved.filter((savedId: string) => savedId !== id);
      localStorage.setItem('savedColleges', JSON.stringify(newSaved));
      setIsBookmarked(false);
    } else {
      saved.push(id);
      localStorage.setItem('savedColleges', JSON.stringify(saved));
      setIsBookmarked(true);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading college details...</div>;
  if (!college) return <div className="text-center py-20 text-red-500">College not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 font-medium transition-colors">
        <ArrowLeft size={18} /> Back to Search
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="h-48 bg-gradient-to-r from-blue-900 to-blue-700"></div>
        <div className="p-6 md:p-8 relative">
          <div className="absolute -top-16 left-8 w-32 h-32 bg-white rounded-xl shadow-md border-4 border-white flex items-center justify-center font-bold text-4xl text-blue-800">
            {college.name.charAt(0)}
          </div>
          
          <div className="mt-16 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{college.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-600">
                <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full"><MapPin size={16} /> {college.city}, {college.state}</span>
                <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full"><Building size={16} /> {college.type}</span>
                {college.nirfRank && <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full"><GraduationCap size={16} /> NIRF Rank {college.nirfRank}</span>}
                {college.website && (
                  <a href={college.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors text-blue-600">
                    <Globe size={16} /> Website
                  </a>
                )}
              </div>
            </div>
            <button 
              onClick={toggleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isBookmarked 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' 
                  : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              {isBookmarked ? 'Saved' : 'Save'}
            </button>
          </div>
          <p className="mt-6 text-slate-700 leading-relaxed">{college.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Courses Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Courses & Fees</h2>
          <div className="space-y-4">
            {college.courses?.map((course: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-800">{course.degreeType} in {course.branchCode}</h3>
                  <p className="text-sm text-slate-500">{course.durationYears} Years • {course.totalIntake} Seats</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600">₹{course.tuitionFee?.toLocaleString() ?? 'N/A'}</span>
                  <p className="text-xs text-slate-400">/ year</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Placements Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Placement Highlights</h2>
          <div className="space-y-4">
            {college.placements?.map((placement: any, idx: number) => (
              <div key={idx} className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                  <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Highest Package</span>
                  <span className="text-xl font-bold text-blue-700">₹{(placement.highestPackage / 100000).toFixed(1)} LPA</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                  <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Average Package</span>
                  <span className="text-xl font-bold text-emerald-600">₹{(placement.averagePackage / 100000).toFixed(1)} LPA</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
