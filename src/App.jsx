import React from 'react';
import { useSelector } from 'react-redux';
import RegisterForm from './components/RegisterForm/RegisterForm';
import Dashboard from './components/Dashboard';

function App() {
  const { isRegistered, user } = useSelector((state) => state.auth);

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 py-6 sm:py-10 overflow-y-auto">
      <div className="w-full max-w-[386px] my-auto">
        {isRegistered ? <Dashboard user={user} /> : <RegisterForm />}
      </div>
    </main>
  )
}

export default App
