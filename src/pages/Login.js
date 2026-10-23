import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Shield, X, Sparkles, Terminal, KeyRound, Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { ROLES, USERS } from '../data/mockData';

export default function Login() {
  const { loginAs, users } = useApp();
  const navigate = useNavigate();
  const [showRoles, setShowRoles] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('ttt_remembered_email') || '';
    } catch (e) {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return Boolean(localStorage.getItem('ttt_remembered_email'));
    } catch (e) {
      return false;
    }
  });

  // Generate static random values once per mount for background liquid blobs
  const blobsData = useMemo(() => {
    return Array.from({ length: 6 }).map(() => ({
      size: Math.random() * 200 + 150,
      left: Math.random() * 80 + 10,
      top: Math.random() * 80 + 10,
      animationDelay: Math.random() * -20,
      animationDuration: Math.random() * 15 + 15,
    }));
  }, []);

  const blobRefs = useRef([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      blobRefs.current.forEach((blob, index) => {
        if (blob) {
          const speed = (index + 1) * 20;
          blob.style.marginLeft = `${x * speed}px`;
          blob.style.marginTop = `${y * speed}px`;
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const pick = (roleId, userId) => {
    loginAs(roleId, userId);
    navigate('/dashboard');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      toast.error('Identity key required. Please enter your email address');
      return;
    }

    if (rememberMe) {
      try {
        localStorage.setItem('ttt_remembered_email', cleanEmail);
      } catch (err) {}
    } else {
      try {
        localStorage.removeItem('ttt_remembered_email');
      } catch (err) {}
    }

    const allUsers = users && users.length > 0 ? users : USERS;
    const found = allUsers.find(u => (u.email || '').toLowerCase() === cleanEmail) ||
      USERS.find(u => (u.email || '').toLowerCase() === cleanEmail);

    if (found) {
      if (password && found.password && found.password !== password) {
        toast.error('Sequence key mismatch. Invalid credentials.');
        return;
      }
      pick(found.role, found.id);
      return;
    }

    // Also match if user entered name (e.g. "mukesh")
    const foundByName = allUsers.find(u => (u.name || '').toLowerCase().includes(cleanEmail));
    if (foundByName) {
      pick(foundByName.role, foundByName.id);
      return;
    }

    toast.error('Identity not verified. Check email or select 1-Click Persona below.');
  };

  return (
    <div className="mercury-wrapper select-none">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

        :root {
          --bg: #050505;
          --mercury: #e0e0e0;
          --mercury-dark: #666666;
          --accent: #ffffff;
          --text-dim: rgba(255, 255, 255, 0.55);
          --filter-goo: url('#gooey');
        }

        .mercury-wrapper {
          background-color: var(--bg);
          color: var(--accent);
          font-family: 'Inter', sans-serif;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .mercury-wrapper * {
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }

        /* Background Liquid Physics Simulation */
        .stage {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 0;
          filter: var(--filter-goo);
          opacity: 0.65;
        }

        .blob {
          position: absolute;
          background: linear-gradient(135deg, var(--mercury), #777);
          border-radius: 50%;
          filter: blur(20px);
          animation: float 20s infinite alternate ease-in-out;
          box-shadow: inset -10px -10px 20px rgba(0,0,0,0.5), 
                      10px 10px 30px rgba(255,255,255,0.25);
          transition: margin 0.1s ease-out;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10vw, 20vh) scale(1.2); }
          66% { transform: translate(-5vw, 10vh) scale(0.85); }
          100% { transform: translate(5vw, -10vh) scale(1.1); }
        }

        /* Interface Container */
        .auth-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 460px;
          padding: 40px 32px;
        }

        .header {
          margin-bottom: 45px;
          text-align: left;
        }

        .brand-id {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .header h1 {
          font-weight: 800;
          font-size: 3.2rem;
          line-height: 0.92;
          letter-spacing: -2px;
          margin-left: -3px;
          margin-top: 0;
          background: linear-gradient(180deg, #ffffff 40%, #999999 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-sub {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 2.5px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 8px;
          text-transform: uppercase;
        }

        /* Form Elements */
        .form-group {
          position: relative;
          margin-bottom: 24px;
          transition: transform 0.4s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .form-group:focus-within {
          transform: translateX(8px);
        }

        .form-group label {
          display: block;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 1.5px;
          color: var(--text-dim);
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .form-group input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          color: var(--accent);
          padding: 10px 0;
          font-size: 16px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.4s;
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.25);
          font-size: 14px;
        }

        .input-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0%;
          height: 2px;
          background: var(--mercury);
          transition: width 0.6s cubic-bezier(0.2, 1, 0.3, 1);
          box-shadow: 0 0 16px var(--mercury);
        }

        .form-group input:focus + .input-glow,
        .form-group input:focus ~ .input-glow {
          width: 100%;
        }

        /* The Mercury Button */
        .submit-wrap {
          margin-top: 36px;
          position: relative;
          filter: var(--filter-goo);
        }

        .btn-base {
          background: var(--accent);
          color: #000;
          border: none;
          padding: 18px 32px;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2.5px;
          cursor: pointer;
          width: 100%;
          position: relative;
          z-index: 2;
          border-radius: 4px;
          transition: letter-spacing 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-base:hover {
          letter-spacing: 4px;
        }

        .mercury-drop {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: var(--mercury);
          transform: translate(-50%, -50%);
          z-index: 1;
          border-radius: 50px;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .submit-wrap:hover .mercury-drop {
          transform: translate(-50%, -50%) scale(1.05, 1.22);
          filter: brightness(1.2);
        }

        /* Utility */
        .footer-nav {
          margin-top: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .footer-nav button,
        .footer-nav a {
          color: var(--text-dim);
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: color 0.3s;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
        }

        .footer-nav button:hover,
        .footer-nav a:hover {
          color: var(--accent);
        }

        /* SVG Filter Definition Hidden Element */
        .svg-filter-hidden {
          position: absolute;
          width: 0;
          height: 0;
        }
      `}</style>

      {/* SVG Gooey Liquid Filter */}
      <svg className="svg-filter-hidden">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Animated Liquid Background Blobs */}
      <div className="stage" id="stage">
        {blobsData.map((data, index) => (
          <div
            key={index}
            ref={(el) => (blobRefs.current[index] = el)}
            className="blob"
            style={{
              width: `${data.size}px`,
              height: `${data.size}px`,
              left: `${data.left}%`,
              top: `${data.top}%`,
              animationDelay: `${data.animationDelay}s`,
              animationDuration: `${data.animationDuration}s`,
            }}
          />
        ))}
      </div>

      {/* Main Terminal Container */}
      <main className="auth-container">
        <header className="header">
          <span className="brand-id">
            <Cpu size={12} className="text-white/60 animate-pulse" />
            NODE: 0x992 // NETBOUNCE
          </span>
          <h1>NEURAL<br />ACCESS</h1>
          <div className="header-sub">TECH TEAM TRACKER TERMINAL</div>
        </header>

        <form autoComplete="off" onSubmit={handleLogin} data-testid="login-card">
          {/* Email / Identity Input */}
          <div className="form-group">
            <label>User Identity</label>
            <input
              type="email"
              data-testid="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. shashank.m@netbounceplacement.com"
              required
              autoComplete="username"
            />
            <div className="input-glow"></div>
          </div>

          {/* Password / Sequence Key Input */}
          <div className="form-group">
            <div className="flex items-center justify-between mb-1">
              <label className="m-0">Sequence Key</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                <span className="text-[10px] font-mono">{showPassword ? 'HIDE' : 'SHOW'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                data-testid="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
              />
              <div className="input-glow"></div>
            </div>
          </div>

          {/* Remember Me & 1-Click Persona Option */}
          <div className="flex items-center justify-between text-xs text-white/60 pt-1 font-mono">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                data-testid="login-remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-white/20 bg-black text-white focus:ring-0 accent-white cursor-pointer"
              />
              <span className="text-[11px] text-white/70">Remember node</span>
            </label>

            <button
              type="button"
              data-testid="btn-open-role-selector"
              onClick={() => setShowRoles(true)}
              className="text-[11px] text-white/50 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
            >
              1-Click Personas →
            </button>
          </div>

          {/* Liquid Mercury Submit Button */}
          <div className="submit-wrap">
            <div className="mercury-drop"></div>
            <button
              type="submit"
              data-testid="login-submit-btn"
              className="btn-base"
            >
              <Terminal size={14} />
              Initialize Stream
            </button>
          </div>
        </form>

        <footer className="footer-nav">
          <button
            type="button"
            onClick={() => toast.info('Support: Contact operations lead at support@netbounceplacement.com')}
          >
            ENCRYPTED RECOVERY
          </button>
          <button
            type="button"
            onClick={() => setShowRoles(true)}
          >
            ACCESS ARCHIVE
          </button>
        </footer>
      </main>

      {/* ==================================================================== */}
      {/* 1-CLICK DEMO ROLE SELECTOR MODAL (DARK THEME FUTURISTIC TERMINAL) */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {showRoles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              data-testid="role-selector"
              className="w-full max-w-lg bg-[#0c0c0e] rounded-3xl shadow-2xl border border-white/15 p-6 text-white relative font-sans"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-white/90 uppercase tracking-wider mb-1">
                    <Shield size={11} /> 1-Click Environment Node
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Select Persona Node</h3>
                  <p className="text-xs text-white/50 mt-0.5 font-mono">
                    Dashboard permissions and navigation synchronize instantly.
                  </p>
                </div>
                <button
                  onClick={() => setShowRoles(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Role Cards & Specific Team Personas */}
              <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1 space-y-4 font-sans">
                {/* 1. Marketing Team Leads (Team Mukesh & Team Shivam ONLY) */}
                <div>
                  <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-2">
                    Marketing Team Leads
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      data-testid="role-pick-marketing-tl-mukesh"
                      onClick={() => pick('marketing_tl', 'u-1791911058812')}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white">Mukesh Chaudhary</div>
                      <div className="text-[11px] text-blue-400 font-semibold">Team Mukesh (Lead)</div>
                      <div className="text-[10px] text-white/40 mt-1">Assigns Team Mukesh Senior Recruiters</div>
                    </button>
                    <button
                      data-testid="role-pick-marketing-tl-shivam"
                      onClick={() => pick('marketing_tl', 'u-1791911115518')}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white">Shivam Barot</div>
                      <div className="text-[11px] text-purple-400 font-semibold">Team Shivam (Lead)</div>
                      <div className="text-[10px] text-white/40 mt-1">Assigns Team Shivam Senior Recruiters</div>
                    </button>
                  </div>
                </div>

                {/* 2. Marketing Senior Recruiters */}
                <div>
                  <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-2">
                    Marketing Senior Recruiters
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      data-testid="role-pick-sr-snehal"
                      onClick={() => pick('marketing_sr', 'u-sr-mukesh-01')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white">Prajapati Snehal</div>
                      <div className="text-[10px] text-blue-400 font-semibold">SR • Team Mukesh</div>
                    </button>
                    <button
                      data-testid="role-pick-sr-ritik"
                      onClick={() => pick('marketing_sr', 'u-sr-mukesh-02')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white">Ritik Kumar Gupta</div>
                      <div className="text-[10px] text-blue-400 font-semibold">SR • Team Mukesh</div>
                    </button>
                    <button
                      data-testid="role-pick-sr-ausafkhan"
                      onClick={() => pick('marketing_sr', 'u-sr-mukesh-03')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white">Ausafkhan Pathan</div>
                      <div className="text-[10px] text-blue-400 font-semibold">SR • Team Mukesh</div>
                    </button>
                    <button
                      data-testid="role-pick-sr-vishal"
                      onClick={() => pick('marketing_sr', 'u-sr-shivam-01')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white">Vishal Suthar</div>
                      <div className="text-[10px] text-purple-400 font-semibold">SR • Team Shivam</div>
                    </button>
                    <button
                      data-testid="role-pick-sr-riyen"
                      onClick={() => pick('marketing_sr', 'u-sr-shivam-02')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white">Riyen Sukhadiya</div>
                      <div className="text-[10px] text-purple-400 font-semibold">SR • Team Shivam</div>
                    </button>
                    <button
                      data-testid="role-pick-sr-smit"
                      onClick={() => pick('marketing_sr', 'u-sr-shivam-03')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white">Smit H Patel</div>
                      <div className="text-[10px] text-purple-400 font-semibold">SR • Team Shivam</div>
                    </button>
                  </div>
                </div>

                {/* 3. TSE Engineers */}
                <div>
                  <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-2">
                    TSE Engineers
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      data-testid="role-pick-tse-abhishek"
                      onClick={() => pick('tse', 'u-1791910812799')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white">Abhishek</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">TSE-NB-001</div>
                    </button>
                    <button
                      data-testid="role-pick-tse-henil"
                      onClick={() => pick('tse', 'u-1791910865708')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white">Henil</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">TSE-NB-003</div>
                    </button>
                    <button
                      data-testid="role-pick-tse-kiran"
                      onClick={() => pick('tse', 'u-1791910844293')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white">Kiran</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">TSE-NB-002</div>
                    </button>
                    <button
                      data-testid="role-pick-tse-saurav"
                      onClick={() => pick('tse', 'u-1791910900310')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white">Saurav</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">TSE-NB-004</div>
                    </button>
                  </div>
                </div>

                {/* 4. Leadership & Management */}
                <div>
                  <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-2">
                    Super Admin &amp; Management
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      data-testid="role-pick-super-admin"
                      onClick={() => pick('management', 'u-shashank-01')}
                      className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white">Shashank Mishra</div>
                      <div className="text-[11px] text-amber-300 font-semibold">Super Admin · Full Control</div>
                    </button>
                    <button
                      data-testid="role-pick-admin"
                      onClick={() => pick('management', 'u-1791910268004')}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white">Aditi Mohapatra</div>
                      <div className="text-[11px] text-cyan-300 font-semibold">Admin · Management</div>
                    </button>
                  </div>
                </div>

                {/* 5. TSM Operations */}
                <div>
                  <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-2">
                    TSM Operations (Task Assignment)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      data-testid="role-pick-tsm"
                      onClick={() => pick('tsm', 'u-1791926042864')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white">Aditya Mishra</div>
                      <div className="text-[10px] text-blue-400 font-semibold">TSM Titan · Leads Task Operations</div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50 font-mono">
                <span className="flex items-center gap-1.5">
                  <Shield size={12} className="text-white/80" /> Mock node · Instant access
                </span>
                <button
                  type="button"
                  onClick={() => setShowRoles(false)}
                  className="font-semibold text-white/70 hover:text-white cursor-pointer"
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
