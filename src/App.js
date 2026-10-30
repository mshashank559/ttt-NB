import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider, useApp } from './context/AppContext';
import AppShell from './components/AppShell';
import CinematicIntro from './components/CinematicIntro';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Interviews from './pages/Interviews';
import CalendarPage from './pages/CalendarPage';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Team from './pages/Team';
import { Reports, Users as UsersPage, Settings, Profile, Preferences } from './pages/MiscPages';
import CandidateSaga from './pages/CandidateSaga';
import FeedbackPage from './pages/FeedbackPage';
import { permissionsByRole } from './data/mockData';
import './App.css';

const RequireAuth = ({ children, module }) => {
  const { currentRole } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    if (!currentRole) navigate('/login', { replace: true });
  }, [currentRole, navigate]);
  if (!currentRole) return null;
  if (module && !permissionsByRole[currentRole].includes(module)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const Shell = ({ children, module }) => (
  <RequireAuth module={module}>
    <AppShell>{children}</AppShell>
  </RequireAuth>
);

const Root = () => {
  const { currentRole } = useApp();
  return <Navigate to={currentRole ? '/dashboard' : '/login'} replace />;
};

function App() {
  const isExternalCandidate = typeof window !== 'undefined' && 
    (window.location.href.includes('candidate-saga') && 
     (window.location.href.includes('external=true') || window.location.href.includes('recruiter=Manpatel') || window.location.href.includes('source=external') || window.location.href.includes('isExternal=true')));
  const [showIntro, setShowIntro] = useState(!isExternalCandidate);

  return (
    <div className="App min-h-screen relative">
      {showIntro && !isExternalCandidate && (
        <CinematicIntro onComplete={() => setShowIntro(false)} />
      )}
      <AppProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Shell module="dashboard"><Dashboard /></Shell>} />
            <Route path="/tasks" element={<Shell module="tasks"><Tasks /></Shell>} />
            <Route path="/interviews" element={<Shell module="interviews"><Interviews /></Shell>} />
            <Route path="/calendar" element={<Shell module="calendar"><CalendarPage /></Shell>} />
            <Route path="/feedback" element={<Shell module="feedback"><FeedbackPage /></Shell>} />
            <Route path="/analytics" element={<Shell module="analytics"><Analytics /></Shell>} />
            <Route path="/notifications" element={<Shell module="notifications"><Notifications /></Shell>} />
            <Route path="/team" element={<Shell module="team"><Team /></Shell>} />
            <Route path="/reports" element={<Shell module="reports"><Reports /></Shell>} />
            <Route path="/users" element={<Shell module="users"><UsersPage /></Shell>} />
            <Route path="/settings" element={<Shell module="settings"><Settings /></Shell>} />
            <Route path="/profile" element={<Shell module="profile"><Profile /></Shell>} />
            <Route path="/preferences" element={<Shell module="profile"><Preferences /></Shell>} />
            <Route path="/candidate-saga" element={<CandidateSaga />} />
            <Route path="*" element={<Root />} />
          </Routes>
        </HashRouter>
        <Toaster theme="dark" position="top-right" richColors closeButton />
      </AppProvider>
    </div>
  );
}

export default App;
