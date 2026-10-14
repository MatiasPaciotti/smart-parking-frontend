import React, { useState } from 'react';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';

function App() {
  const [isRegistered, setIsRegistered] = useState(false);

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 py-6 sm:py-10 overflow-y-auto">
      <div className="w-full max-w-[386px] my-auto">
        {isRegistered ? (
          <Dashboard />
        ) : (
          <RegisterForm onRegisterSuccess={() => setIsRegistered(true)} />
        )}
      </div>
    </main>
    
  )
}

export default App
