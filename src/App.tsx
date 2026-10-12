import React, { useState } from 'react';
import { ExamProvider, useExam } from './context/ExamContext';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { HomeLoginPage } from './components/auth/HomeLoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ExamManagement } from './components/admin/ExamManagement';
import { RoomManagement } from './components/admin/RoomManagement';
import { StudentManagement } from './components/admin/StudentManagement';
import { AllocationEngine } from './components/admin/AllocationEngine';
import { InChargeAssignment } from './components/admin/InChargeAssignment';
import { AbsenteeReports } from './components/admin/AbsenteeReports';
import { AuditTrail } from './components/admin/AuditTrail';
import { InChargeDashboard } from './components/incharge/InChargeDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import {
  LayoutDashboard,
  Calendar,
  Building,
  Users,
  Armchair,
  UserCheck,
  FileSpreadsheet,
  History,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    isAuthenticated,
    currentRole,
    auditLogs,
    students,
    examinations,
    rooms,
    seatAllocations,
  } = useExam();

  const [adminActiveTab, setAdminActiveTab] = useState<string>('overview');

  // If user is not authenticated, show Home / Role & Registered Email login gateway
  if (!isAuthenticated) {
    return (
      <>
        <HomeLoginPage />
        <ToastContainer />
      </>
    );
  }

  const adminNavTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'exams',
      label: 'Examinations',
      icon: Calendar,
      badge: examinations.length,
    },
    {
      id: 'rooms',
      label: 'Halls & Capacity',
      icon: Building,
      badge: rooms.length,
    },
    {
      id: 'students',
      label: 'Candidates Directory',
      icon: Users,
      badge: students.length,
    },
    {
      id: 'allocations',
      label: 'Seating Allocation',
      icon: Armchair,
      badge: seatAllocations.length,
    },
    { id: 'duties', label: 'Invigilation Duties', icon: UserCheck },
    { id: 'absentees', label: 'Absentee Statements', icon: FileSpreadsheet },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: History,
      badge: auditLogs.length,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Admin Navigation Secondary Bar - Only visible to authenticated Admin */}
        {currentRole === 'admin' && (
          <div className="mb-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-none">
              {adminNavTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = adminActiveTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setAdminActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* View Switcher based strictly on authenticated role */}
        {currentRole === 'admin' && (
          <>
            {adminActiveTab === 'overview' && (
              <AdminDashboard setActiveTab={setAdminActiveTab} />
            )}
            {adminActiveTab === 'exams' && <ExamManagement />}
            {adminActiveTab === 'rooms' && <RoomManagement />}
            {adminActiveTab === 'students' && <StudentManagement />}
            {adminActiveTab === 'allocations' && <AllocationEngine />}
            {adminActiveTab === 'duties' && <InChargeAssignment />}
            {adminActiveTab === 'absentees' && <AbsenteeReports />}
            {adminActiveTab === 'audit' && <AuditTrail />}
          </>
        )}

        {/* In-Charge Faculty view: restricted to assigned venues only */}
        {currentRole === 'incharge' && <InChargeDashboard />}

        {/* Student view: strictly personal candidate portal; no admin or faculty info */}
        {currentRole === 'student' && <StudentDashboard />}
      </main>

      {/* Global Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ExamProvider>
      <MainAppContent />
    </ExamProvider>
  );
}
