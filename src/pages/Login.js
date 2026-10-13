import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, MessageSquare, ChevronDown,
  X, Shield, Zap, Sparkles, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../data/mockData';

// ============================================================================
// APP STORE & GOOGLE PLAY BADGES (COMPACT VECTOR BADGES)
// ============================================================================
function AppStoreBadge() {
  return (
    <div className="h-8 sm:h-8.5 px-3 rounded-lg bg-black text-white flex items-center gap-1.5 select-none hover:opacity-90 transition-opacity cursor-pointer shadow-sm">
      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76.99.08 2.05-.51 2.68-1.26z" />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className="text-[7.5px] uppercase tracking-wider text-slate-300">Download on the</span>
        <span className="text-[10.5px] font-semibold text-white tracking-tight mt-0.5">App Store</span>
      </div>
    </div>
  );
}

function GooglePlayBadge() {
  return (
    <div className="h-8 sm:h-8.5 px-3 rounded-lg bg-black text-white flex items-center gap-1.5 select-none hover:opacity-90 transition-opacity cursor-pointer shadow-sm">
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M3.6 2.4c-.2.2-.3.6-.3 1v17.2c0 .4.1.8.3 1L12.7 12 3.6 2.4z" />
        <path fill="#FBBC04" d="M16 8.7L12.7 12l3.3 3.3 3.8-2.2c1.1-.6 1.1-1.6 0-2.2L16 8.7z" />
        <path fill="#EA4335" d="M3.6 21.6l9.1-9.6 3.3 3.3-10.4 6c-.9.5-1.7.5-2-.7z" />
        <path fill="#34A853" d="M3.6 2.4l2 1.2 10.4 6-3.3 3.3-9.1-9.6c.3-.5 1.1-.5 2-.9z" />
      </svg>
      <div className="flex flex-col text-left leading-none">
        <span className="text-[7.5px] uppercase tracking-wider text-slate-300">GET IT ON</span>
        <span className="text-[10.5px] font-semibold text-white tracking-tight mt-0.5">Google Play</span>
      </div>
    </div>
  );
}

