import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { BookingModal } from './components/BookingModal';
import { ProviderDetailModal } from './components/ProviderDetailModal';
import { SOSModal } from './components/SOSModal';
import { RatingModal } from './components/RatingModal';

// Auth Pages
import { WelcomeScreen } from './pages/WelcomeScreen';
import { CustomerLogin } from './pages/CustomerLogin';
import { CustomerRegister } from './pages/CustomerRegister';
import { ProviderLogin } from './pages/ProviderLogin';
import { ProviderRegister } from './pages/ProviderRegister';

// Main Pages
import { CustomerHome } from './pages/CustomerHome';
import { BookingsPage } from './pages/BookingsPage';
import { SOSPage } from './pages/SOSPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { ProviderJobsPage } from './pages/ProviderJobsPage';
import { ProviderEarningsPage } from './pages/ProviderEarningsPage';

export const App = () => {
  const {
    authUser,
    demoMode,
    liveBanner,
    setLiveBanner,
    role,
    setRole,
    wsConnected
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Screen selection for unauthenticated users:
  // 'welcome' | 'customer-login' | 'customer-register' | 'provider-login' | 'provider-register'
  const [authView, setAuthView] = useState('welcome');

  // Route customer to / and provider to /provider upon login
  useEffect(() => {
    if (authUser) {
      if (authUser.role === 'provider' && location.pathname === '/') {
        navigate('/provider', { replace: true });
      } else if (authUser.role === 'customer' && location.pathname.startsWith('/provider')) {
        navigate('/', { replace: true });
      }
    }
  }, [authUser?.role]);

  // If user is not authenticated and demo mode is OFF, render Welcome / Auth screens
  if (!authUser && !demoMode) {
    if (authView === 'customer-login') {
      return (
        <CustomerLogin
          onSwitchAuth={setAuthView}
          onBackToWelcome={() => setAuthView('welcome')}
        />
      );
    }
    if (authView === 'customer-register') {
      return (
        <CustomerRegister
          onSwitchAuth={setAuthView}
          onBackToWelcome={() => setAuthView('welcome')}
        />
      );
    }
    if (authView === 'provider-login') {
      return (
        <ProviderLogin
          onSwitchAuth={setAuthView}
          onBackToWelcome={() => setAuthView('welcome')}
        />
      );
    }
    if (authView === 'provider-register') {
      return (
        <ProviderRegister
          onSwitchAuth={setAuthView}
          onBackToWelcome={() => setAuthView('welcome')}
        />
      );
    }

    // Default: Welcome Screen with role options & Demo Mode toggle
    return <WelcomeScreen onSelectAuth={setAuthView} />;
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body-md antialiased selection:bg-primary-container selection:text-white">
      {/* Top Header with Role Switcher & Location */}
      <Header />

      {/* Live WebSocket Siren / Stand-down Banner */}
      {liveBanner && (
        <div className="fixed top-16 left-0 right-0 z-50 px-3 pt-2">
          <div className="max-w-md mx-auto">
            <div
              className={`p-3.5 rounded-2xl shadow-2xl border flex items-start justify-between gap-2.5 animate-in slide-in-from-top duration-300 ${
                liveBanner.type === 'emergency'
                  ? 'bg-gradient-to-r from-error via-[#b81d1d] to-[#7f0a0a] text-white border-white/40'
                  : liveBanner.type === 'stand_down'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white border-amber-300'
                  : liveBanner.type === 'success'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white border-emerald-300'
                  : 'bg-slate-navy text-white border-outline-variant'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="material-symbols-outlined text-[24px] flex-shrink-0 animate-bounce">
                  {liveBanner.type === 'emergency' ? 'e911_emergency' : liveBanner.type === 'stand_down' ? 'shield' : 'verified'}
                </span>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs uppercase tracking-wider">{liveBanner.title}</h4>
                  <p className="text-[11px] text-white/90 mt-0.5 leading-snug">{liveBanner.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {liveBanner.type === 'emergency' && role === 'customer' && demoMode && (
                  <button
                    onClick={() => {
                      setRole('provider');
                      navigate('/provider');
                    }}
                    className="px-2.5 py-1 rounded-full bg-white text-error text-[10px] font-bold shadow hover:bg-neutral-100"
                  >
                    View as Provider
                  </button>
                )}
                <button
                  onClick={() => setLiveBanner(null)}
                  className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area constrained to mobile max-w-md */}
      <main className="flex-1 w-full max-w-md mx-auto pt-16 relative">
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<CustomerHome />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/sos" element={<SOSPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Provider Routes */}
          <Route path="/provider" element={<ProviderDashboard />} />
          <Route path="/provider/jobs" element={<ProviderJobsPage />} />
          <Route path="/provider/earnings" element={<ProviderEarningsPage />} />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={role === 'provider' ? "/provider" : "/"} replace />}
          />
        </Routes>
      </main>

      {/* Persistent Bottom Navigation matching Stitch */}
      <BottomNav />

      {/* Interactive Global Modals */}
      <BookingModal />
      <ProviderDetailModal />
      <SOSModal />
      <RatingModal />
    </div>
  );
};
