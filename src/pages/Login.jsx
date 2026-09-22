import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  RiLockPasswordLine,
  RiMailLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiShieldCheckLine,
  RiEyeLine,
  RiEyeOffLine,
  RiSparklingFill,
  RiBuilding4Line,
  RiCheckboxCircleFill,
  RiShieldKeyholeLine,
  RiKey2Line,
  RiTimeLine,
  RiSendPlaneFill,
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
  // Mode: 'login' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');

  // Credentials
  const [email, setEmail] = useState('babludangi2000@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot / Reset Password state
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // ── Login Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please enter both your administrator email and password.');
      return;
    }

    setLoading(true);

    try {
      // Attempt real backend authentication against MongoDB
      const res = await authAPI.login({ email: email.trim(), password });
      if (res && res.data) {
        login(
          res.data.admin || { name: 'Bablu Dangi (Super Admin)', email: email.trim(), role: 'Super Admin' },
          res.data.token || 'admin-jwt-token'
        );
      } else {
        login({ name: 'Bablu Dangi (Super Admin)', email: email.trim(), role: 'Super Admin' }, 'admin-jwt-token-session');
      }
      navigate('/');
    } catch (err) {
      console.log('Authentication feedback:', err);
      const errorMsg = err.message || err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password: Send OTP to Email ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your administrator email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await authAPI.forgotPassword({ email: email.trim() });
      setSuccess(res?.message || 'Verification OTP has been dispatched to your email.');
      
      // If dev fallback returned OTP, auto-fill for testing ease
      if (res?.data?.devOtp) {
        setOtp(res.data.devOtp);
      }
      
      setMode('reset');
      setResendTimer(60);
    } catch (err) {
      console.log('Forgot password error:', err);
      setError(err?.message || err?.response?.data?.message || 'Failed to dispatch OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // ── Reset Password with OTP ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in the 6-digit OTP, new password, and confirmation.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await authAPI.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });

      setSuccess(res?.message || 'Password reset successfully! You can now log in with your new password.');
      setPassword(newPassword);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setMode('login');
    } catch (err) {
      console.log('Reset password error:', err);
      setError(err?.message || err?.response?.data?.message || 'Invalid or expired OTP. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] select-none overflow-x-hidden font-body">
      
      {/* ── LEFT PILLAR: MAJESTIC BRAND & ARCHITECTURAL EXPERIENCE (52% WIDTH) ── */}
      <div className="lg:w-[52%] bg-gradient-to-br from-[#071529] via-[#0B1E3D] to-[#132C54] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden shrink-0 border-b lg:border-b-0 lg:border-r border-gold/30">
        
        {/* Background Ambient Lighting & Geometry */}
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-gold/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(201,162,75,0.06)_0%,transparent_70%)] pointer-events-none" />

        {/* Subtle Decorative Architectural Grid Lines */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #C9A24B 1px, transparent 1px), linear-gradient(to bottom, #C9A24B 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Top: Monogram & Brand Title */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-navy text-gold flex items-center justify-center text-xl font-display font-extrabold shadow-elevated border border-gold/40">
              ZJ
            </div>
            <div>
              <div className="font-display font-extrabold text-xl tracking-tight leading-none text-white">
                ZAMIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-gold-light">JUNCTION</span>
              </div>
              <p className="text-[10px] font-extrabold text-gold uppercase tracking-[0.25em] mt-1">
                Super Admin Console
              </p>
            </div>
          </div>
        </div>

        {/* Center: Executive Feature Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="my-10 lg:my-0 relative z-10 max-w-xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/15 border border-gold/40 text-gold text-2xs font-extrabold uppercase tracking-wider mb-5 backdrop-blur-xs">
            <RiSparklingFill className="text-xs" /> Central India Mandate Gateway
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.15]">
            Unified Property & Deal Governance{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-[#E0B85C] to-gold font-serif italic font-normal">
              for Indore
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed font-medium">
            Super Administrator terminal for verified real estate portfolio governance, direct builder allocations, title clearance monitoring, and client pipeline fulfillment across Indore's prime corridors.
          </p>

          {/* Value Highlights */}
          <div className="mt-8 space-y-3 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0 border border-gold/30">
                <RiCheckboxCircleFill className="text-sm" />
              </span>
              <span>100% Legal Title Clear & RERA Verification Management</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0 border border-gold/30">
                <RiCheckboxCircleFill className="text-sm" />
              </span>
              <span>Live Buyer Requirements Pipeline & Direct WhatsApp Desk</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0 border border-gold/30">
                <RiCheckboxCircleFill className="text-sm" />
              </span>
              <span>Full Property Inventory CRUD & Direct Developer Allocations</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom: Security Protocol Notice */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-2xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <RiShieldKeyholeLine className="text-gold text-sm" />
            <span>256-Bit SSL Encrypted Administrative Session</span>
          </div>
          <span className="text-slate-500">v2.4 Enterprise Production</span>
        </div>

      </div>

      {/* ── RIGHT PILLAR: FULL-WIDTH EXECUTIVE CREDENTIALS SUITE (48% WIDTH) ── */}
      <div className="lg:w-[48%] bg-surface flex items-center justify-center p-6 sm:p-12 lg:p-16 relative z-10">
        <div className="w-full max-w-md mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-navy/5 text-navy text-2xs font-extrabold uppercase tracking-wider mb-2.5 border border-border">
              <RiBuilding4Line className="text-gold text-xs" /> Authorized Personnel Only
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-navy tracking-tight">
              {mode === 'login' && 'Administrator Login'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'reset' && 'Verify OTP & Reset'}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1.5 font-medium">
              {mode === 'login' && 'Sign in with your verified administrative credentials to access the console.'}
              {mode === 'forgot' && 'Enter your registered administrator email to receive a secure 6-digit OTP.'}
              {mode === 'reset' && `Enter the 6-digit code dispatched to ${email} and specify your new password.`}
            </p>
          </div>

          {/* Feedback Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 p-3.5 rounded-xl bg-danger-light border border-danger/30 text-danger text-xs font-bold flex items-center gap-2"
              >
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300/80 text-emerald-800 text-xs font-bold flex items-center gap-2"
              >
                <RiCheckboxCircleFill className="text-emerald-600 text-sm shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═════════════════════════════════════════════════════════
              VIEW 1: REGULAR LOGIN FORM
             ═════════════════════════════════════════════════════════ */}
          {mode === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Field */}
              <div>
                <label className="block text-2xs font-extrabold uppercase tracking-wider text-text-primary mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold text-base pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="babludangi2000@gmail.com"
                    autoComplete="username"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-bg text-navy text-xs sm:text-sm font-semibold focus:border-gold focus:bg-white focus:outline-none transition-all placeholder:text-text-muted/60"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-2xs font-extrabold uppercase tracking-wider text-text-primary">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-2xs font-bold text-gold hover:text-gold-hover transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <RiLockPasswordLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold text-base pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-border bg-bg text-navy text-xs sm:text-sm font-semibold focus:border-gold focus:bg-white focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-navy cursor-pointer transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <RiEyeOffLine className="text-base" /> : <RiEyeLine className="text-base" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Live Status */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 text-gold rounded border-border focus:ring-gold accent-gold cursor-pointer"
                  />
                  <span className="text-2xs font-bold text-text-secondary">
                    Remember terminal
                  </span>
                </label>

                <span className="flex items-center gap-1.5 text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Console Online
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-navy text-gold hover:bg-navy-light font-display font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold transition-all cursor-pointer disabled:opacity-50 mt-4 active:scale-[0.99]"
              >
                {loading ? (
                  <span>Authenticating Session...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <RiArrowRightLine className="text-base" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* ═════════════════════════════════════════════════════════
              VIEW 2: FORGOT PASSWORD (REQUEST OTP)
             ═════════════════════════════════════════════════════════ */}
          {mode === 'forgot' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-2xs font-extrabold uppercase tracking-wider text-text-primary mb-1.5">
                  Registered Administrator Email
                </label>
                <div className="relative">
                  <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold text-base pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="babludangi2000@gmail.com"
                    autoComplete="username"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-bg text-navy text-xs sm:text-sm font-semibold focus:border-gold focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-text-muted mt-1.5">
                  A 6-digit verification code will be sent to this email address.
                </p>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-navy text-gold hover:bg-navy-light font-display font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold transition-all cursor-pointer disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <span>Dispatching OTP...</span>
                ) : (
                  <>
                    <RiSendPlaneFill />
                    <span>Send Verification OTP</span>
                  </>
                )}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccess('');
                }}
                className="w-full py-2.5 rounded-xl border border-border text-navy text-xs font-bold hover:bg-bg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RiArrowLeftLine /> Back to Login
              </button>
            </form>
          )}

          {/* ═════════════════════════════════════════════════════════
              VIEW 3: VERIFY OTP & SET NEW PASSWORD
             ═════════════════════════════════════════════════════════ */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              
              {/* 6-Digit OTP */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-2xs font-extrabold uppercase tracking-wider text-text-primary">
                    6-Digit Verification OTP
                  </label>
                  {resendTimer > 0 ? (
                    <span className="text-[11px] text-text-muted flex items-center gap-1 font-semibold">
                      <RiTimeLine className="text-gold" /> Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-2xs font-bold text-gold hover:text-gold-hover cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
                <div className="relative">
                  <RiKey2Line className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold text-base pointer-events-none" />
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-bg text-navy text-base font-black tracking-widest text-center focus:border-gold focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-2xs font-extrabold uppercase tracking-wider text-text-primary mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <RiLockPasswordLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold text-base pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-border bg-bg text-navy text-xs sm:text-sm font-semibold focus:border-gold focus:bg-white focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-navy cursor-pointer transition-colors"
                  >
                    {showNewPassword ? <RiEyeOffLine className="text-base" /> : <RiEyeLine className="text-base" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-2xs font-extrabold uppercase tracking-wider text-text-primary mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <RiLockPasswordLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold text-base pointer-events-none" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-bg text-navy text-xs sm:text-sm font-semibold focus:border-gold focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Reset Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-navy text-gold hover:bg-navy-light font-display font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold transition-all cursor-pointer disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <RiShieldCheckLine className="text-base" />
                    <span>Reset & Save Password</span>
                  </>
                )}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccess('');
                }}
                className="w-full py-2.5 rounded-xl border border-border text-navy text-xs font-bold hover:bg-bg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RiArrowLeftLine /> Back to Login
              </button>

            </form>
          )}

          {/* Security Guarantee Notice */}
          <div className="mt-8 pt-6 border-t border-border/80 text-center">
            <div className="flex items-center justify-center gap-2 text-2xs text-text-muted font-medium">
              <RiShieldCheckLine className="text-gold text-sm" />
              <span>Strictly Confidential • All access attempts are monitored and logged</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
