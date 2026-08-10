import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth, getRoleDashboardRoute } from '../context/AuthContext';
import API from '../services/api';
import {
  Lock,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [invitationInfo, setInvitationInfo] = useState(null);
  const [fetchingInfo, setFetchingInfo] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvite = async () => {
      if (!token) {
        setError('No invitation token provided.');
        setFetchingInfo(false);
        return;
      }

      try {
        const response = await API.get(`/users/invite/${token}`);
        if (response.data.success) {
          setInvitationInfo(response.data.invitation);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired invitation link.');
      } finally {
        setFetchingInfo(false);
      }
    };

    fetchInvite();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/auth/accept-invite', {
        token,
        password,
      });

      if (response.data.success) {
        const { user, token: jwtToken } = response.data;
        
        // Auto-login user immediately
        loginUser(user, jwtToken, false);

        // Redirect directly to their authorized role dashboard
        const dashboardRoute = getRoleDashboardRoute(user.role);
        navigate(dashboardRoute);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set password.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingInfo) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-400">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-400">Verifying Employee Invitation Token...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Welcome to {invitationInfo?.companyName || 'SaaS ERP'}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Complete your account setup by creating a password.
            </p>
          </div>

          {invitationInfo && (
            <div className="mb-6 bg-blue-950/40 border border-blue-800/50 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-500">Employee Name:</span>
                <span className="font-semibold text-white">{invitationInfo.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-blue-300">{invitationInfo.email}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-500">Assigned Role:</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold text-[11px]">
                  {invitationInfo.role}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-500">Department:</span>
                <span className="text-slate-300 font-medium">{invitationInfo.department}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-300 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Set Account Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!error}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Activating Account &amp; Directing to Dashboard...</span>
                </>
              ) : (
                <>
                  <span>Activate Account &amp; Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Token Onboarding Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
