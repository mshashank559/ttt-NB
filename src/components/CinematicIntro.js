import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * NetBounce Cinematic Website Intro
 *
 * Requirements:
 * 1. Initial Screen: Pure Black (#000000), full viewport cover (z-[99999]).
 * 2. Real NB Logo: /intro-assets/nb_logo.png centered horizontally & vertically.
 * 3. Background Waves: Subtle dark navy & midnight-blue (#071426, #0B1F3A), translucent & fluid.
 * 4. White Circular Loader: Exactly 5 seconds beneath logo, silent (no text/timer).
 * 5. Brand Reveal at 5s: Spinner fades out, logo glides left, "NetBounce Placement LLC" reveals.
 * 6. Smooth Transition: Fade out to existing login/entry page without flicker or layout shift.
 */
export default function CinematicIntro({ onComplete }) {
  // Stages: 'loading' (0-5s) -> 'revealed' (5-6.6s) -> 'exiting' (6.6-7.4s) -> 'complete'
  const [stage, setStage] = useState('loading');

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // For reduced motion users: shorter, gentle transition
      const timerQuick = setTimeout(() => {
        setStage('revealed');
        setTimeout(() => {
          setStage('exiting');
          setTimeout(() => {
            onComplete?.();
          }, 400);
        }, 1000);
      }, 1500);

      return () => clearTimeout(timerQuick);
    }

    // Standard 5-second cinematic intro sequence
    const tReveal = setTimeout(() => {
      setStage('revealed');
    }, 5000);

    const tExit = setTimeout(() => {
      setStage('exiting');
    }, 6600);

    const tComplete = setTimeout(() => {
      setStage('complete');
      onComplete?.();
    }, 7400);

    return () => {
      clearTimeout(tReveal);
      clearTimeout(tExit);
      clearTimeout(tComplete);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: stage === 'exiting' ? 0 : 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[99999] bg-[#000000] overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ touchAction: 'none' }}
      aria-hidden={stage === 'complete'}
    >
      {/* ==================================================================== */}
      {/* 1. SUBTLE AMBIENT MIDNIGHT-BLUE WAVES (BEHIND & AROUND LOGO) */}
      {/* ==================================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Radial Center Vignette (Ensures Center Remains Pure Black) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(11, 31, 58, 0.18) 0%, rgba(7, 20, 38, 0.12) 40%, #000000 70%)',
          }}
        />

        {/* Ambient Breathing Midnight Navy Halo (#071426, #0B1F3A) */}
        <motion.div
          animate={{
            scale: [1, 1.14, 1],
            opacity: [0.28, 0.42, 0.28],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] sm:w-[620px] sm:h-[620px] md:w-[800px] md:h-[800px] rounded-full blur-[90px] sm:blur-[130px] bg-gradient-to-tr from-[#071426] via-[#0B1F3A] to-transparent pointer-events-none"
        />

        {/* Subtle Horizontal Flowing Waves */}
        <motion.div
          animate={{
            x: ['-4%', '4%', '-4%'],
            y: ['-2%', '2%', '-2%'],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] opacity-35 pointer-events-none"
        >
          <svg
            viewBox="0 0 1440 800"
            className="w-full h-full fill-none"
            preserveAspectRatio="none"
          >
            <path
              d="M -100 420 Q 360 320, 720 440 T 1540 400 L 1540 800 L -100 800 Z"
              fill="url(#nb-wave-dark-1)"
            />
            <path
              d="M -100 480 Q 320 560, 780 460 T 1540 520 L 1540 800 L -100 800 Z"
              fill="url(#nb-wave-dark-2)"
            />
            <defs>
              <linearGradient id="nb-wave-dark-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#071426" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#0B1F3A" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="nb-wave-dark-2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0B1F3A" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#071426" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

      {/* ==================================================================== */}
      {/* 2. CENTER STAGE: LOGO & BRAND REVEAL LOCKUP */}
      {/* ==================================================================== */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-[95vw] px-4">
        {/* Horizontal Brand Lockup Container */}
        <div className="flex items-center justify-center">
          {/* Real Official NetBounce NB Logo Emblem (Larger & More Prominent) */}
          <motion.div
            initial={false}
            animate={{
              scale: stage === 'loading' ? 1 : 0.88,
            }}
            transition={{
              duration: 0.95,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex-shrink-0 flex items-center justify-center"
          >
            <img
              src="/intro-assets/nb_logo.png"
              alt="NetBounce"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-44 md:h-44 lg:w-48 lg:h-48 object-contain drop-shadow-[0_0_35px_rgba(11,31,58,0.55)] pointer-events-none"
            />
          </motion.div>

          {/* Smooth Expanding Brand Text: "NetBounce Placement LLC" */}
          <motion.div
            initial={{ width: 0, opacity: 0, x: -20 }}
            animate={{
              width: stage === 'revealed' || stage === 'exiting' ? 'auto' : 0,
              opacity: stage === 'revealed' || stage === 'exiting' ? 1 : 0,
              x: stage === 'revealed' || stage === 'exiting' ? 0 : -20,
            }}
            transition={{
              duration: 0.95,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="overflow-hidden whitespace-nowrap flex items-center"
          >
            <span className="font-semibold text-white tracking-wide text-2xl sm:text-3xl md:text-4xl lg:text-[44px] ml-5 sm:ml-7 md:ml-9 font-sans leading-none">
              NetBounce Placement LLC
            </span>
          </motion.div>
        </div>

        {/* ================================================================== */}
        {/* 3. MINIMAL WHITE CIRCULAR LOADER (EXACTLY 5 SECONDS, NO TEXT) */}
        {/* ================================================================== */}
        <div className="h-12 mt-10 sm:mt-14 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 1 }}
            animate={{
              opacity: stage === 'loading' ? 1 : 0,
              scale: stage === 'loading' ? 1 : 0.8,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            {stage === 'loading' && (
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-20"
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
                <path
                  className="opacity-95"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  d="M12 3 a 9 9 0 0 1 9 9"
                />
              </svg>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
