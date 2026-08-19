import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  LogOut,
  User,
  Building2,
  ShieldCheck,
  Bell,
  ChevronDown,
  Mail,
  Briefcase,
  Building,
  CheckCircle,
  Calendar,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/login');
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      const interval = setInterval(fetchNotifications, 15000);
      const handleCustomEvent = () => fetchNotifications();
      window.addEventListener('notification-updated', handleCustomEvent);

      return () => {
        clearInterval(interval);
        window.removeEventListener('notification-updated', handleCustomEvent);
      };
    }
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (n) => {
    setShowNotificationMenu(false);
    if (!n.isRead) {
      try {
        await API.patch(`/notifications/${n._id}/read`);
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error(err);
      }
    }
    if (n.link) {
      navigate(n.link);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await API.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Company Admin':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'HR':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Manager':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Assistant Manager':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Production Manager':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Team Leader':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Employee':
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand & Tenant Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold text-lg text-slate-100 tracking-wide">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <span>
            <span className="text-blue-400 font-normal">SaaS ERP</span>
          </span>
        </div>

        {user?.tenant && (
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-300">{user.tenant.name}</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase font-mono text-slate-400">
              {user.tenant.code}
            </span>
          </div>
        )}
      </div>

      {/* Right Navigation Elements */}
      <div className="flex items-center gap-4">
        {/* Role Badge */}
        {user && (
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 ${getRoleBadgeColor(
              user.role
            )}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {user.role}
          </span>
        )}

        {/* Notifications Icon & Interactive Popover Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowProfileMenu(false);
            }}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-400 hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="py-2 space-y-2 max-h-80 overflow-y-auto divide-y divide-slate-800/40">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No notifications found.</p>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`pt-2 flex items-start gap-3 p-2.5 rounded-xl transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-950/40 hover:bg-blue-900/40' : 'hover:bg-slate-800/40'
                        }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-white ${n.type === 'leave_hr_approved'
                          ? 'bg-emerald-600'
                          : n.type === 'leave_manager_approved'
                            ? 'bg-cyan-600'
                            : n.type === 'leave_rejected'
                              ? 'bg-rose-600'
                              : 'bg-amber-600'
                          }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white truncate">{n.title}</p>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{n.message}</p>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Link to Notifications Console */}
              <div className="pt-3 border-t border-slate-800 text-center">
                <button
                  onClick={() => {
                    setShowNotificationMenu(false);
                    navigate('/notifications');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
                >
                  <span>View All Notifications Page</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Button & Clickable Dropdown Menu */}
        {user && (
          <div className="relative pl-3 border-l border-slate-800" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotificationMenu(false);
              }}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700/60 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shadow-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {user.department || user.email}
                </p>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180 text-blue-400' : ''
                  }`}
              />
            </button>

            {/* Profile Popover Dropdown Card */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 font-mono truncate">{user.email}</p>
                  </div>
                </div>

                <div className="py-3 space-y-2 text-xs border-b border-slate-800">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Role:
                    </span>
                    <span className="font-semibold text-slate-200">{user.role}</span>
                  </div>

                  {user.tenant && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-amber-400" /> Company:
                      </span>
                      <span className="font-semibold text-slate-200 truncate max-w-[130px]">
                        {user.tenant.name}
                      </span>
                    </div>
                  )}

                  {user.department && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-emerald-400" /> Dept:
                      </span>
                      <span className="font-semibold text-slate-200 truncate max-w-[130px]">
                        {user.department}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 hover:border-transparent font-bold text-xs transition-all shadow-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out / Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
