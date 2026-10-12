import React from 'react';
import { useExam } from '../../context/ExamContext';
import {
  GraduationCap,
  Shield,
  UserCheck,
  User,
  LogOut,
  RotateCcw,
  Building2,
  Lock,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentRole,
    logout,
    resetToSampleData,
  } = useExam();

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-900/40">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">SESMS</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  {currentRole === 'admin'
                    ? 'COE Central Administration'
                    : currentRole === 'incharge'
                    ? 'Hall Superintendent Portal'
                    : 'Candidate Examination Portal'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Smart Examination Section Management System
              </p>
            </div>
          </div>

          {/* User Profile Info & Sign Out (No unauthorized role switcher) */}
          <div className="flex items-center gap-3">
            {/* Student Context */}
            {currentRole === 'student' && currentUser && (
              <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-indigo-300">
                      {currentUser.rollNo}
                    </span>
                    <span className="text-xs text-slate-200 font-semibold truncate max-w-[130px]">
                      {currentUser.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                    {currentUser.department}
                  </span>
                </div>
              </div>
            )}

            {/* In-Charge Context */}
            {currentRole === 'incharge' && currentUser && (
              <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-semibold">
                      {currentUser.facultyId}
                    </span>
                    <span className="text-xs text-slate-200 font-semibold">
                      {currentUser.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {currentUser.department}
                  </span>
                </div>
              </div>
            )}

            {/* Admin Context */}
            {currentRole === 'admin' && (
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>COE Administrative Master</span>
              </div>
            )}

            {/* Admin-only Reset Demo Data Button */}
            {currentRole === 'admin' && (
              <button
                onClick={() => {
                  if (
                    confirm(
                      'Reset system to default sample benchmark data? Any unsaved edits will be restored.'
                    )
                  ) {
                    resetToSampleData();
                  }
                }}
                title="Reset Sample Data"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Data</span>
              </button>
            )}

            {/* Sign Out Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
              title="Sign Out of Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
