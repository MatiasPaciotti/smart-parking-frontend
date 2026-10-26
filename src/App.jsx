import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthCard from './components/common/AuthCard';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginForm from './components/LoginForm/LoginForm';
import RegisterForm from './components/RegisterForm/RegisterForm';
import EmailVerificationForm from './components/EmailVerification';
import Dashboard from './components/Dashboard';
import GuardDashboard from './components/GuardDashboard/GuardDashboard';

function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [pendingEmail, setPendingEmail] = useState(null);

  const token = localStorage.getItem('token');
  if (token) {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'admin') {
        return <Navigate to="/guard" replace />;
      }
      if (user?.role === 'user') {
        return <Navigate to="/dashboard" replace />;
      }
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  const handleTabChange = (tab) => {
    setPendingEmail(null);
    setActiveTab(tab);
  };

  const handleVerified = () => {
    setPendingEmail(null);
    setActiveTab('login');
  };

  let content;
  if (pendingEmail) {
    content = <EmailVerificationForm email={pendingEmail} onVerified={handleVerified} />;
  } else if (activeTab === 'login') {
    content = <LoginForm />;
  } else {
    content = <RegisterForm onRegistered={setPendingEmail} />;
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 py-6 sm:py-10 overflow-y-auto">
      <div className="w-full max-w-[386px] my-auto">
        <AuthCard activeTab={activeTab} onTabChange={handleTabChange}>
          {content}
        </AuthCard>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <main className="min-h-screen w-full flex items-center justify-center p-4 py-6 sm:py-10 overflow-y-auto">
                <div className="min-h-screen w-full">
                  <Dashboard />
                </div>
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/guard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <main className="min-h-screen w-full flex items-center justify-center p-4 py-6 sm:py-10 overflow-y-auto">
                <div className="min-h-screen w-full">
                  <GuardDashboard />
                </div>
              </main>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App