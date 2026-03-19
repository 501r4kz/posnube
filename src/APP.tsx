import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import POSRegister from './components/POSRegister';
import ShiftClose from './components/ShiftClose';
import AdminPanel from './components/AdminPanel';
import { useOffline } from './hooks/useOffline';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'pos' | 'close-shift' | 'admin'>('pos');
  const isOffline = useOffline();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      {currentView === 'pos' && (
        <POSRegister onNavigate={setCurrentView} isOffline={isOffline} />
      )}
      {currentView === 'close-shift' && (
        <ShiftClose onNavigate={setCurrentView} />
      )}
      {currentView === 'admin' && (
        <AdminPanel onNavigate={setCurrentView} />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
