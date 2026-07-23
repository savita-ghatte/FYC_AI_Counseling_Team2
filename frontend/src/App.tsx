import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Home } from './components/home/Home';
import { Login } from './components/auth/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

import { ProfileLayout } from './components/profile/ProfileLayout';
import { CollegeSearch } from './components/colleges/CollegeSearch';
import { CollegeDetail } from './components/colleges/CollegeDetail';
import { PredictorLayout } from './components/predictor/PredictorLayout';
import { PredictorForm } from './components/predictor/PredictorForm';
import { PredictionResults } from './components/predictor/PredictionResults';
import { ScholarshipDashboard } from './components/scholarships/ScholarshipDashboard';
import { AICounsellor } from './components/chat/AICounsellor';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverview } from './components/admin/AdminOverview';
import { AdminStudents } from './components/admin/AdminStudents';
import { AdminColleges } from './components/admin/AdminColleges';
import { AdminReports } from './components/admin/AdminReports';
import { AdminAIUsage } from './components/admin/AdminAIUsage';
import { StudentDashboard } from './components/dashboard/StudentDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden">
          <Navbar />
          
          <div className="flex-1 flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Student/Common Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/profile/*" element={<ProfileLayout />} />
                <Route path="/colleges" element={<CollegeSearch />} />
                <Route path="/colleges/:id" element={<CollegeDetail />} />
                <Route path="/predictor" element={<PredictorLayout />}>
                  <Route index element={<PredictorForm />} />
                  <Route path="results" element={<PredictionResults />} />
                </Route>
                <Route path="/scholarships" element={<ScholarshipDashboard />} />
                <Route path="/ai-counsellor" element={<AICounsellor />} />
              </Route>
              
              {/* Admin Only Routes */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminOverview />} />
                  <Route path="students" element={<AdminStudents />} />
                  <Route path="colleges" element={<AdminColleges />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="ai-usage" element={<AdminAIUsage />} />
                  <Route path="*" element={<div className="p-10 text-center text-slate-500">This module is part of the prototype and will be fully wired later.</div>} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
