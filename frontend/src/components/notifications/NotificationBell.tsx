import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export const NotificationBell = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      // Polling every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread' || n.status === 'pending').length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-slate-100 text-slate-600 relative transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{unreadCount} new</span>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">You have no notifications.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-4 transition-colors hover:bg-slate-50 cursor-pointer ${n.status === 'read' ? 'opacity-60' : 'bg-indigo-50/30'}`}
                    onClick={() => { if(n.status !== 'read') markAsRead(n.id) }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                      {n.status !== 'read' && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1 shrink-0"></span>}
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{n.message}</p>
                    <span className="text-[10px] font-medium text-slate-400 mt-2 block">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
