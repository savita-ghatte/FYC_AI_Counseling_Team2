import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building, GraduationCap, Settings, ShieldAlert, FileText, Bell } from 'lucide-react';

export const AdminLayout = () => {
  const navItems = [
    { name: 'Overview', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Students', path: '/admin/students', icon: <Users size={20} /> },
    { name: 'Colleges', path: '/admin/colleges', icon: <Building size={20} /> },
    { name: 'Scholarships', path: '/admin/scholarships', icon: <GraduationCap size={20} /> },
    { name: 'AI Usage', path: '/admin/ai-usage', icon: <Settings size={20} /> },
    { name: 'Roles', path: '/admin/roles', icon: <ShieldAlert size={20} /> },
    { name: 'Reports', path: '/admin/reports', icon: <FileText size={20} /> },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shrink-0">
        <div className="p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">Admin Portal</span>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 h-16 shrink-0 flex items-center justify-end px-6">
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