// ============================================================================
// OFFICIAL NETBOUNCE NB LOGO HEADER (PROPORTIONAL & BRANDED)
// ============================================================================
function NetBounceLogoHeader() {
  return (
    <div className="flex flex-col items-center select-none">
      <div className="flex items-center gap-3">
        <img
          src="/intro-assets/nb_logo.png"
          alt="NetBounce NB Logo"
          className="h-11 sm:h-12 w-auto object-contain drop-shadow-sm"
        />
        <div className="flex flex-col text-left">
          <span className="text-2xl sm:text-[26px] font-black tracking-tight text-[#0B1EE6] uppercase leading-none">
            NETBOUNCE
          </span>
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
            Operations Platform
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs sm:text-[13px] font-semibold text-[#0B1EE6] tracking-wide leading-none">
        The heart of your operations
      </p>
    </div>
  );
}

// ============================================================================
// MAIN SCROLL-FREE COMPACT B.WELL LOGIN COMPONENT
// ============================================================================
export default function Login() {
  const { login, loginAs, authLoading } = useApp();
  const navigate = useNavigate();
  const [showRoles, setShowRoles] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both Email/ID and Password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      // Validated! Navigate to permitted dashboard
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials. Please verify your Email/ID and Password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pick = (roleId, userId) => {
    setErrorMessage('');
    loginAs(roleId, userId);
    navigate('/dashboard');
  };

  const roleCards = Object.values(ROLES);

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden flex items-center justify-center p-3 sm:p-6 bg-[#EDF2FA] font-sans antialiased text-slate-800 m-0 select-none">
      {/* ==================================================================== */}
      {/* THE MAIN CARD (EXPANDED PROPORTIONAL VIEWPORT FIT) */}
      {/* ==================================================================== */}
      <div
        data-testid="login-card"
        className="w-full max-w-[1100px] h-[92vh] max-h-[640px] bg-white rounded-3xl shadow-[0_25px_65px_-15px_rgba(11,30,230,0.15)] border border-slate-200/90 overflow-hidden flex flex-col lg:flex-row relative"
      >
        {/* ================================================================== */}
        {/* LEFT COLUMN: HERO PHOTO WITH PROPER ALIGNMENT & S-CURVE WAVE */}
        {/* ================================================================== */}
        <div className="w-full lg:w-[48%] xl:w-[49%] h-full relative overflow-hidden bg-[#0107cb] flex-shrink-0 hidden lg:block">
          {/* Authentic NetBounce Job Market Poster Photo (Full view, properly centered) */}
          <img
            src="/netbounce_hero_aligned.jpg"
            alt="NetBounce Workforce"
            className="w-full h-full object-cover object-center"
          />

          {/* ORGANIC S-CURVE WAVE CUTOUT DIVIDER (GENTLE CURVE, PREVENTS TEXT CUTTING) */}
          <svg
            viewBox="0 0 100 800"
            preserveAspectRatio="none"
            className="absolute top-0 -right-[1px] h-full w-14 sm:w-16 z-10 pointer-events-none fill-white"
          >
            <path d="M 100 0 L 70 0 C 70 200, 35 350, 35 450 C 35 550, 75 680, 75 800 L 100 800 Z" />
          </svg>
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: CLEAN SPACIOUS B.WELL LOGIN FORM */}
        {/* ================================================================== */}
        <div className="w-full lg:w-[52%] xl:w-[51%] h-full bg-white px-8 sm:px-10 lg:px-12 py-6 sm:py-7 flex flex-col justify-between relative z-20 overflow-hidden">
          <div>
            {/* Logo Header */}
            <NetBounceLogoHeader />

            {/* Login Form */}
            <form onSubmit={handleLogin} className="mt-5 space-y-3 max-w-[380px] mx-auto w-full">
              {/* Error Alert */}
              {errorMessage && (
                <div
                  data-testid="login-error-alert"
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
                >
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email / Employee ID Input Field */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1">
                  Email or Employee ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    data-testid="login-email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); }}
                    placeholder="e.g. yourname@netbounceplacement.com or TTT-NB-001"
                    required
                    className="w-full h-10 sm:h-11 pl-9 pr-3 rounded-lg border border-slate-300 focus:border-[#0B1EE6] focus:ring-2 focus:ring-[#0B1EE6]/15 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-normal bg-white transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password Input Field */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    data-testid="login-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorMessage(''); }}
                    placeholder="Enter password"
                    required
                    className="w-full h-10 sm:h-11 pl-3 pr-9 rounded-lg border border-slate-300 focus:border-[#0B1EE6] focus:ring-2 focus:ring-[#0B1EE6]/15 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-normal bg-white transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Row */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    data-testid="login-remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#0B1EE6] focus:ring-[#0B1EE6]/30 accent-[#0B1EE6] cursor-pointer"
                  />
                  <span className="text-xs sm:text-[13px] text-slate-600 font-medium">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  data-testid="demo-login-trigger"
                  onClick={() => setShowRoles(true)}
                  className="text-xs text-[#0B1EE6] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                >
                  <Zap size={12} /> Test Roles
                </button>
              </div>

              {/* Log In Pill Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  data-testid="login-submit-btn"
                  className="w-full h-11 rounded-full bg-gradient-to-r from-[#0B1EE6] to-[#0817B8] hover:from-[#0918C7] hover:to-[#061294] active:scale-[0.99] text-white font-semibold text-[15px] shadow-md shadow-[#0B1EE6]/25 hover:shadow-lg hover:shadow-[#0B1EE6]/35 transition-all flex items-center justify-center cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting || authLoading ? 'Authenticating…' : 'Log in'}
                </button>
              </div>
            </form>

            {/* Legal Disclaimer */}
            <p className="mt-4 text-[10.5px] text-slate-400 text-center leading-tight max-w-xs mx-auto">
              By logging in, you agree to the NetBounce Terms of Service and Privacy Policy
            </p>
          </div>

          {/* Footer: Language Dropdown & Get Support */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 max-w-[380px] mx-auto w-full">
            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-800 transition-colors">
              <span>English (Inglés)</span>
              <ChevronDown size={14} />
            </div>

            <div
              onClick={() => alert('Support line: contact support@netbounce.io or talk to your TSM lead.')}
              className="flex items-center gap-1 cursor-pointer hover:text-slate-800 transition-colors"
            >
              <MessageSquare size={14} className="text-slate-400" />
              <span>Get Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* DEMO ROLE SELECTOR MODAL (PRESERVED WITH TEST IDS) */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {showRoles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              data-testid="role-selector"
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-slate-900 relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[10px] font-bold text-[#0B1EE6] uppercase tracking-wider mb-1">
                    <Shield size={11} /> 1-Click Environment
                  </div>
                  <h3 className="text-xl font-bold text-slate-950">Select a demo role</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Your dashboard, navigation, and permissions will adapt automatically.
                  </p>
                </div>
                <button
                  onClick={() => setShowRoles(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Role Cards & Specific Team Personas */}
              <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1 space-y-4">
                {/* 1. Marketing Team Leads (Mukesh, Shivam, Vijesh) */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Marketing Team Leads (Team Isolation)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      data-testid="role-pick-marketing-tl-mukesh"
                      onClick={() => pick('marketing_tl', 'u-tl-mukesh')}
                      className="p-3 rounded-xl bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200 text-left transition-all cursor-pointer shadow-xs"
                    >
                      <div className="text-xs font-bold text-blue-900">Mukesh Patel</div>
                      <div className="text-[11px] text-blue-600 font-semibold">Team Mukesh (Lead)</div>
                      <div className="text-[10px] text-slate-500 mt-1">Sees Mukesh candidates only</div>
                    </button>
                    <button
                      data-testid="role-pick-marketing-tl-shivam"
                      onClick={() => pick('marketing_tl', 'u-tl-shivam')}
                      className="p-3 rounded-xl bg-purple-50/60 hover:bg-purple-100/70 border border-purple-200 text-left transition-all cursor-pointer shadow-xs"
                    >
                      <div className="text-xs font-bold text-purple-900">Shivam Gupta</div>
                      <div className="text-[11px] text-purple-600 font-semibold">Team Shivam (Lead)</div>
                      <div className="text-[10px] text-slate-500 mt-1">Sees Shivam candidates only</div>
                    </button>
                    <button
                      data-testid="role-pick-marketing-tl-vijesh"
                      onClick={() => pick('marketing_tl', 'u-tl-vijesh')}
                      className="p-3 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200 text-left transition-all cursor-pointer shadow-xs"
                    >
                      <div className="text-xs font-bold text-emerald-900">Vijesh Kumar</div>
                      <div className="text-[11px] text-emerald-600 font-semibold">Team Vijesh (Lead)</div>
                      <div className="text-[10px] text-slate-500 mt-1">Sees Vijesh candidates only</div>
                    </button>
                  </div>
                </div>

                {/* 2. Recruiters / POCs (Self-Only Candidate Isolation) */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Recruiters / POCs (Own Assigned Candidates Only)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      data-testid="role-pick-poc-aditi"
                      onClick={() => pick('recruiter', 'u-poc-aditi')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900">Aditi Sharma</div>
                      <div className="text-[10px] text-blue-700 font-semibold">POC • Team Mukesh</div>
                    </button>
                    <button
                      data-testid="role-pick-poc-rahul"
                      onClick={() => pick('recruiter', 'u-poc-rahul')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900">Rahul Verma</div>
                      <div className="text-[10px] text-blue-700 font-semibold">POC • Team Mukesh</div>
                    </button>
                    <button
                      data-testid="role-pick-poc-priya"
                      onClick={() => pick('recruiter', 'u-poc-priya')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900">Priya Singh</div>
                      <div className="text-[10px] text-purple-700 font-semibold">POC • Team Shivam</div>
                    </button>
                    <button
                      data-testid="role-pick-poc-amit"
                      onClick={() => pick('recruiter', 'u-poc-amit')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900">Amit Mishra</div>
                      <div className="text-[10px] text-purple-700 font-semibold">POC • Team Shivam</div>
                    </button>
                    <button
                      data-testid="role-pick-poc-sneha"
                      onClick={() => pick('recruiter', 'u-poc-sneha')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900">Sneha Joshi</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">POC • Team Vijesh</div>
                    </button>
                    <button
                      data-testid="role-pick-poc-vikas"
                      onClick={() => pick('recruiter', 'u-poc-vikas')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900">Vikas Dubey</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">POC • Team Vijesh</div>
                    </button>
                  </div>
                </div>

                {/* 3. TSE Engineers (TSE-Only Candidate Isolation) */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    TSE Engineers (Own Candidates Only)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      data-testid="role-pick-tse-harit"
                      onClick={() => pick('tse', 'u-tse-harit')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900">Harit Verma</div>
                      <div className="text-[10px] text-cyan-700 font-semibold">Code: Abhishek</div>
                    </button>
                    <button
                      data-testid="role-pick-tse-prem"
                      onClick={() => pick('tse', 'u-tse-prem')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900">Prem Makwana</div>
                      <div className="text-[10px] text-cyan-700 font-semibold">Code: Kiran</div>
                    </button>
                    <button
                      data-testid="role-pick-tse-shaurya"
                      onClick={() => pick('tse', 'u-tse-shaurya')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900">Shaurya Mishra</div>
                      <div className="text-[10px] text-cyan-700 font-semibold">Code: Henil</div>
                    </button>
                    <button
                      data-testid="role-pick-tse-nikunj"
                      onClick={() => pick('tse', 'u-tse-nikunj')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900">Nikunj Kataria</div>
                      <div className="text-[10px] text-cyan-700 font-semibold">Code: Saurav</div>
                    </button>
                    <button
                      data-testid="role-pick-tse-amber"
                      onClick={() => pick('tse', 'u-tse-amber')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900">Amber Afreen</div>
                      <div className="text-[10px] text-cyan-700 font-semibold">Code: Smriti</div>
                    </button>
                  </div>
                </div>

                {/* 4. Leadership & Management (All Teams Access) */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Management &amp; Leadership (Full Cross-Team Visibility)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      data-testid="role-pick-management-shashank"
                      onClick={() => pick('management', 'u-shashank-01')}
                      className="p-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold">Shashank Mishra</div>
                      <div className="text-[11px] text-cyan-300 font-semibold">Management Lead</div>
                    </button>
                    <button
                      data-testid="role-pick-management"
                      onClick={() => pick('management', 'u-02')}
                      className="p-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold">Priya Nair</div>
                      <div className="text-[11px] text-cyan-300 font-semibold">Management Ops</div>
                    </button>
                    <button
                      data-testid="role-pick-upper_management"
                      onClick={() => pick('upper_management', 'u-01')}
                      className="p-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold">Aarav Mehta</div>
                      <div className="text-[11px] text-amber-300 font-semibold">Upper Management</div>
                    </button>
                  </div>
                </div>

                {/* 5. TSM Leads */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    TSM Operations (Task Assignment)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      data-testid="role-pick-tsm"
                      onClick={() => pick('tsm', 'u-03')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900">Rohan Kapoor</div>
                      <div className="text-[10px] text-blue-600 font-semibold">TSM • Code: TSM Titan</div>
                    </button>
                    <button
                      data-testid="role-pick-tsm-neha"
                      onClick={() => pick('tsm', 'u-04')}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-900">Neha Iyer</div>
                      <div className="text-[10px] text-blue-600 font-semibold">TSM • Code: TSM Nova</div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Shield size={12} className="text-[#0B1EE6]" /> Mock environment · No password required
                </span>
                <button
                  type="button"
                  onClick={() => setShowRoles(false)}
                  className="font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
