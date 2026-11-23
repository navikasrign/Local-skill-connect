import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ProviderRegister = ({ onSwitchAuth, onBackToWelcome }) => {
  const { login } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    confirm_password: '',
    specializations: '',
    experience_years: 5,
    work_start: '09:00',
    work_end: '19:00',
    emergency_available: true,
    base_fee: 199,
    hourly_rate: 250,
    udyam_id: ''
  });

  const [selectedTrades, setSelectedTrades] = useState(['Electrician']);
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ALL_TRADES = ['Electrician', 'Plumber', 'Carpenter', 'Appliance & AC'];
  const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleTrade = (trade) => {
    if (selectedTrades.includes(trade)) {
      if (selectedTrades.length === 1) {
        setError('At least one trade must be selected.');
        return;
      }
      setSelectedTrades(selectedTrades.filter(t => t !== trade));
    } else {
      setSelectedTrades([...selectedTrades, trade]);
    }
  };

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) {
        setError('At least one working day must be selected.');
        return;
      }
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (selectedTrades.length === 0) {
      setError('Please select at least one trade.');
      return;
    }
    if (selectedDays.length === 0) {
      setError('Please select at least one working day.');
      return;
    }
    if (Number(formData.base_fee) < 50) {
      setError('Base inspection fee must be at least ₹50.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        mobile: cleanMobile,
        password: formData.password,
        confirm_password: formData.confirm_password,
        trades: selectedTrades,
        specializations: formData.specializations.trim(),
        experience_years: Number(formData.experience_years) || 1,
        work_days: selectedDays,
        work_start: formData.work_start,
        work_end: formData.work_end,
        emergency_available: Boolean(formData.emergency_available),
        base_fee: Number(formData.base_fee) || 199,
        hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : null,
        udyam_id: formData.udyam_id.trim() || null
      };

      const res = await fetch('/api/auth/register/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Technician registration failed. Please check inputs.');
      }

      // Successful registration -> logs in immediately
      login(data.token, data.user, data.profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between max-w-md mx-auto px-4 py-6 font-body-md text-on-surface">
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBackToWelcome}
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <span className="text-xs font-bold text-slate-navy px-3 py-1 rounded-full bg-slate-100 border border-slate-300">
            Provider Enrollment
          </span>
        </div>

        {/* Header */}
        <div className="mb-4">
          <h2 className="font-outfit font-extrabold text-2xl text-on-surface tracking-tight">
            Register as Service Specialist
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
            Join Chennai's trade collective. Direct customer requests, zero middlemen commission, and instant SOS dispatching.
          </p>

          {/* Prototype Notice */}
          <div className="mt-3 p-2.5 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-start gap-2 text-[11px] text-amber-900">
            <span className="material-symbols-outlined text-[15px] text-amber-600 flex-shrink-0 mt-0.5">info</span>
            <p className="leading-snug">
              <strong>Evaluation Notice:</strong> Mobile numbers are simulated without SMS OTP; Udyam registration is not verified in prototype.
            </p>
          </div>
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
          {/* Section: Identity */}
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 space-y-3">
            <span className="font-bold text-xs text-on-surface uppercase tracking-wide block">
              1. Personal & Contact Details
            </span>
            <div>
              <label className="block text-[11px] font-bold text-on-surface mb-1">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. K. Murugan"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-slate-navy transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface mb-1">
                Mobile Number (10 digits) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">
                  +91
                </span>
                <input
                  type="tel"
                  name="mobile"
                  required
                  maxLength={10}
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="9840123456"
                  className="w-full pl-11 pr-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-slate-navy transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-on-surface mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 chars"
                    className="w-full pl-3 pr-8 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-slate-navy transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirm_password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-slate-navy transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section: Trades & Technical Knowledge */}
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 space-y-3">
            <span className="font-bold text-xs text-on-surface uppercase tracking-wide block">
              2. Technical Knowledge & Trade
            </span>
            <div>
              <label className="block text-[11px] font-bold text-on-surface mb-1.5">
                Select One or More Trades <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_TRADES.map((trade) => {
                  const isSelected = selectedTrades.includes(trade);
                  return (
                    <button
                      type="button"
                      key={trade}
                      onClick={() => toggleTrade(trade)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-slate-navy text-white border-slate-navy shadow-sm'
                          : 'bg-surface text-on-surface-variant border-outline-variant/40 hover:bg-surface-container'
                      }`}
                    >
                      <span>{trade}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface mb-1">
                Specializations (Optional)
              </label>
              <input
                type="text"
                name="specializations"
                value={formData.specializations}
                onChange={handleChange}
                placeholder="e.g. Smart lighting, MCB rewiring, drainage"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-slate-navy transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                name="experience_years"
                min={1}
                max={50}
                value={formData.experience_years}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-slate-navy transition-all"
              />
            </div>
          </div>

          {/* Section: Work Time & Availability */}
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 space-y-3">
            <span className="font-bold text-xs text-on-surface uppercase tracking-wide block">
              3. Available Work Time & Hours
            </span>
            <div>
              <label className="block text-[11px] font-bold text-on-surface mb-1.5">
                Working Days
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_DAYS.map((day) => {
                  const isDay = selectedDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                        isDay
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-surface text-on-surface-variant border-outline-variant/40'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-on-surface mb-1">
                  Daily Start Time
                </label>
                <input
                  type="time"
                  name="work_start"
                  value={formData.work_start}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface mb-1">
                  Daily End Time
                </label>
                <input
                  type="time"
                  name="work_end"
                  value={formData.work_end}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-on-surface block">Available for Emergency SOS</span>
                <span className="text-[10px] text-on-surface-variant">Receive high-priority emergency dispatches 24/7</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="emergency_available"
                  checked={formData.emergency_available}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-error"></div>
              </label>
            </div>
          </div>

          {/* Section: Expected Wages & Udyam ID */}
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 space-y-3">
            <span className="font-bold text-xs text-on-surface uppercase tracking-wide block">
              4. Expected Wages & Verification
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-on-surface mb-1">
                  Base Visit Fee (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="base_fee"
                  min={50}
                  step={10}
                  required
                  value={formData.base_fee}
                  onChange={handleChange}
                  placeholder="199"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-slate-navy"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface mb-1">
                  Hourly Rate (₹, Optional)
                </label>
                <input
                  type="number"
                  name="hourly_rate"
                  min={0}
                  step={50}
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  placeholder="250"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-slate-navy"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-on-surface">
                  Udyam Registration Number
                </label>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Not verified in prototype
                </span>
              </div>
              <input
                type="text"
                name="udyam_id"
                value={formData.udyam_id}
                onChange={handleChange}
                placeholder="e.g. UDYAM-TN-02-0048192 (Optional)"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-slate-navy"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-slate-navy text-white text-xs font-bold shadow-md hover:bg-slate-800 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-3"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Enrolling Specialist...</span>
              </>
            ) : (
              <>
                <span>Complete Provider Registration</span>
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Switch */}
      <div className="text-center pt-4 border-t border-outline-variant/20 mt-4">
        <p className="text-xs text-on-surface-variant">
          Already registered as a provider?{' '}
          <button
            onClick={() => onSwitchAuth('provider-login')}
            className="text-slate-navy font-bold hover:underline"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};
