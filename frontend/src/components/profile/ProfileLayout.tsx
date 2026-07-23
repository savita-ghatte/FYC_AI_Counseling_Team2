import { useEffect, useState } from 'react';
import { User, FileText, BookOpen, Settings } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { PersonalInfoForm } from './PersonalInfoForm';
import { AcademicForm } from './AcademicForm';
import { PreferencesForm } from './PreferencesForm';
import { DocumentManager } from './DocumentManager';

export const ProfileLayout = () => {
  const [completion, setCompletion] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname.includes('academic')) return 'academic';
    if (location.pathname.includes('documents')) return 'documents';
    if (location.pathname.includes('preferences')) return 'preferences';
    return 'personal';
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    setCompletion(45);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Student Profile</h1>
        <p className="text-slate-600 mt-2">Complete your profile to get personalized college predictions.</p>
        
        <div className="mt-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Profile Completion</span>
            <span className="text-sm font-bold text-blue-600">{completion}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${completion}%` }}></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => navigate('/profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'personal' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <User size={18} /> Personal Info
            </button>
            <button
              onClick={() => navigate('/profile/academic')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'academic' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <BookOpen size={18} /> Academic Details
            </button>
            <button
              onClick={() => navigate('/profile/documents')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'documents' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <FileText size={18} /> Documents
            </button>
            <button
              onClick={() => navigate('/profile/preferences')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'preferences' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Settings size={18} /> Preferences
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <Routes>
            <Route index element={<PersonalInfoForm />} />
            <Route path="academic" element={<AcademicForm />} />
            <Route path="preferences" element={<PreferencesForm />} />
            <Route path="documents" element={<DocumentManager />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};
