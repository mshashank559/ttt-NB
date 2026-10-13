import React from 'react';
import { motion } from 'framer-motion';

/**
 * NetBounce Circular AI Logo with Wave Animation
 * 
 * Features:
 * 1. Exact official NetBounce logo (/intro-assets/nb_logo.png) in a sleek circle.
 * 2. When a question is submitted / AI is responding (isSpeaking = true),
 *    concentric circular waves ripple outward around the circular logo.
 * 3. Completely removed 3D canvas orb, telemetry badges, and clutter.
 */
export default function AiEnergyOrb({ size = 120, isSpeaking = false, className = '' }) {
  const circleSize = size;

  return (
    <div
      className={`relative flex items-center justify-center select-none py-2 ${className}`}
      style={{ width: circleSize + 80, height: circleSize + 60 }}
    >
      {/* 🌊 Concentric Circular Waves (Triggers when question is entered / AI is thinking) */}
      {isSpeaking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Wave 1 */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0.9 }}
            animate={{ scale: [1, 1.85], opacity: [0.9, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            className="absolute rounded-full border-2 border-cyan-400 bg-cyan-400/15"
            style={{ width: circleSize, height: circleSize }}
          />
          {/* Wave 2 */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: [1, 2.3], opacity: [0.8, 0] }}
            transition={{ duration: 1.8, delay: 0.35, repeat: Infinity, ease: 'easeOut' }}
            className="absolute rounded-full border-2 border-blue-500 bg-blue-500/10"
            style={{ width: circleSize, height: circleSize }}
          />
          {/* Wave 3 */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0.65 }}
            animate={{ scale: [1, 2.75], opacity: [0.65, 0] }}
            transition={{ duration: 2.1, delay: 0.7, repeat: Infinity, ease: 'easeOut' }}
            className="absolute rounded-full border border-sky-400/80 bg-sky-400/5"
            style={{ width: circleSize, height: circleSize }}
          />
        </div>
      )}

      {/* Ambient background glow */}
      <div
        className={`absolute rounded-full blur-xl transition-all duration-500 pointer-events-none ${
          isSpeaking
            ? 'w-36 h-36 bg-cyan-400/30'
            : 'w-28 h-28 bg-blue-600/20'
        }`}
      />

      {/* 🔷 The Circular NetBounce (NB) Logo Badge */}
      <motion.div
        animate={{
          scale: isSpeaking ? [1, 1.07, 1] : [1, 1.02, 1],
        }}
        transition={{
          duration: isSpeaking ? 0.65 : 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10 flex items-center justify-center rounded-full p-3 bg-white shadow-[0_0_30px_rgba(20,29,199,0.35)] border-2 border-cyan-400/60 transition-all duration-300"
        style={{ width: circleSize, height: circleSize }}
      >
        {/* Subtle inner ring */}
        <div className="absolute inset-1 rounded-full border border-blue-100/60 pointer-events-none" />

        {/* Exact NetBounce Logo in circle */}
        <img
          src="/intro-assets/nb_logo.png"
          alt="NetBounce AI Logo"
          className="relative z-10 w-full h-full object-contain filter drop-shadow-sm"
        />
      </motion.div>
    </div>
  );
}
