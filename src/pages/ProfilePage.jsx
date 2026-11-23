import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const ProfilePage = () => {
  const {
    authUser,
    authProfile,
    role,
    setRole,
    logout,
    demoMode,
    triggerPwaInstall,
    isAppInstalled,
    userLocation
  } = useApp();
  const navigate = useNavigate();

  const displayName = authUser ? authUser.name : (role === 'customer' ? 'S. Anand' : 'K. Murugan');
  const displayPhone = authUser ? `+91 ${authUser.mobile}` : '+91 98840 99882';
  const displayEmail = authUser?.email || 'anand@chennai.in';

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24 font-body-md text-on-surface">
      {/* User Header */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 flex items-center gap-3.5 mb-4">
        <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/20 bg-surface-container flex-shrink-0">
          <img
            src={role === 'customer'
              ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              : "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80"
            }
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-base font-bold text-on-surface truncate">
              {displayName}
            </h2>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
              role === 'customer' ? 'bg-primary-fixed/50 text-primary' : 'bg-slate-navy/10 text-slate-navy'
            }`}>
              {role}
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant truncate">
            {displayPhone} {authUser?.email && `• ${authUser.email}`}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-0.5">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>
              {role === 'customer' ? 'Consumer Protection Covered' : (authProfile?.udyam_id || 'UDYAM Registered Artisan')}
            </span>
          </div>
        </div>
      </div>

      {/* Provider Details Card (if viewing as provider) */}
      {role === 'provider' && authProfile && (
        <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 mb-4 text-xs">
          <h3 className="font-bold text-xs text-on-surface mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-slate-navy">build</span>
            Trade Enrollment Credentials
          </h3>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-surface-container-low">
              <span className="text-on-surface-variant block">Primary Trades:</span>
              <span className="font-bold text-on-surface">{authProfile.trades?.join(', ')}</span>
            </div>
            <div className="p-2 rounded-xl bg-surface-container-low">
              <span className="text-on-surface-variant block">Base Visit Fee:</span>
              <span className="font-bold text-on-surface">₹{authProfile.base_fee}</span>
            </div>
            <div className="p-2 rounded-xl bg-surface-container-low">
              <span className="text-on-surface-variant block">Experience:</span>
              <span className="font-bold text-on-surface">{authProfile.experience_years} Years</span>
            </div>
            <div className="p-2 rounded-xl bg-surface-container-low">
              <span className="text-on-surface-variant block">Udyam Ref:</span>
              <span className="font-bold text-on-surface truncate block">{authProfile.udyam_id || 'Simulated'}</span>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Action Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-primary-container to-primary text-white shadow-md mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide">
            <span className="material-symbols-outlined text-[16px]">install_mobile</span>
            <span>Install Progressive Web App</span>
          </div>
          <p className="text-[11px] text-white/90 mt-0.5 leading-snug">
            {isAppInstalled
              ? "App is already installed on this device!"
              : "Add SkillConnect to your Home Screen for instant offline access and faster dispatch."}
          </p>
        </div>
        {!isAppInstalled && (
          <button
            onClick={triggerPwaInstall}
            className="px-3.5 py-2 rounded-full bg-white text-primary text-xs font-bold shadow hover:bg-neutral-100 flex-shrink-0 transition-transform active:scale-95"
          >
            Install
          </button>
        )}
      </div>

      {/* Application Mode / Role Switcher Section (Demo Mode only) */}
      {!authUser && demoMode ? (
        <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-on-surface">Evaluation Demo Mode</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Demo Active
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
            Quickly toggle between Customer and Provider perspectives without logging in.
          </p>
          <button
            onClick={() => {
              const newRole = role === 'customer' ? 'provider' : 'customer';
              setRole(newRole);
              navigate(newRole === 'provider' ? '/provider' : '/');
            }}
            className="w-full py-2.5 rounded-2xl bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
            <span>Switch to {role === 'customer' ? 'Tradesperson (Provider)' : 'Customer'} Mode</span>
          </button>
        </div>
      ) : authUser ? (
        <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-on-surface block">Logged-in Session</span>
              <span className="text-[11px] text-on-surface-variant">Role: {role.toUpperCase()} (Session storage isolated)</span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              SECURE
            </span>
          </div>
        </div>
      ) : null}

      {/* Saved Chennai Addresses */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 mb-4">
        <h3 className="font-bold text-xs text-on-surface mb-3 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-primary">pin_drop</span>
          Saved Chennai Addresses
        </h3>
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-2xl bg-surface-container-low border border-primary/20 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-on-surface">
                <span>Home (Default)</span>
                <span className="text-[9px] bg-primary text-white px-1.5 py-0.2 rounded-full">ACTIVE</span>
              </div>
              <p className="text-on-surface-variant text-[11px] mt-0.5">
                Door 14/2, Sivaganga Road, T. Nagar, Chennai - 600017
              </p>
            </div>
            <span className="material-symbols-outlined text-primary text-[18px]">radio_button_checked</span>
          </div>

          <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-start justify-between">
            <div>
              <span className="font-bold text-on-surface">Office</span>
              <p className="text-on-surface-variant text-[11px] mt-0.5">
                4th Floor, ASV Suntech Park, OMR, Chennai - 600096
              </p>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px]">radio_button_unchecked</span>
          </div>
        </div>
      </div>

      {/* Government Udyam Consumer Protection Transparency */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 mb-4">
        <h3 className="font-bold text-xs text-on-surface mb-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">verified_user</span>
          The Govt. Udyam Assurance Protocol
        </h3>
        <div className="space-y-2 text-[11px] text-on-surface-variant leading-relaxed">
          <p>
            • <strong>Legal Identification:</strong> Every artisan on this network is registered under India's Ministry of MSME with a valid Udyam Registration Certificate.
          </p>
          <p>
            • <strong>Background Verification:</strong> Technicians undergo biometric background checks and police clearance certification in Tamil Nadu.
          </p>
          <p>
            • <strong>₹0 Diagnostic Guarantee:</strong> If the expert cannot diagnose or address your household issue, the base inspection fee is automatically waived.
          </p>
        </div>
      </div>

      {/* Logout Action */}
      <div className="mt-2">
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full py-3.5 rounded-2xl bg-red-50 border border-red-200 text-error font-bold text-xs hover:bg-red-100 transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Log Out ({authUser ? authUser.name : 'Demo Mode'})</span>
        </button>
      </div>
    </div>
  );
};
