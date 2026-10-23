import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { USERS } from '../data/mockData';

export default function Login() {
  const { loginAs, users } = useApp();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('ttt_remembered_email') || '';
    } catch (e) {
      return '';
    }
  });
  const [password, setPassword] = useState('');

  // Generate static random values once per mount for background liquid blobs
  const blobsData = useMemo(() => {
    return Array.from({ length: 6 }).map(() => ({
      size: Math.random() * 220 + 160,
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

  const handleLogin = (e) => {
    e.preventDefault();
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      toast.error('Please enter your ID / Email');
      return;
    }

    try {
      localStorage.setItem('ttt_remembered_email', cleanEmail);
    } catch (err) {}

    const allUsers = users && users.length > 0 ? users : USERS;
    const found = allUsers.find(u => (u.email || '').toLowerCase() === cleanEmail) ||
      USERS.find(u => (u.email || '').toLowerCase() === cleanEmail);

    if (found) {
      if (password && found.password && found.password !== password) {
        toast.error('Invalid Password. Please check your credentials.');
        return;
      }
      loginAs(found.role, found.id);
      navigate('/dashboard');
      return;
    }

    // Also match if user entered name (e.g. "shashank" or "mukesh")
    const foundByName = allUsers.find(u => (u.name || '').toLowerCase().includes(cleanEmail));
    if (foundByName) {
      loginAs(foundByName.role, foundByName.id);
      navigate('/dashboard');
      return;
    }

    toast.error('No account found with this ID. Please check your credentials.');
  };

  return (
    <div className="mercury-wrapper select-none">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        :root {
          --nb-blue-deep: #050b2e;
          --nb-blue-main: #0B1EE6;
          --nb-blue-glow: #38bdf8;
          --accent: #ffffff;
          --filter-goo: url('#gooey');
        }

        .mercury-wrapper {
          background: radial-gradient(circle at 50% 35%, #0e1b68 0%, #071042 50%, #040929 100%);
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

        /* Background Big NetBounce Logo (Replacing transparent watermark) */
        .bg-logo-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-nb-logo {
          width: 640px;
          height: auto;
          max-width: 92vw;
          object-fit: contain;
          opacity: 0.92;
          filter: drop-shadow(0 0 75px rgba(11, 30, 230, 0.95)) drop-shadow(0 0 35px rgba(56, 189, 248, 0.8)) drop-shadow(0 25px 50px rgba(0, 0, 0, 0.7));
          animation: logoGlow 6s ease-in-out infinite alternate;
        }

        @keyframes logoGlow {
          0% {
            transform: scale(1);
            filter: drop-shadow(0 0 60px rgba(11, 30, 230, 0.85)) drop-shadow(0 0 25px rgba(56, 189, 248, 0.6));
          }
          100% {
            transform: scale(1.04);
            filter: drop-shadow(0 0 95px rgba(11, 30, 230, 1)) drop-shadow(0 0 50px rgba(56, 189, 248, 0.95));
          }
        }

        /* Background Liquid Physics Simulation */
        .stage {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 1;
          filter: var(--filter-goo);
          opacity: 0.75;
        }

        .blob {
          position: absolute;
          background: linear-gradient(135deg, #38bdf8 0%, #1d4ed8 55%, #0B1EE6 100%);
          border-radius: 50%;
          filter: blur(22px);
          animation: float 20s infinite alternate ease-in-out;
          box-shadow: inset -10px -10px 25px rgba(2, 6, 23, 0.65), 
                      0 0 40px rgba(11, 30, 230, 0.45);
          transition: margin 0.1s ease-out;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10vw, 20vh) scale(1.18); }
          66% { transform: translate(-5vw, 10vh) scale(0.88); }
          100% { transform: translate(5vw, -10vh) scale(1.12); }
        }

        /* Interface Container (Larger, Transparent Glassmorphism) */
        .auth-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          padding: 46px 40px 42px 40px;
          background: rgba(5, 12, 45, 0.35);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1.5px solid rgba(255, 255, 255, 0.18);
          border-radius: 28px;
          box-shadow: 0 35px 85px rgba(0, 0, 0, 0.55), 
                      0 0 45px rgba(11, 30, 230, 0.35),
                      inset 0 1px 0 rgba(255, 255, 255, 0.22);
        }

        /* Form Elements */
        .form-group {
          position: relative;
          margin-bottom: 24px;
        }

        .input-label {
          display: block;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 2.5px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
          text-transform: uppercase;
          font-weight: 700;
        }

        /* Curved Input Boxes for ID and PASS */
        .curved-box {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.06);
          border: 1.5px solid rgba(255, 255, 255, 0.18);
          border-radius: 16px;
          padding: 3px 18px;
          transition: all 0.3s cubic-bezier(0.2, 1, 0.3, 1);
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        .curved-box:focus-within {
          border-color: #38bdf8;
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 24px rgba(56, 189, 248, 0.45), inset 0 2px 6px rgba(0, 0, 0, 0.25);
          transform: translateY(-1px);
        }

        .curved-field {
          width: 100%;
          background: transparent !important;
          border: none !important;
          color: #ffffff !important;
          padding: 13px 0;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          outline: none !important;
          border-radius: 14px;
        }

        .curved-field::placeholder {
          color: rgba(255, 255, 255, 0.35);
          font-size: 14px;
        }

        .curved-field:-webkit-autofill,
        .curved-field:-webkit-autofill:hover, 
        .curved-field:-webkit-autofill:focus, 
        .curved-field:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 50px #09133b inset !important;
          -webkit-text-fill-color: #ffffff !important;
          border-radius: 14px !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        .eye-toggle-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.65);
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .eye-toggle-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.12);
        }

        /* The NetBounce Liquid Button */
        .submit-wrap {
          margin-top: 36px;
          position: relative;
          filter: var(--filter-goo);
        }

        .btn-base {
          background: #ffffff;
          color: #071042;
          border: none;
          padding: 16px 32px;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 3px;
          cursor: pointer;
          width: 100%;
          position: relative;
          z-index: 2;
          border-radius: 6px;
          transition: letter-spacing 0.3s, background-color 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
        }

        .btn-base:hover {
          letter-spacing: 4.5px;
          background: #f0f7ff;
        }

        .mercury-drop {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #38bdf8, #0B1EE6);
          transform: translate(-50%, -50%);
          z-index: 1;
          border-radius: 50px;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .submit-wrap:hover .mercury-drop {
          transform: translate(-50%, -50%) scale(1.05, 1.22);
          filter: brightness(1.2);
        }

        /* SVG Filter Hidden */
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

      {/* Big NetBounce Colored Logo in Background (Replacing transparent watermark) */}
      <div className="bg-logo-wrap">
        <img
          src="/intro-assets/nb_logo.png"
          alt="NetBounce"
          className="bg-nb-logo"
        />
      </div>

      {/* Animated NetBounce Blue Liquid Bubbles */}
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

      {/* Main Terminal Container: ONLY ID, PASS, and Submit Button */}
      <main className="auth-container">

        <form autoComplete="off" onSubmit={handleLogin} data-testid="login-card">
          {/* ID / Email Input with Curved Edges */}
          <div className="form-group">
            <label className="input-label">ID</label>
            <div className="curved-box">
              <input
                type="text"
                data-testid="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter ID or Email"
                required
                autoComplete="username"
                className="curved-field"
              />
            </div>
          </div>

          {/* PASS / Password Input with Curved Edges */}
          <div className="form-group">
            <div className="flex items-center justify-between mb-2">
              <label className="input-label mb-0">PASS</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-toggle-btn"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                <span className="text-[11px] font-mono tracking-wider">{showPassword ? 'HIDE' : 'SHOW'}</span>
              </button>
            </div>
            <div className="curved-box">
              <input
                type={showPassword ? 'text' : 'password'}
                data-testid="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
                autoComplete="current-password"
                className="curved-field"
              />
            </div>
          </div>

          {/* Liquid Submit Button */}
          <div className="submit-wrap">
            <div className="mercury-drop"></div>
            <button
              type="submit"
              data-testid="login-submit-btn"
              className="btn-base"
            >
              LOG IN
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
