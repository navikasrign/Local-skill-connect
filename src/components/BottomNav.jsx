import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const BottomNav = () => {
  const { role, bookings } = useApp();

  const activeBookingsCount = bookings.filter(b => b.status === 'on_the_way' || b.status === 'in_progress').length;

  if (role === 'provider') {
    return (
      <nav className="fixed bottom-0 w-full z-40 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(15,23,42,0.06)] border-t border-outline-variant/20">
        <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
          <NavLink
            to="/provider"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[64px] h-12 transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined text-[24px]">dashboard</span>
            <span className="font-label-md text-[11px] mt-0.5">Duty Hub</span>
          </NavLink>

          <NavLink
            to="/provider/jobs"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[64px] h-12 transition-colors relative ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined text-[24px]">assignment</span>
            {activeBookingsCount > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-primary animate-ping" />
            )}
            <span className="font-label-md text-[11px] mt-0.5">Live Jobs</span>
          </NavLink>

          <NavLink
            to="/provider/earnings"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[64px] h-12 transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined text-[24px]">payments</span>
            <span className="font-label-md text-[11px] mt-0.5">Earnings</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[64px] h-12 transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined text-[24px]">verified</span>
            <span className="font-label-md text-[11px] mt-0.5">Udyam ID</span>
          </NavLink>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(15,23,42,0.06)] border-t border-outline-variant/20">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[64px] h-12 transition-colors ${
              isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`
          }
        >
          <span className="material-symbols-outlined text-[24px]">explore</span>
          <span className="font-label-md text-[11px] mt-0.5">Explore</span>
        </NavLink>

        <NavLink
          to="/bookings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[64px] h-12 transition-colors relative ${
              isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`
          }
        >
          <span className="material-symbols-outlined text-[24px]">calendar_month</span>
          {activeBookingsCount > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          )}
          <span className="font-label-md text-[11px] mt-0.5">Bookings</span>
        </NavLink>

        <NavLink
          to="/sos"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[64px] h-12 transition-colors ${
              isActive ? 'text-error font-bold' : 'text-error hover:text-error'
            }`
          }
        >
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">e911_emergency</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-error animate-ping" />
          </div>
          <span className="font-label-md text-[11px] mt-0.5 font-bold">SOS</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[64px] h-12 transition-colors ${
              isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`
          }
        >
          <span className="material-symbols-outlined text-[24px]">person</span>
          <span className="font-label-md text-[11px] mt-0.5">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};
