import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { Role, Department, AVAILABLE_DEPARTMENTS } from '../../types';
import {
  GraduationCap,
  Shield,
  UserCheck,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserPlus,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
  Building,
} from 'lucide-react';

export const HomeLoginPage: React.FC = () => {
  const { login, registerAccount, userCredentials, inCharges } = useExam();

  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Register form state
  const [regRole, setRegRole] = useState<Role>('student');
  const [regEmail, setRegEmail] = useState('');
  const [regIdentifier, setRegIdentifier] = useState(''); // Roll No, Faculty ID, or COE Passcode
  const [regName, setRegName] = useState('');
  const [regDept, setRegDept] = useState<Department>('Mechanical');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regErrorMsg, setRegErrorMsg] = useState<string | null>(null);

  // Reference directory toggle
  const [showRefAccounts, setShowRefAccounts] = useState(false);

  // Live lookup of faculty in inCharges database
  const cleanRegId = regIdentifier.trim().toUpperCase();
  const matchedFaculty =
    regRole === 'incharge' && cleanRegId
      ? inCharges.find((f) => f.facultyId.toUpperCase() === cleanRegId)
      : undefined;

  const isFacultyAlreadyActivated =
    matchedFaculty &&
    userCredentials.some(
      (c) =>
        c.role === 'incharge' &&
        (c.identifier.toUpperCase() === matchedFaculty.facultyId.toUpperCase() ||
          c.email.toLowerCase() === matchedFaculty.email.toLowerCase()) &&
        c.isRegistered
    );

  // Switch role in login
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await login(selectedRole, emailInput, passwordInput);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Login failed due to unexpected error.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg(null);

    if (regPassword !== regConfirmPassword) {
      setRegErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (regPassword.length < 4) {
      setRegErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerAccount(
        regRole,
        regEmail,
        regIdentifier,
        regPassword,
        regName,
        regRole === 'admin' ? undefined : regDept
      );
      setLoading(false);
      if (!res.success) {
        setRegErrorMsg(res.message);
      }
    } catch (err: any) {
      setLoading(false);
      setRegErrorMsg(err.message || 'Registration failed due to unexpected error.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col justify-between">
      {/* Top Brand Banner */}
      <header className="border-b border-slate-700/60 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-900/40">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">SESMS</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  Autonomous Examination Section
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Smart Examination Section Management System
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role-Based Authentication & Isolation</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Security Governance Notice */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Anti-Impersonation Security Gateway
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Secure Account & Examination Access
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Institutional credentials are required. Candidates and faculty must log in with their
                verified registered email address so that nobody can arbitrarily access another user's
                portal.
              </p>
            </div>

            {/* Security Guard Highlights */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4.5 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Account Protection Policies</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Registered Email Enforcement:</strong> Only pre-registered or activated
                    institutional emails can sign in. Unregistered emails are blocked from logging in.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Students Strictly Isolated:</strong> Candidates have zero access to admin
                    configurations, exam setups, hall capacities, or faculty job info.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>No Quick Sign-In Bypass:</strong> All users must provide their role,
                    registered email, and account password. No unauthorized 1-click login is permitted.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Interactive Login & Registration Card */}
          <div className="lg:col-span-7 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
            {/* Top Switcher: Sign In vs Register / Activate */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In with Registered Email</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setRegErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  authMode === 'register'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register / Activate Account</span>
              </button>
            </div>

            {/* TAB 1: SIGN IN MODE */}
            {authMode === 'login' ? (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Sign in to your Portal</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select your role and enter your registered institutional email and password.
                  </p>
                </div>

                {/* Role Selection */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Step 1: Select Your Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('student')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                        selectedRole === 'student'
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-slate-50/40 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <User className="w-4 h-4 mb-1 text-indigo-600" />
                      <span className="font-bold text-xs">Student</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleSelect('incharge')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                        selectedRole === 'incharge'
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-slate-50/40 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 mb-1 text-indigo-600" />
                      <span className="font-bold text-xs">Faculty In-Charge</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleSelect('admin')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                        selectedRole === 'admin'
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-slate-50/40 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Shield className="w-4 h-4 mb-1 text-indigo-600" />
                      <span className="font-bold text-xs">Exam Admin</span>
                    </button>
                  </div>
                </div>

                {/* Role-Specific Security Barrier Notice */}
                <div className="mb-4 p-2.5 rounded-xl text-[11px] leading-relaxed border bg-slate-50 border-slate-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    {selectedRole === 'student' && (
                      <p className="text-slate-700">
                        <strong className="text-indigo-900">Student Access Policy:</strong> You will
                        only see your personal exam schedule, room, and seat number. Students{' '}
                        <strong>cannot access</strong> admin settings or faculty invigilation jobs.
                      </p>
                    )}
                    {selectedRole === 'incharge' && (
                      <p className="text-slate-700">
                        <strong className="text-indigo-900">Faculty In-Charge Policy:</strong> Access
                        is restricted to your assigned examination venues, student attendance marking,
                        and room absentee statements.
                      </p>
                    )}
                    {selectedRole === 'admin' && (
                      <p className="text-slate-700">
                        <strong className="text-indigo-900">Examination Admin Policy:</strong> Full
                        administrative console for exam scheduling, venue capacity, randomized seat
                        allocation, faculty deployment, and audit trail.
                      </p>
                    )}
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Step 2: Registered Institutional Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          setErrorMsg(null);
                        }}
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 bg-slate-50/60 focus:bg-white"
                        placeholder={
                          selectedRole === 'student'
                            ? 'e.g. rahul.me101@univ.edu or aarav.cs101@univ.edu'
                            : selectedRole === 'incharge'
                            ? 'e.g. anand.ramanathan@univ.edu'
                            : 'e.g. admin@univ.edu'
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Step 3: Account Password / Security PIN <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400">Strict Verification</span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordInput}
                        onChange={(e) => {
                          setPasswordInput(e.target.value);
                          setErrorMsg(null);
                        }}
                        className="w-full text-xs pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 bg-slate-50/60 focus:bg-white font-mono"
                        placeholder="Enter your account password..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Alert */}
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                      <p className="leading-relaxed">{errorMsg}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{loading ? 'Authenticating...' : 'Verify Password & Access Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Account Activation Switch Link */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <span>Need to register your email or set a password?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setRegErrorMsg(null);
                    }}
                    className="font-bold text-indigo-600 hover:text-indigo-800 transition text-left sm:text-right cursor-pointer"
                  >
                    Register / Activate Account →
                  </button>
                </div>
              </div>
            ) : (
              /* TAB 2: REGISTER & SECURE ACCOUNT MODE */
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Register & Activate Your Account</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Bind your institutional email and roll number or ID with a secure password so that
                    only you can access your examination records.
                  </p>
                </div>

                {/* Role Switch for registration */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Account Role to Register
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRegRole('student');
                        setRegErrorMsg(null);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center ${
                        regRole === 'student'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      Candidate / Student
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRegRole('incharge');
                        setRegErrorMsg(null);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center ${
                        regRole === 'incharge'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      Faculty In-Charge
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRegRole('admin');
                        setRegErrorMsg(null);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center ${
                        regRole === 'admin'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      COE Admin
                    </button>
                  </div>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {regRole === 'student'
                          ? 'Roll Number'
                          : regRole === 'incharge'
                          ? 'Faculty ID'
                          : 'COE Master Passcode'}{' '}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={regIdentifier}
                        onChange={(e) => {
                          setRegIdentifier(e.target.value.toUpperCase());
                          setRegErrorMsg(null);
                        }}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold uppercase bg-slate-50/60 focus:bg-white"
                        placeholder={
                          regRole === 'student'
                            ? 'e.g. 24ME105, 24CS115'
                            : regRole === 'incharge'
                            ? 'e.g. FAC-1003'
                            : 'Enter SESMS-COE-2026'
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Institutional Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          setRegErrorMsg(null);
                        }}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/60 focus:bg-white"
                        placeholder={
                          regRole === 'incharge'
                            ? 'e.g. faculty@test.example'
                            : 'e.g. yourname@univ.edu'
                        }
                      />
                    </div>
                  </div>

                  {/* Live Faculty Validation & Dev Test Helper */}
                  {regRole === 'incharge' && (
                    <div className="space-y-2 pt-1">
                      {/* Development Test Faculty Record Shortcut */}
                      <div className="p-2.5 rounded-xl bg-indigo-50/90 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-indigo-900">
                          <span className="text-base">🧪</span>
                          <div>
                            <span className="font-bold text-indigo-950">Development-Only Test Faculty:</span>{' '}
                            <code className="font-mono font-bold bg-white text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                              FAC-1003
                            </code>{' '}
                            •{' '}
                            <code className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                              faculty@test.example
                            </code>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setRegIdentifier('FAC-1003');
                            setRegEmail('faculty@test.example');
                            setRegName('Dr. R. K. Suresh (Dev Test Faculty)');
                            setRegDept('Information technology');
                            setRegErrorMsg(null);
                          }}
                          className="text-[11px] font-bold px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shrink-0 cursor-pointer shadow-2xs"
                        >
                          Load Test Record (FAC-1003)
                        </button>
                      </div>

                      {matchedFaculty ? (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Authorized Institutional Faculty Record Verified</span>
                            {matchedFaculty.facultyId === 'FAC-1003' && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-semibold ml-1">
                                Dev Test Record
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-emerald-700">
                            <strong>{matchedFaculty.name}</strong> • Department: {matchedFaculty.department} (ID: {matchedFaculty.facultyId})
                          </div>
                          {regEmail.trim() && regEmail.trim().toLowerCase() !== matchedFaculty.email.toLowerCase() && (
                            <div className="pt-1 flex items-center justify-between text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                              <span>
                                ⚠️ Expected institutional email:{' '}
                                <strong className="font-mono">{matchedFaculty.email}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => setRegEmail(matchedFaculty.email)}
                                className="font-bold text-indigo-700 hover:underline cursor-pointer ml-2"
                              >
                                Use Enrolled Email
                              </button>
                            </div>
                          )}
                          {isFacultyAlreadyActivated && (
                            <div className="text-[11px] text-amber-800 bg-amber-100/70 p-1.5 rounded border border-amber-200">
                              ⚠️ This faculty account has already been registered and activated. Please switch to the Sign In tab.
                            </div>
                          )}
                        </div>
                      ) : cleanRegId.length >= 4 ? (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block">Faculty ID &quot;{regIdentifier}&quot; not found in institutional faculty database.</strong>
                            <p className="text-[11px] text-rose-600 mt-0.5">
                              Registration requires an authorized faculty record (e.g. FAC-1001, FAC-1002, or development test record FAC-1003). Arbitrary faculty registration is strictly prohibited.
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Name & Department Fields: Note that Admin won't have department */}
                  {regRole === 'admin' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Administrator Name
                      </label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/60 focus:bg-white"
                        placeholder="e.g. Controller of Examinations"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Central Examination Administration operates autonomous institutional control across all departments (no department assigned).
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/60 focus:bg-white"
                          placeholder={
                            regRole === 'student'
                              ? 'e.g. Rahul Verma'
                              : 'e.g. Dr. R. K. Suresh'
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Department
                        </label>
                        <select
                          value={regDept}
                          onChange={(e) => setRegDept(e.target.value as Department)}
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                        >
                          {AVAILABLE_DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Create Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/60 focus:bg-white font-mono"
                        placeholder="At least 4 characters"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/60 focus:bg-white font-mono"
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>

                  {regErrorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                      <p>{regErrorMsg}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>{loading ? 'Activating Account...' : 'Register Password & Activate Portal'}</span>
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                </form>

                {/* Back to Login Link */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <span>Already registered your email address?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMsg(null);
                    }}
                    className="font-bold text-indigo-600 hover:text-indigo-800 transition text-left sm:text-right cursor-pointer"
                  >
                    Sign In with Registered Email →
                  </button>
                </div>
              </div>
            )}

            {/* Collapsible Registered Accounts Reference Guide */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowRefAccounts(!showRefAccounts)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 transition py-1"
              >
                <div className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  <span>View Registered Sample Accounts Reference</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-normal">
                    {userCredentials.length} Accounts Active
                  </span>
                </div>
                {showRefAccounts ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showRefAccounts && (
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-3 animate-in fade-in">
                  <div className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Strict Security Enforced:</strong> There is <em>no quick sign-in bypass</em>.
                      You must select your role and enter the registered email and password into the
                      form above.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-indigo-900 block text-xs">
                          Student (Mechanical Engg)
                        </span>
                        <span className="font-mono text-[11px] text-slate-700">
                          rahul.me101@univ.edu
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Password</span>
                        <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Student@101
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-indigo-900 block text-xs">
                          Student (Computer Science)
                        </span>
                        <span className="font-mono text-[11px] text-slate-700">
                          aarav.cs101@univ.edu
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Password</span>
                        <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Student@101
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-indigo-900 block text-xs">
                          Faculty In-Charge (Room 101/102)
                        </span>
                        <span className="font-mono text-[11px] text-slate-700">
                          anand.ramanathan@univ.edu
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Password</span>
                        <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Faculty@1001
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-indigo-900 block text-xs">
                          Faculty In-Charge (Room 103)
                        </span>
                        <span className="font-mono text-[11px] text-slate-700">
                          sunita.deshmukh@univ.edu
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Password</span>
                        <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Faculty@1002
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-indigo-900 block text-xs">
                          Examination Admin (COE Office)
                        </span>
                        <span className="font-mono text-[11px] text-slate-700">
                          admin@univ.edu
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Password</span>
                        <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Admin@2026
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Development Test Record Guide */}
                  <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/90 border border-indigo-200 text-xs text-indigo-900 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-indigo-950 flex items-center gap-1.5">
                        <span>🧪</span> Development-Only Test Faculty (Ready to Register & Activate)
                      </span>
                      <span className="text-[10px] bg-indigo-200/70 text-indigo-900 px-1.5 py-0.5 rounded font-medium">
                        Unregistered / Pending Activation
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Faculty ID</span>
                        <span className="font-mono font-bold text-indigo-800">FAC-1003</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Enrolled Email</span>
                        <span className="font-mono font-bold text-indigo-800">faculty@test.example</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-indigo-700 pt-1 flex items-center justify-between">
                      <span>Name: Dr. R. K. Suresh (Information Technology)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setRegRole('incharge');
                          setRegIdentifier('FAC-1003');
                          setRegEmail('faculty@test.example');
                          setRegName('Dr. R. K. Suresh (Dev Test Faculty)');
                          setRegDept('Information technology');
                          setRegErrorMsg(null);
                        }}
                        className="font-bold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer"
                      >
                        Register This Account →
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center">
                    To register a new candidate or faculty email, switch to the{' '}
                    <strong>Register / Activate Account</strong> tab above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/80 py-4 text-center text-xs text-slate-500">
        <p>Smart Examination Section Management System (SESMS) • Academic Year 2026-27</p>
      </footer>
    </div>
  );
};
