import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const ProfilePage = () => {
  const { role, setRole, triggerPwaInstall, isAppInstalled, userLocation } = useApp();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24">
      {/* User Header */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 flex items-center gap-3.5 mb-4">
        <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/20 bg-surface-container flex-shrink-0">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-headline-md text-base font-bold text-on-surface truncate">
            S. Anand
          </h2>
          <p className="font-body-sm text-xs text-on-surface-variant truncate">
            +91 98840 99882 • Chennai Member
          </p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-0.5">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>Consumer Protection Covered</span>
          </div>
        </div>
      </div>

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

      {/* Role Switcher Section */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-xs text-on-surface">Application Mode</span>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary-fixed text-primary">
            Currently: {role.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
          Switch to Provider mode to experience how verified Chennai electricians, plumbers, and carpenters receive live dispatch requests and manage service orders.
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
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-outline-variant/30">
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
    </div>
  );
};
