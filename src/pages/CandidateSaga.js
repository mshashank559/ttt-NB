import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Clock,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronRight,
  ArrowLeft,
  Video,
  RotateCcw,
  ExternalLink,
  Lock,
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import { TECH_SUPPORT_TEAM } from '../data/mockData';

const RECRUITERS = [
  'Aditi Sharma',
  'Rahul Verma',
  'Priya Singh',
  'Neha Patel',
  'Arjun Mehta',
];

const JOB_ROLES = [
  'Software Engineer',
  'Tech Support Engineer',
  'Technical Support Specialist',
  'Solutions Architect',
  'Customer Support Representative',
  'Other',
];

const PERFORMANCE_RATINGS = [
  { key: 'excellent', label: 'Excellent', icon: '✦', desc: 'Attentive, clear explanations & prompt guidance' },
  { key: 'very_good', label: 'Very Good', icon: '↗', desc: 'Knowledgeable and answered technical questions well' },
  { key: 'good', label: 'Good', icon: '✓', desc: 'Met expectations during interview runbook' },
  { key: 'average', label: 'Average', icon: '–', desc: 'Adequate support, slight pauses' },
  { key: 'needs_improvement', label: 'Needs Improvement', icon: '○', desc: 'Experienced technical hurdles' },
];

export default function CandidateSaga() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL query parameters from generated feedback link
  const paramId = searchParams.get('id');
  const paramRecruiter = searchParams.get('recruiter');
  const paramTseId = searchParams.get('tseId');
  const paramTseName = searchParams.get('tseName');
  const paramCandidate = searchParams.get('candidate');
  const paramCompany = searchParams.get('company');
  const paramType = searchParams.get('type');

  const isFromDirectLink = Boolean(paramId || paramTseName);

  // INTRO SEQUENCE CONTROLLER (Cinematic 3.0s NetBounce Logo load plays first)
  const [introActive, setIntroActive] = useState(true);
  const [introStage, setIntroStage] = useState('active');

  // Main UI State: 'landing' | 'form' | 'success' - Landing hero slab renders after intro
  const [viewState, setViewState] = useState('landing');
  const [currentStep, setCurrentStep] = useState(1);

  // Skip or complete intro
  const finishIntro = () => {
    setIntroStage('fade-out');
    setTimeout(() => {
      setIntroActive(false);
      setIntroStage('done');
    }, 700);
  };

  // Replay intro anytime
  const replayIntro = () => {
    setIntroActive(true);
    setIntroStage('active');
  };

  // TIMELINE: PURE SKY + OFFICIAL NB LOGO FOR 3.0s THEN SMOOTH FADE OUT
  useEffect(() => {
    if (!introActive || introStage !== 'active') return;

    const timer = setTimeout(() => {
      finishIntro();
    }, 3000);

    return () => clearTimeout(timer);
  }, [introActive, introStage]);

  const { addSagaFeedback, submitCandidateFeedback } = useApp() || {};

  // FORM DATA STATE (Pre-populated by default from NetBounce link params)
  const [formData, setFormData] = useState({
    candidateName: paramCandidate || '',
    candidateEmail: '',
    recruiterName: paramRecruiter || RECRUITERS[0],
    jobRole: 'Software Engineer',
    interviewDate: new Date().toISOString().slice(0, 10),
    companyName: paramCompany || 'Client Assessment',
    interviewType: 'Technical Round',
    sessionType: paramType || 'TQC',
    tseName: paramTseName || TECH_SUPPORT_TEAM[0].supportName,
    tseId: paramTseId || TECH_SUPPORT_TEAM[0].id,
    supportPerformance: 'excellent',
    overallRating: 5,
    additionalFeedback: '',
    linkRecordId: paramId || null,
  });

  // Sync formData if searchParams change
  useEffect(() => {
    if (paramRecruiter || paramTseName || paramCandidate || paramCompany || paramType || paramId) {
      setFormData(prev => ({
        ...prev,
        candidateName: paramCandidate || prev.candidateName,
        recruiterName: paramRecruiter || prev.recruiterName,
        companyName: paramCompany || prev.companyName,
        sessionType: paramType || prev.sessionType,
        tseName: paramTseName || prev.tseName,
        tseId: paramTseId || prev.tseId,
        linkRecordId: paramId || prev.linkRecordId,
      }));
    }
  }, [paramCandidate, paramRecruiter, paramCompany, paramType, paramTseName, paramTseId, paramId]);

  const [errors, setErrors] = useState({});

  // Mouse Parallax for Interactive Clouds (Exact behavior matching netbounceplacement.com)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const validateStep = (step) => {
    const err = {};
    if (step === 1) {
      if (!formData.candidateName.trim()) err.candidateName = 'Please enter your full name';
      if (!formData.candidateEmail.trim() || !formData.candidateEmail.includes('@')) {
        err.candidateEmail = 'Please provide a valid email address';
      }
    } else if (step === 2) {
      if (!formData.jobRole.trim()) err.jobRole = 'Please specify your job role';
      if (!formData.companyName.trim()) err.companyName = 'Please specify company name';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Find selected tech support details
      const selectedTse = TECH_SUPPORT_TEAM.find(t => t.supportName === formData.tseName) || TECH_SUPPORT_TEAM[0];
      const performanceMap = {
        excellent: 5.0,
        very_good: 4.5,
        good: 4.0,
        average: 3.0,
        needs_improvement: 2.0,
      };
      const perfScore = performanceMap[formData.supportPerformance] || 5.0;
      const nowFormatted = new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const newFeedbackRecord = {
        id: `fb-saga-${Date.now()}`,
        date: formData.interviewDate || new Date().toISOString().slice(0, 10),
        techSupport: selectedTse.supportName,
        techSupportId: selectedTse.id,
        techSupportEmail: selectedTse.email,
        employeeName: selectedTse.employeeName,
        candidateName: formData.candidateName,
        candidateEmail: formData.candidateEmail,
        recruiterName: formData.recruiterName,
        jobRole: formData.jobRole,
        company: formData.companyName,
        round: formData.interviewType || 'Technical Round',
        techSupportType: formData.sessionType || 'TQC',
        timestamp: nowFormatted,
        candidateFeedback: {
          submitted: true,
          performanceRating: perfScore,
          experienceRating: Number(formData.overallRating) || 5.0,
          comments: formData.additionalFeedback || 'Support session completed.',
          timestamp: nowFormatted,
        },
        marketingReview: null,
      };

      if (formData.linkRecordId && submitCandidateFeedback) {
        submitCandidateFeedback(formData.linkRecordId, {
          performanceRating: perfScore,
          experienceRating: Number(formData.overallRating) || 5.0,
          comments: formData.additionalFeedback || 'Support session completed.',
          candidateName: formData.candidateName,
          candidateEmail: formData.candidateEmail,
          timestamp: nowFormatted,
        });
      } else if (addSagaFeedback) {
        addSagaFeedback(newFeedbackRecord);
      }
      setViewState('success');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      setViewState('landing');
    }
  };

  const resetForm = () => {
    setFormData({
      candidateName: '',
      candidateEmail: '',
      recruiterName: RECRUITERS[0],
      jobRole: '',
      interviewDate: new Date().toISOString().slice(0, 10),
      companyName: '',
      interviewType: 'Technical Round',
      sessionType: 'TQC',
      tseName: TECH_SUPPORT_TEAM[0].supportName,
      supportPerformance: 'excellent',
      overallRating: 5,
      additionalFeedback: '',
    });
    setCurrentStep(1);
    setViewState('landing');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a1b42] text-slate-100 overflow-x-hidden font-sans selection:bg-[#1416c1] selection:text-white">
      {/* ========================================================================= */}
      {/* 1. CINEMATIC PURE MOTION NB BRAND INTRO (OFFICIAL SKY BACKDROP) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {introActive && (
          <motion.div
            key="brand-intro-cinematic"
            initial={{ opacity: 1 }}
            animate={{ opacity: introStage === 'fade-out' ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden select-none bg-[#0e3b7c]"
          >
            {/* PURE SKY ONLY (EXACT NETBOUNCE SKY, NO CLOUDS DURING INTRO AS REQUESTED) */}
            <div className="absolute inset-0 pointer-events-none">
              <img
                src="/intro-assets/frame_hero.webp"
                alt="Sky Backdrop"
                className="w-full h-full object-cover select-none"
              />
              {/* Radiant atmospheric bloom overlay for center logo focus */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.28) 0%, rgba(20, 22, 193, 0.15) 55%, rgba(4, 10, 38, 0.45) 100%)',
                }}
              />
            </div>

            {/* Ambient Breathing Royal Blue Aura behind Logo */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0.4 }}
              animate={{
                scale: [1.0, 1.25, 1.1],
                opacity: [0.55, 0.85, 0.55],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute w-[460px] sm:w-[580px] h-[460px] sm:h-[580px] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(20, 22, 193, 0.55) 0%, rgba(58, 149, 254, 0.35) 45%, rgba(0, 0, 0, 0) 70%)',
                filter: 'blur(50px)',
              }}
            />

            {/* CENTER INTRO HERO CONTAINER */}
            <div className="relative z-20 flex flex-col items-center justify-center px-4">
              <div className="relative flex flex-col items-center justify-center">
                {/* The Official NetBounce NB Logo Emblem */}
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    filter: 'brightness(1.5) blur(6px)',
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1.0,
                    filter: 'brightness(1) blur(0px)',
                  }}
                  transition={{
                    duration: 1.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative flex items-center justify-center drop-shadow-[0_15px_45px_rgba(5,15,60,0.7)]"
                >
                  <img
                    src="/intro-assets/nb_logo.png"
                    alt="NetBounce NB Logo"
                    className="h-36 sm:h-48 md:h-56 w-auto object-contain select-none"
                    style={{
                      filter: 'drop-shadow(0 20px 45px rgba(6, 18, 70, 0.75))',
                    }}
                  />

                  {/* Luxury Metallic Light Reflection Glint Sweeping Across Bevel */}
                  <motion.div
                    initial={{ x: '-160%', opacity: 0 }}
                    animate={{ x: '180%', opacity: [0, 0.9, 0] }}
                    transition={{ duration: 1.2, delay: 0.25, ease: 'easeInOut' }}
                    className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 pointer-events-none"
                  />
                </motion.div>

                {/* Quiet Luxury Typography: NETBOUNCE • CANDIDATE SAGA */}
                <motion.div
                  initial={{ opacity: 0, y: 16, letterSpacing: '0.25em' }}
                  animate={{ opacity: 1, y: 0, letterSpacing: '0.45em' }}
                  transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                  className="mt-7 sm:mt-9 flex flex-col items-center gap-2"
                >
                  <div className="text-lg sm:text-2xl md:text-3xl font-black tracking-[0.45em] text-white uppercase drop-shadow-[0_3px_14px_rgba(0,0,0,0.7)]">
                    NETBOUNCE
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-[1.5px] w-8 sm:w-12 bg-gradient-to-r from-transparent via-white to-blue-200" />
                    <div className="text-[11px] sm:text-xs font-bold tracking-[0.35em] text-white/90 uppercase drop-shadow-md">
                      CANDIDATE SAGA
                    </div>
                    <div className="h-[1.5px] w-8 sm:w-12 bg-gradient-to-l from-transparent via-white to-blue-200" />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Sleek, Minimalist "Skip" Button */}
            <div className="absolute bottom-8 right-8 z-30">
              <button
                onClick={finishIntro}
                className="group flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white bg-[#070e30]/75 hover:bg-[#1416c1] border border-white/20 hover:border-white/40 backdrop-blur-md transition-all duration-200 shadow-xl"
              >
                <span>Skip</span>
                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. AUTHENTIC NETBOUNCE SKY & MOTION CLOUDS ENVIRONMENT (EXACT LIKE SITE) */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Sky Base Image (Same as netbounceplacement.com Frame Hero) */}
        <img
          src="/intro-assets/frame_hero.webp"
          alt="NetBounce Sky"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Soft Contrast Gradient to balance bright sky and readability */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(8, 20, 60, 0.42) 0%, rgba(6, 14, 45, 0.28) 40%, rgba(4, 9, 32, 0.68) 100%)',
          }}
        />

        {/* CLOUD 1 (Top / Right Drift & Mouse Parallax - Exact NetBounce Cloud-1) */}
        <motion.img
          src="/intro-assets/cloud_1.webp"
          alt="Cloud 1"
          className="absolute pointer-events-none select-none"
          style={{
            width: '64%',
            maxWidth: '1350px',
            top: '-6%',
            right: '-18%',
            filter: 'drop-shadow(0 25px 45px rgba(8, 25, 75, 0.3))',
          }}
          animate={{
            x: mousePos.x * 24,
            y: [0, -18, 0, 14, 0],
            rotate: [-0.6, 0.6, -0.6],
          }}
          transition={{
            x: { type: 'spring', stiffness: 45, damping: 25 },
            y: { repeat: Infinity, duration: 14, ease: 'easeInOut' },
            rotate: { repeat: Infinity, duration: 16, ease: 'easeInOut' },
          }}
        />

        {/* CLOUD 2 (Bottom / Left Drift & Mouse Parallax - Exact NetBounce Cloud-2) */}
        <motion.img
          src="/intro-assets/cloud_2.webp"
          alt="Cloud 2"
          className="absolute pointer-events-none select-none"
          style={{
            width: '56%',
            maxWidth: '1200px',
            bottom: '-10%',
            left: '-14%',
            filter: 'drop-shadow(0 25px 45px rgba(8, 25, 75, 0.3))',
          }}
          animate={{
            x: -mousePos.x * 30,
            y: [0, 18, 0, -14, 0],
            rotate: [0.6, -0.6, 0.6],
          }}
          transition={{
            x: { type: 'spring', stiffness: 45, damping: 25 },
            y: { repeat: Infinity, duration: 15, ease: 'easeInOut' },
            rotate: { repeat: Infinity, duration: 17, ease: 'easeInOut' },
          }}
        />

        {/* Ambient Center Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(37, 70, 240, 0.18) 0%, rgba(4, 8, 28, 0) 70%)',
            filter: 'blur(70px)',
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. TOP BRAND HEADER (NETBOUNCE LOGO IDENTITY) */}
      {/* ========================================================================= */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 pt-6 pb-4 flex items-center justify-between">
        {/* Left: NetBounce NB Hero Badge */}
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-[#080f33]/80 border border-white/20 flex items-center justify-center backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] p-1.5 transition-transform hover:scale-105">
            <img
              src="/intro-assets/nb_mark_white_clean.png"
              alt="NB"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 leading-none">
              <span className="text-base font-extrabold text-white tracking-tight">NetBounce</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-gradient-to-r from-[#1416c1] to-[#2546f0] text-white tracking-wider shadow-sm">
                SAGA
              </span>
            </div>
            <div className="text-[10px] sm:text-[10.5px] tracking-[0.16em] uppercase font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] mt-1.5">
              SUPPORT ASSESSMENT &amp; GROWTH ANALYTICS
            </div>
          </div>
        </div>

        {/* Right: Controls & Navigation */}
        <div className="flex items-center gap-3">
          {/* Replay Brand Intro Button */}
          <button
            id="brand-intro-btn"
            onClick={replayIntro}
            title="Replay Brand Intro"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-200 hover:text-white bg-[#0a123d]/70 hover:bg-[#1416c1]/40 border border-blue-500/30 backdrop-blur-md transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw size={12} className="text-blue-400" />
            <span className="hidden sm:inline">Brand Intro</span>
          </button>

          {/* TSE Interview Evaluation Tag */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs bg-[#060c2b]/80 border border-blue-500/20 backdrop-blur-md text-blue-100 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
            <span className="font-semibold">Candidate Portal</span>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-[#081033]/60 hover:bg-[#1416c1]/40 border border-slate-700/60 hover:border-blue-500/40 backdrop-blur-md transition-all"
          >
            <span>TTT Portal</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT AREA (NETBOUNCE GLASS SLAB & FORM) */}
      {/* ========================================================================= */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-6 md:py-12 min-h-[calc(100vh-140px)] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* ===================================================================== */}
          {/* VIEW A: LANDING PAGE STATE */}
          {/* ===================================================================== */}
          {viewState === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full max-w-2xl mx-auto"
            >
              {/* NetBounce Branded Hero Slab */}
              <div>
                <div className="p-7 sm:p-10 rounded-3xl bg-[#070e30]/80 border border-blue-500/25 backdrop-blur-2xl shadow-[0_20px_60px_rgba(2,4,16,0.8)] space-y-5 relative overflow-hidden">
                  {/* Subtle Top Edge Light Sheen */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#1416c1]/25 border border-blue-500/30 text-blue-200">
                    <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                    <span>Technical Support Engineer Evaluation</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-[1.1]">
                    Your feedback <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400">
                      empowers growth.
                    </span>
                  </h1>

                  <p className="text-base text-blue-100/80 font-normal leading-relaxed max-w-xl">
                    NetBounce brings candidates and technical support engineers together.
                    Share your experience during your interview round to elevate the quality of our engineering sessions.
                  </p>

                  <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-blue-200/75">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-blue-400" />
                      <span>Takes 2 minutes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-blue-400" />
                      <span>100% Confidential</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Direct TSE Review</span>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      data-testid="start-feedback-btn"
                      onClick={() => setViewState('form')}
                      className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-sm bg-gradient-to-r from-[#1416c1] via-[#1e2beb] to-[#2546f0] text-white hover:from-[#191bf0] hover:to-[#385aff] hover:shadow-[0_0_35px_rgba(20,22,193,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                      <span>Start SAGA Feedback</span>
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1.5 transition-transform duration-200"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* VIEW B: NETBOUNCE THEMED 5-STEP FORM */}
          {/* ===================================================================== */}
          {viewState === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="w-full max-w-xl mx-auto"
            >
              {/* NETBOUNCE ROYAL BLUE FROSTED GLASS CONTAINER */}
              <div className="rounded-3xl bg-[#070e30]/80 border border-blue-500/30 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(2,4,16,0.85)] relative overflow-hidden">
                {/* Top Subtle Edge Highlight */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

                {/* Header: Back & Step Indicator */}
                <div className="flex items-center justify-between pb-4 border-b border-blue-500/20">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-200 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                      Step {currentStep} of 5
                    </span>
                  </div>
                </div>

                {/* Progress Bar (NetBounce Royal Blue) */}
                <div className="mt-3.5 h-1.5 w-full bg-[#030616] rounded-full overflow-hidden border border-blue-500/20">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#1416c1] to-[#2546f0] rounded-full shadow-[0_0_10px_rgba(20,22,193,0.8)]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(currentStep / 5) * 100}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>

                {/* Steps Body */}
                <div className="mt-6 min-h-[320px]">
                  {/* STEP 1: ABOUT YOU */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="space-y-4"
                    >
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                          About You
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                          Let&apos;s start with your details.
                        </h2>
                      </div>

                      {/* Candidate Name */}
                      <div>
                        <label className="text-xs font-semibold text-blue-100">
                          Candidate Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.candidateName}
                          onChange={e => setFormData({ ...formData, candidateName: e.target.value })}
                          placeholder="e.g. Aisha Khan"
                          className="mt-1.5 w-full h-11 px-4 rounded-xl bg-[#040822]/80 border border-blue-500/30 focus:border-[#2546f0] focus:ring-2 focus:ring-[#1416c1]/40 text-sm text-white placeholder-slate-400 transition-all outline-none"
                        />
                        {errors.candidateName && (
                          <p className="text-xs text-rose-400 mt-1">{errors.candidateName}</p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="text-xs font-semibold text-blue-100">
                          Email Address <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.candidateEmail}
                          onChange={e => setFormData({ ...formData, candidateEmail: e.target.value })}
                          placeholder="aisha.khan@example.com"
                          className="mt-1.5 w-full h-11 px-4 rounded-xl bg-[#040822]/80 border border-blue-500/30 focus:border-[#2546f0] focus:ring-2 focus:ring-[#1416c1]/40 text-sm text-white placeholder-slate-400 transition-all outline-none"
                        />
                        {errors.candidateEmail && (
                          <p className="text-xs text-rose-400 mt-1">{errors.candidateEmail}</p>
                        )}
                      </div>

                      {/* Recruiter Name */}
                      <div>
                        <label className="text-xs font-semibold text-blue-100 flex items-center justify-between">
                          <span>Your Recruiter Name <span className="text-rose-400">*</span></span>
                          {paramRecruiter && (
                            <span className="text-[10px] text-blue-300 flex items-center gap-1 font-normal">
                              <Lock size={10} className="text-blue-400" /> Pre-Assigned by NetBounce
                            </span>
                          )}
                        </label>
                        <select
                          value={formData.recruiterName}
                          onChange={e => setFormData({ ...formData, recruiterName: e.target.value })}
                          className="mt-1.5 w-full h-11 px-4 rounded-xl bg-[#040822] border border-blue-500/30 focus:border-[#2546f0] text-sm text-white transition-all outline-none"
                        >
                          {formData.recruiterName && !RECRUITERS.includes(formData.recruiterName) && (
                            <option value={formData.recruiterName} className="bg-[#070e30] text-white">
                              {formData.recruiterName}
                            </option>
                          )}
                          {RECRUITERS.map(r => (
                            <option key={r} value={r} className="bg-[#070e30] text-white">
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: SESSION DETAILS */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="space-y-4"
                    >
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                          Session Details
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                          Tell us about the interview.
                        </h2>
                      </div>

                      {/* Job Role (Typeable Input) */}
                      <div>
                        <label className="text-xs font-semibold text-blue-100">Job Role</label>
                        <input
                          type="text"
                          list="job-roles-datalist"
                          value={formData.jobRole}
                          onChange={e => setFormData({ ...formData, jobRole: e.target.value })}
                          placeholder="e.g. Software Engineer, Tech Support Specialist"
                          className="mt-1.5 w-full h-11 px-4 rounded-xl bg-[#040822]/80 border border-blue-500/30 focus:border-[#2546f0] text-sm text-white placeholder-slate-400 outline-none"
                        />
                        <datalist id="job-roles-datalist">
                          {JOB_ROLES.filter(r => r !== 'Other').map(role => (
                            <option key={role} value={role} />
                          ))}
                        </datalist>
                        {errors.jobRole && (
                          <p className="text-xs text-rose-400 mt-1">{errors.jobRole}</p>
                        )}
                      </div>

                      {/* Interview Date & Company */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-blue-100">Interview Date</label>
                          <input
                            type="date"
                            value={formData.interviewDate}
                            onChange={e => setFormData({ ...formData, interviewDate: e.target.value })}
                            className="mt-1.5 w-full h-11 px-3 rounded-xl bg-[#040822]/80 border border-blue-500/30 focus:border-[#2546f0] text-sm text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-blue-100">Company Name</label>
                          <input
                            type="text"
                            value={formData.companyName}
                            onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                            placeholder="e.g. Amazon, Google, Meta"
                            className="mt-1.5 w-full h-11 px-4 rounded-xl bg-[#040822]/80 border border-blue-500/30 focus:border-[#2546f0] text-sm text-white placeholder-slate-400 outline-none"
                          />
                          {errors.companyName && (
                            <p className="text-xs text-rose-400 mt-1">{errors.companyName}</p>
                          )}
                        </div>
                      </div>

                      {/* Interview Type (Choice Buttons) */}
                      <div>
                        <label className="text-xs font-semibold text-blue-100">Interview Type</label>
                        <div className="grid grid-cols-2 gap-3 mt-1.5">
                          {['Screening Round', 'Technical Round'].map(type => {
                            const isSelected = formData.interviewType === type;
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, interviewType: type })}
                                className={`h-11 px-4 rounded-xl text-xs font-bold border transition-all ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-[#1416c1] to-[#2546f0] text-white border-blue-400 shadow-[0_0_15px_rgba(20,22,193,0.5)]'
                                    : 'bg-[#040822]/70 border-blue-500/25 text-blue-200 hover:bg-[#070e33] hover:text-white'
                                }`}
                              >
                                {type}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sessions (TQC, TUC, RUC, JDC - Same Style as Interview Type) */}
                      <div>
                        <label className="text-xs font-semibold text-blue-100">Sessions</label>
                        <div className="grid grid-cols-4 gap-2.5 mt-1.5">
                          {['TQC', 'TUC', 'RUC', 'JDC'].map(session => {
                            const isSelected = formData.sessionType === session;
                            return (
                              <button
                                key={session}
                                type="button"
                                onClick={() => setFormData({ ...formData, sessionType: session })}
                                className={`h-11 px-3 rounded-xl text-xs font-bold border transition-all ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-[#1416c1] to-[#2546f0] text-white border-blue-400 shadow-[0_0_15px_rgba(20,22,193,0.5)]'
                                    : 'bg-[#040822]/70 border-blue-500/25 text-blue-200 hover:bg-[#070e33] hover:text-white'
                                }`}
                              >
                                {session}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: TSE REVIEW */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="space-y-4"
                    >
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                          TSE Performance Review
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                          How did the support engineer perform?
                        </h2>
                      </div>

                      {/* Who did you interview with? */}
                      <div>
                        <label className="text-xs font-semibold text-blue-100 flex items-center justify-between">
                          <span>Assigned Tech Support Engineer</span>
                          {paramTseName && (
                            <span className="text-[10px] text-blue-300 flex items-center gap-1 font-normal">
                              <Lock size={10} className="text-blue-400" /> Pre-Assigned Session
                            </span>
                          )}
                        </label>
                        <select
                          value={formData.tseName}
                          onChange={e => {
                            const found = TECH_SUPPORT_TEAM.find(t => t.supportName === e.target.value);
                            setFormData({
                              ...formData,
                              tseName: e.target.value,
                              tseId: found ? found.id : formData.tseId,
                            });
                          }}
                          className="mt-1.5 w-full h-11 px-4 rounded-xl bg-[#040822] border border-blue-500/30 focus:border-[#2546f0] text-sm text-white outline-none"
                        >
                          {formData.tseName && !TECH_SUPPORT_TEAM.some(t => t.supportName === formData.tseName) && (
                            <option value={formData.tseName} className="bg-[#070e30] text-white">
                              {formData.tseName} ({formData.tseId})
                            </option>
                          )}
                          {TECH_SUPPORT_TEAM.map(tse => (
                            <option key={tse.id} value={tse.supportName} className="bg-[#070e30] text-white">
                              {tse.supportName} ({tse.id}) — {tse.employeeName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Performance Rating Cards */}
                      <div>
                        <label className="text-xs font-semibold text-blue-100 mb-2 block">
                          Performance rating
                        </label>
                        <div className="space-y-2">
                          {PERFORMANCE_RATINGS.map(rate => {
                            const isSelected = formData.supportPerformance === rate.key;
                            return (
                              <div
                                key={rate.key}
                                onClick={() => setFormData({ ...formData, supportPerformance: rate.key })}
                                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-[#1416c1]/35 border-blue-400 text-white shadow-[0_0_15px_rgba(20,22,193,0.4)]'
                                    : 'bg-[#040822]/60 border-blue-500/20 text-blue-100/80 hover:bg-[#070e33]'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-sm text-blue-300">{rate.icon}</span>
                                  <div>
                                    <div className="text-xs font-bold">{rate.label}</div>
                                    <div className="text-[11px] text-blue-200/70">{rate.desc}</div>
                                  </div>
                                </div>
                                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-400 bg-[#2546f0]' : 'border-slate-600'}`}>
                                  {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: OVERALL RATING */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="space-y-6 text-center py-4"
                    >
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                          Overall Satisfaction
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                          Rate your total experience.
                        </h2>
                        <p className="text-xs text-blue-200/70 mt-1 max-w-sm mx-auto">
                          How satisfied were you with the guidance, timing, and support provided?
                        </p>
                      </div>

                      {/* 1-5 Star Selection Buttons */}
                      <div className="flex items-center justify-center gap-3 pt-3">
                        {[1, 2, 3, 4, 5].map(score => {
                          const isSelected = formData.overallRating >= score;
                          const isExact = formData.overallRating === score;
                          return (
                            <button
                              key={score}
                              type="button"
                              onClick={() => setFormData({ ...formData, overallRating: score })}
                              className={`h-14 w-14 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all ${
                                isExact
                                  ? 'bg-gradient-to-tr from-[#1416c1] to-[#2546f0] text-white border-blue-400 shadow-[0_0_20px_rgba(20,22,193,0.7)] scale-110'
                                  : isSelected
                                  ? 'bg-[#1416c1]/40 border-blue-400/50 text-blue-200'
                                  : 'bg-[#040822]/60 border-blue-500/20 text-slate-500 hover:text-white hover:bg-[#070e30]'
                              }`}
                            >
                              <Star size={18} className={isSelected ? 'fill-current text-amber-400' : ''} />
                              <span className="text-xs font-bold">{score}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-xs font-medium text-blue-200">
                        {formData.overallRating === 5 && '🌟 Exceptional — Exceeded expectations.'}
                        {formData.overallRating === 4 && '✨ Very Good — Professional and clear.'}
                        {formData.overallRating === 3 && '👍 Good — Standard support provided.'}
                        {formData.overallRating <= 2 && '⚠️ Needs Attention — Issues experienced.'}
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 5: FINAL THOUGHTS */}
                  {currentStep === 5 && (
                    <motion.div
                      key="step5"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="space-y-4"
                    >
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                          Final Thoughts
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                          Any closing notes?
                        </h2>
                        <p className="text-xs text-blue-200/70 mt-1">
                          Share any additional feedback that helps NetBounce make future sessions even better.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-blue-100">
                          Additional Comments
                        </label>
                        <textarea
                          rows={5}
                          value={formData.additionalFeedback}
                          onChange={e => setFormData({ ...formData, additionalFeedback: e.target.value })}
                          placeholder="e.g. The TSE arrived on time, was extremely supportive, clarified system requirements and made the entire process seamless..."
                          className="mt-1.5 w-full p-4 rounded-2xl bg-[#040822]/80 border border-blue-500/30 focus:border-[#2546f0] focus:ring-2 focus:ring-[#1416c1]/40 text-sm text-white placeholder-slate-400 outline-none resize-none transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Form Bottom Navigation */}
                <div className="pt-5 border-t border-blue-500/20 flex items-center justify-between">
                  <button
                    onClick={handleBack}
                    className="h-10 px-5 rounded-full text-xs font-semibold bg-[#040822] hover:bg-[#070e30] border border-blue-500/30 text-blue-200 hover:text-white transition-all"
                  >
                    Back
                  </button>

                  <button
                    onClick={handleNext}
                    className="h-10 px-6 rounded-full text-xs font-bold bg-gradient-to-r from-[#1416c1] via-[#1d2be8] to-[#2546f0] text-white hover:from-[#1a1df5] hover:to-[#385aff] shadow-[0_0_20px_rgba(20,22,193,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                  >
                    <span>{currentStep === 5 ? 'Submit SAGA Feedback' : 'Continue'}</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* VIEW C: SUCCESS CONFIRMATION */}
          {/* ===================================================================== */}
          {viewState === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md mx-auto text-center"
            >
              <div className="p-8 rounded-3xl bg-[#070e30]/80 border border-blue-500/30 backdrop-blur-2xl shadow-[0_25px_60px_rgba(2,4,16,0.85)] relative overflow-hidden">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#1416c1] to-[#2546f0] border border-blue-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(20,22,193,0.6)]">
                  <CheckCircle2 size={32} className="text-white" />
                </div>

                <div className="mt-5 text-[11px] font-bold tracking-widest uppercase text-blue-400">
                  Response Recorded
                </div>

                <h3 className="mt-1 text-2xl font-bold text-white">
                  Thank you, {formData.candidateName || 'Candidate'}!
                </h3>

                <p className="mt-2 text-xs text-blue-100/75 leading-relaxed max-w-sm mx-auto">
                  Your feedback for <span className="font-semibold text-white">{formData.tseName}</span> has been securely logged into the NetBounce Tech Team Tracker.
                </p>

                <div className="mt-6 pt-5 border-t border-blue-500/20">
                  <button
                    onClick={resetForm}
                    className="w-full h-11 rounded-full text-xs font-bold bg-gradient-to-r from-[#1416c1] to-[#2546f0] text-white hover:from-[#1b1ef7] hover:to-[#385aff] transition-all shadow-[0_0_20px_rgba(20,22,193,0.5)]"
                  >
                    Submit Another Feedback
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ========================================================================= */}
      {/* 5. MINIMAL NETBOUNCE FOOTER */}
      {/* ========================================================================= */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-blue-300/60 border-t border-blue-500/15">
        <div className="flex items-center gap-2">
          <span>Powered by</span>
          <span className="text-white font-semibold">NetBounce Placement</span>
          <span>•</span>
          <span className="text-blue-300 font-medium">Candidate SAGA</span>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center gap-4">
          <span>Enterprise Technical Support</span>
          <span>•</span>
          <span>Confidential &amp; Encrypted</span>
        </div>
      </footer>
    </div>
  );
}
