
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm/RegisterForm';
import LoginForm from './components/LoginForm/LoginForm';
import Dashboard from './components/Dashboard';
import AuthCard from './components/common/AuthCard';

function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 py-6 sm:py-10 overflow-y-auto">
      <div className="w-full max-w-[386px] my-auto">
        <AuthCard activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
        </AuthCard>
      </div>
    </main>
  );
}

function ProtectedRoute({ children }) {
  const token = useSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
