import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ProviderLogin = ({ onSwitchAuth, onBackToWelcome }) => {
  const { login } = useApp();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setError('Please enter your 10-digit registered mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanMobile,
          password,
          role: 'provider'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Technician login failed. Please verify credentials.');
      }

      // Login success -> store token & user & provider profile
      login(data.token || data.access_token, data.user, data.profile || data.provider_profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setMobile('9000000002');
    setPassword('demo123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between max-w-md mx-auto px-4 py-6 font-body-md text-on-surface">
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBackToWelcome}
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <span className="text-xs font-bold text-slate-navy px-3 py-1 rounded-full bg-slate-100 border border-slate-300">
            Provider Dashboard Portal
          </span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-navy/10 flex items-center justify-center text-slate-navy mb-3">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              engineering
            </span>
          </div>
          <h2 className="font-outfit font-extrabold text-2xl text-on-surface tracking-tight">
            Tradesperson Log In
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
            Receive instant neighbourhood work dispatches, emergency SOS alerts, and earn transparent diagnostic wages.
          </p>
        </div>

        {/* Quick Demo Credentials Fill Button */}
        <div className="mb-5 p-3 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-slate-navy block">Evaluation Quick-Fill</span>
            <span className="text-[11px] text-on-surface-variant">K. Murugan (9000000002 / demo123)</span>
          </div>
          <button
            type="button"
            onClick={handleDemoFill}
            className="px-3 py-1.5 rounded-xl bg-slate-navy text-white text-xs font-bold shadow hover:bg-slate-800 transition-colors"
          >
            Auto Fill
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[16px] text-red-600 flex-shrink-0 mt-0.5">error</span>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Registered Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="e.g. 9000000002"
                className="w-full pl-12 pr-3.5 py-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-slate-navy focus:ring-2 focus:ring-slate-navy/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[18px]">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-slate-navy focus:ring-2 focus:ring-slate-navy/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-slate-navy text-white text-xs font-bold shadow-md hover:bg-slate-800 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Enter Provider Dashboard</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Prototype Transparency Note */}
        <p className="text-[11px] text-center text-on-surface-variant/70 mt-4">
          OTP verification simulated in prototype mode.
        </p>
      </div>

      {/* Footer Switch */}
      <div className="text-center pt-6 border-t border-outline-variant/20 mt-6">
        <p className="text-xs text-on-surface-variant">
          New artisan or technician?{' '}
          <button
            onClick={() => onSwitchAuth('provider-register')}
            className="text-slate-navy font-bold hover:underline"
          >
            Register as Provider
          </button>
        </p>
      </div>
    </div>
  );
};
