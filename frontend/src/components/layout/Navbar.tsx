import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../notifications/NotificationBell';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Colleges', path: '/colleges' },
    { name: 'Scholarships', path: '/scholarships' },
    { name: 'Predictor', path: '/predictor' },
    { name: 'AI Chat', path: '/ai-counsellor' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 transition-colors">
              <Sparkles className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">
              AI<span className="text-indigo-600">Counsellor</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                    location.pathname === link.path ? 'text-indigo-600' : 'text-slate-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              {user ? (
                <>
                  <NotificationBell />
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span>{user.fullName || 'Dashboard'}</span>
                  </Link>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-200"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {user && <NotificationBell />}
            <button
              onClick={toggleMenu}
              className="text-slate-600 hover:text-indigo-600 transition-colors p-1"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-b border-slate-200 bg-white"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-3 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-4 mt-2 border-t border-slate-100">
                {user ? (
                  <div className="space-y-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-3 py-3 rounded-md text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
