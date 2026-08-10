import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  ArrowRight,
  Check,
  CheckCheck,
} from 'lucide-react';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (n) => {
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

  const handleMarkAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <span>System &amp; HRMS Notification Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time notifications for leave approvals, manager requests, shift updates, and onboarding.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 font-bold text-xs transition-all flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h2 className="text-base font-bold text-white mb-4">All Recent Notifications</h2>

        {loading ? (
          <div className="text-center py-8 text-slate-400 text-xs">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">No notifications found.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleMarkAsRead(n)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !n.isRead
                  ? 'bg-blue-950/40 border-blue-500/30 hover:border-blue-500/50'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white mt-0.5 ${
                    n.type === 'leave_applied'
                      ? 'bg-amber-500'
                      : n.type === 'leave_hr_approved'
                      ? 'bg-emerald-500'
                      : n.type === 'leave_rejected'
                      ? 'bg-rose-500'
                      : 'bg-blue-600'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{n.title}</h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold shrink-0">
                <span>View Details</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
