import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Header = () => {
  const {
    role,
    setRole,
    userLocation,
    setUserLocation,
    notifications,
    markAllNotificationsRead,
    wsConnected
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const chennaiNeighborhoods = [
    'T. Nagar, Chennai',
    'Kodambakkam, Chennai',
    'Mylapore, Chennai',
    'Alwarpet, Chennai',
    'Adyar, Chennai',
    'Anna Nagar, Chennai',
    'West Mambalam, Chennai',
    'Velachery, Chennai'
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="fixed top-0 w-full z-40 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between gap-2">
        {/* Logo and Location */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Logo Mark */}
          <div 
            onClick={() => navigate(role === 'customer' ? '/' : '/provider')}
            className="flex items-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                build_circle
              </span>
            </div>
            <div className="hidden xs:flex flex-col">
              <span className="font-outfit font-bold text-sm tracking-tight text-on-surface leading-tight">
                Skill<span className="text-primary-container">Connect</span>
              </span>
              <span className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wider leading-none">
                Udyam Verified
              </span>
            </div>
          </div>

          {/* Location Dropdown */}
          <div className="relative min-w-0 ml-1">
            <span className="font-label-md text-[11px] text-on-surface-variant block truncate leading-none flex items-center gap-1">
              <span>{role === 'customer' ? 'Service Area' : 'Operating Hub'}</span>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} title={wsConnected ? 'FastAPI WebSocket Online' : 'Connecting WS...'} />
            </span>
            <button
              onClick={() => setShowLocationMenu(!showLocationMenu)}
              className="flex items-center gap-0.5 text-left text-on-surface font-label-lg text-xs group -ml-0.5 py-0.5"
              type="button"
            >
              <span className="material-symbols-outlined text-primary text-[16px] flex-shrink-0">
                location_on
              </span>
              <span className="truncate font-bold max-w-[110px]">
                {userLocation.split(',')[0]}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px] group-hover:translate-y-0.5 transition-transform flex-shrink-0">
                keyboard_arrow_down
              </span>
            </button>

            {/* Location selector popup */}
            {showLocationMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowLocationMenu(false)}
                />
                <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-outline-variant/30 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Select Chennai Locality
                  </div>
                  {chennaiNeighborhoods.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setUserLocation(loc);
                        setShowLocationMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-container transition-colors ${
                        userLocation === loc ? 'text-primary font-bold bg-primary-fixed/20' : 'text-on-surface'
                      }`}
                    >
                      <span>{loc}</span>
                      {userLocation === loc && (
                        <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Section: Role Switcher Pill + Notifications */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Role Switcher Pill */}
          <div className="flex items-center bg-surface-container rounded-full p-0.5 border border-outline-variant/40 shadow-inner">
            <button
              onClick={() => {
                setRole('customer');
                navigate('/');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                role === 'customer'
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">person</span>
              <span>Customer</span>
            </button>
            <button
              onClick={() => {
                setRole('provider');
                navigate('/provider');
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                role === 'provider'
                  ? 'bg-slate-navy text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">handyman</span>
              <span>Provider</span>
            </button>
          </div>

          {/* Notifications Icon */}
          <div className="relative">
            <button
              aria-label="Notifications"
              onClick={() => {
                setShowNotificationMenu(!showNotificationMenu);
                if (unreadCount > 0) markAllNotificationsRead();
              }}
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface animate-pulse" />
              )}
            </button>

            {/* Notification Drawer */}
            {showNotificationMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotificationMenu(false)} />
                <div className="absolute top-full right-0 mt-1 w-72 bg-white rounded-2xl shadow-2xl border border-outline-variant/30 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 mb-2">
                    <span className="font-outfit font-bold text-xs text-on-surface">Live Activity</span>
                    <span className="text-[10px] text-primary font-semibold">Realtime</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2 rounded-xl bg-surface-container-low text-xs">
                        <div className="font-bold text-on-surface flex items-center justify-between">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-on-surface-variant font-normal">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile / Avatar */}
          <button
            onClick={() => navigate(role === 'customer' ? '/profile' : '/provider')}
            className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/20 flex-shrink-0 hover:opacity-90 transition-opacity"
          >
            <img
              src={role === 'customer' 
                ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                : "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80"
              }
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
