import React from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm/RegisterForm';
import Dashboard from './components/Dashboard';

function App() {

  return (
    <BrowserRouter>
      <main className="min-h-screen w-full flex items-center justify-center p-4 py-6 sm:py-10 overflow-y-auto">
        <div className="w-full max-w-[386px] my-auto">
          <Routes>
            <Route path="/" element={<RegisterForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  )
}

export default App
