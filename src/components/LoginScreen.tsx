import React, { useState } from 'react';
import { useApp } from './AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  User as UserIcon, 
  AlertCircle, 
  Syringe, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Undo2, 
  Key, 
  UserPlus, 
  Mail, 
  Search, 
  QrCode, 
  Printer, 
  Download, 
  Award, 
  Database, 
  Clock, 
  Heart, 
  Check, 
  X,
  FileCheck
} from 'lucide-react';
const heroBg = '/src/assets/images/vaccine_hero_bg_1780640127921.png';

type LandingTab = 'home' | 'stocks' | 'signin' | 'register';

export const LoginScreen: React.FC = () => {
  const { 
    login, 
    allUsers, 
    resetPassword, 
    addUserAccount, 
    patients, 
    stocks, 
    administrations 
  } = useApp();

  const [landingTab, setLandingTab] = useState<LandingTab>('home');

  // Sign In States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'Nurse' | 'Patient' | 'Admin'>('Patient');
  const [regQuestion, setRegQuestion] = useState('What the clinic facility name?');
  const [regAnswer, setRegAnswer] = useState('');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  // Password Recovery States
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [lookedUpUser, setLookedUpUser] = useState<any | null>(null);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  // Public Search Passport States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedPatient, setSearchedPatient] = useState<any | null>(null);
  const [searchedVaccines, setSearchedVaccines] = useState<any[]>([]);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const result = login(username, password);
      setIsSubmitting(false);
      if (!result.success && result.error) {
        setErrorMessage(result.error);
      }
    }, 600);
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
    setIsRecoveryMode(false);
    setLandingTab('signin');
  };

  const handleInitiateLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);

    const cleanInput = recoveryUsername.trim().toLowerCase();
    if (!cleanInput) {
      setRecoveryError('Please input your username handle or email address.');
      return;
    }

    const matched = allUsers.find(
      u => (u.username && u.username.toLowerCase() === cleanInput) || 
           u.email.toLowerCase() === cleanInput
    );

    if (!matched) {
      setRecoveryError('Credential profile associated with that alias was not found.');
      return;
    }

    setLookedUpUser(matched);
    setRecoveryStep(2);
  };

  const handleCommitReset = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);

    if (!recoveryAnswer.trim() || !recoveryNewPassword.trim()) {
      setRecoveryError('Please fill in both the security answer and your secret password.');
      return;
    }

    const result = resetPassword(recoveryUsername, recoveryAnswer, recoveryNewPassword);
    if (result.success) {
      setRecoverySuccess('Credentials updated successfully. Sign in with your new password!');
      setTimeout(() => {
        setIsRecoveryMode(false);
        setRecoveryStep(1);
        setUsername(recoveryUsername);
        setPassword(recoveryNewPassword);
        setRecoveryUsername('');
        setRecoveryAnswer('');
        setRecoveryNewPassword('');
        setRecoverySuccess(null);
        setLookedUpUser(null);
        setLandingTab('signin');
      }, 2000);
    } else {
      setRecoveryError(result.error || 'Password reset check-challenge failed. Check spelling and retry.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regName.trim() || !regEmail.trim() || !regUsername.trim() || !regPassword.trim() || !regAnswer.trim()) {
      setRegError('All fields including the secure recovery question answer must be filled.');
      return;
    }

    const result = addUserAccount({
      name: regName.trim(),
      email: regEmail.trim(),
      role: regRole,
      username: regUsername.trim().toLowerCase(),
      password: regPassword.trim(),
      securityQuestion: regQuestion,
      securityAnswer: regAnswer.trim().toLowerCase(),
    });

    if (result.success) {
      setRegSuccess(`Account for "${regName.trim()}" created successfully! Redirecting you to sign in...`);
      const newUsername = regUsername.trim().toLowerCase();
      const newPassword = regPassword.trim();

      setRegName('');
      setRegEmail('');
      setRegUsername('');
      setRegPassword('');
      setRegAnswer('');

      setTimeout(() => {
        setRegSuccess(null);
        setUsername(newUsername);
        setPassword(newPassword);
        setLandingTab('signin');
      }, 2000);
    } else {
      setRegError(result.error || 'Failed to register account.');
    }
  };

  const handleTrackVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const cleanQuery = searchQuery.trim().toUpperCase();

    if (!cleanQuery) {
      setSearchError('Please fill in a vaccine pass code or patient ID.');
      return;
    }

    const found = patients.find(
      p => p.id.toUpperCase() === cleanQuery || 
           p.id.toUpperCase() === `PAT-${cleanQuery}` || 
           p.name.toUpperCase().includes(cleanQuery)
    );

    if (found) {
      const vaxList = administrations.filter(a => a.patientId === found.id);
      setSearchedPatient(found);
      setSearchedVaccines(vaxList);
      setIsPassModalOpen(true);
    } else {
      setSearchError(`No active vaccination record matches "${searchQuery}". Try using "PAT-001" or "PAT-002".`);
      setTimeout(() => setSearchError(null), 4000);
    }
  };

  return (
    <div id="login-container" className="flex h-screen w-screen flex-col md:flex-row overflow-hidden bg-slate-950 font-sans antialiased text-slate-800">
      
      {/* 1. Left Sidebar Navigation Column — Styled like MakaoSafe Side panel */}
      <div className="w-full md:w-80 shrink-0 bg-[#3c2575] text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 relative z-20">
        
        {/* Sidebar Brand Header */}
        <div className="p-6 md:p-8">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setLandingTab('home')}>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-teal-300 border border-white/20 shadow-md">
              <Syringe className="h-5.5 w-5.5 animate-pulse" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight group-hover:text-teal-300 transition leading-tight">VaccineTrack</div>
              <div className="text-[9.5px] uppercase tracking-widest text-indigo-200/90 font-semibold font-mono">PORTAL GATEWAY</div>
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="mt-8 md:mt-12 space-y-2.5">
            <button
              onClick={() => { setLandingTab('home'); setIsRecoveryMode(false); }}
              className={`w-full flex items-center space-x-3 px-4.5 py-3 rounded-xl text-left text-xs font-semibold select-none cursor-pointer transition-all ${
                landingTab === 'home' 
                  ? 'bg-white/15 text-white font-bold shadow-sm' 
                  : 'text-indigo-150 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="h-4 w-4 shrink-0 flex items-center justify-center">
                <Heart className="h-4 w-4" />
              </div>
              <span>Home Landing</span>
            </button>

            <button
              onClick={() => { setLandingTab('stocks'); setIsRecoveryMode(false); }}
              className={`w-full flex items-center space-x-3 px-4.5 py-3 rounded-xl text-left text-xs font-semibold select-none cursor-pointer transition-all ${
                landingTab === 'stocks' 
                  ? 'bg-white/15 text-white font-bold shadow-sm' 
                  : 'text-indigo-150 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="h-4 w-4 shrink-0 flex items-center justify-center">
                <Database className="h-4 w-4" />
              </div>
              <span>Browse Active Stocks</span>
            </button>

            <button
              onClick={() => { setLandingTab('signin'); setIsRecoveryMode(false); }}
              className={`w-full flex items-center space-x-3 px-4.5 py-3 rounded-xl text-left text-xs font-semibold select-none cursor-pointer transition-all ${
                landingTab === 'signin' 
                  ? 'bg-white/15 text-white font-bold shadow-sm' 
                  : 'text-indigo-150 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="h-4 w-4 shrink-0 flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
              <span>Coordination Sign In</span>
            </button>

            <button
              onClick={() => { setLandingTab('register'); setIsRecoveryMode(false); }}
              className={`w-full flex items-center space-x-3 px-4.5 py-3 rounded-xl text-left text-xs font-semibold select-none cursor-pointer transition-all ${
                landingTab === 'register' 
                  ? 'bg-white/15 text-white font-bold shadow-sm' 
                  : 'text-indigo-150 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="h-4 w-4 shrink-0 flex items-center justify-center">
                <UserPlus className="h-4 w-4" />
              </div>
              <span>Self Enrollment</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Details */}
        <div className="p-6 border-t border-white/5 bg-black/10 text-[10px] text-indigo-200/60 shrink-0 space-y-1.5 font-mono">
          <div className="flex justify-between items-center">
            <span>Facility Status:</span>
            <span className="flex items-center space-x-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span className="text-emerald-300 font-bold">SECURED</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span>ID Code:</span>
            <span>KE-MHK-02</span>
          </div>
          <div className="flex justify-between">
            <span>Core:</span>
            <span>STABLE v5.24</span>
          </div>
        </div>
      </div>

      {/* 2. Right Adaptive Viewport Content Area */}
      <div id="landing-viewport" className="flex-1 h-full overflow-y-auto relative flex flex-col justify-between">
        
        {/* Dynamic Nav Bar (Inside Hero Zone) */}
        <header className="absolute top-0 left-0 w-full z-30 px-6 py-4 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/50 to-transparent">
          <div className="text-white text-[11px] font-mono opacity-80 select-none hidden sm:block">
            Secure Immunization Tracking Console
          </div>
          
          <div className="flex items-center space-x-4 ml-auto font-sans">
            <button 
              onClick={() => { setLandingTab('home'); setIsRecoveryMode(false); }}
              className={`text-xs font-bold transition-all ${landingTab === 'home' ? 'text-white border-b-2 border-teal-400 pb-0.5' : 'text-indigo-200 hover:text-white'}`}
            >
              Home
            </button>
            <button 
              onClick={() => { setLandingTab('signin'); setIsRecoveryMode(false); }}
              className={`text-xs font-bold transition-all ${landingTab === 'signin' ? 'text-white border-b-2 border-teal-400 pb-0.5' : 'text-indigo-200 hover:text-white'}`}
            >
              Login
            </button>
            <button 
              onClick={() => { setLandingTab('register'); setIsRecoveryMode(false); }}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-extrabold text-[11px] px-3.5 py-1.5 rounded-lg hover:from-teal-400 hover:to-cyan-400 active:scale-95 transition-all shadow-md uppercase tracking-wider cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </header>

        {/* Content switch */}
        <div className="flex-1 flex flex-col justify-center relative p-6 md:p-12 lg:p-16 min-h-[calc(100vh-24px)] pt-20 md:pt-24">
          
          {/* Immersive background graphic */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700" 
            style={{ backgroundImage: `url(${heroBg})` }}
          />
          {/* Backing screen tint overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-indigo-950/50 z-1" />

          {/* Dynamic state widgets */}
          <div className="relative z-10 w-full max-w-4xl">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: LANDING HOME (The exact structure requested by user) */}
              {landingTab === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6 md:space-y-8"
                >
                  {/* Verified MOH Badge */}
                  <div className="inline-flex items-center space-x-2 rounded-full bg-teal-400/10 border border-teal-500/20 text-teal-300 text-[10.5px] font-bold px-3.5 py-1.5 select-none animate-fade-in shadow-lg">
                    <Shield className="h-3.5 w-3.5 text-teal-400" />
                    <span className="uppercase tracking-wider">#1 MOH AUTHORIZED PLATFORM</span>
                  </div>

                  {/* Main Display Heading */}
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-2xl font-sans">
                    Verify Your Immune <br />
                    <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent font-extrabold">
                      Safety Shield
                    </span> Today
                  </h1>

                  {/* Description subtitle */}
                  <p className="text-slate-300 text-xs md:text-sm lg:text-base leading-relaxed max-w-xl font-normal">
                    Enter your digital immunization reference to verify medical credentials, download secure vaccine stamps, or track coordinator logs.
                  </p>

                  {/* Search Bar matching MakaoSafe */}
                  <div className="max-w-2xl">
                    <form onSubmit={handleTrackVerify} className="relative flex items-center p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl focus-within:ring-2 focus-within:ring-teal-400/50 transition-all">
                      <div className="pl-3.5 text-slate-400">
                        <Search className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search dynamic passport by Code... e.g. PAT-001, PAT-002"
                        className="flex-1 bg-transparent px-3.5 py-3 text-xs md:text-sm font-semibold text-white placeholder-slate-450 focus:outline-none focus:ring-0"
                      />
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-900 font-bold text-xs px-5 md:px-7 py-2.5 rounded-xl cursor-pointer hover:from-teal-400 hover:to-cyan-300 transition-all shadow-md uppercase tracking-wider flex items-center space-x-2 shrink-0 select-none active:scale-[0.98]"
                      >
                        <FileCheck className="h-4 w-4" />
                        <span>Track Pass</span>
                      </button>
                    </form>

                    {searchError && (
                      <p className="mt-2.5 text-xs text-rose-350 font-semibold animate-pulse flex items-center space-x-1.5 pl-2">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                        <span>{searchError}</span>
                      </p>
                    )}

                    {/* Filter Quick pills below search bar */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[10.5px]">
                      <span className="text-slate-400 select-none mr-1 font-mono font-bold text-[10px]">VERIFIED CODES:</span>
                      
                      <button
                        type="button"
                        onClick={() => setSearchQuery('PAT-001')}
                        className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-slate-205 transition cursor-pointer select-none"
                      >
                        PAT-001 (Samuel)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('PAT-002')}
                        className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-slate-205 transition cursor-pointer select-none"
                      >
                        PAT-002 (Alice)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('PAT-003')}
                        className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-slate-205 transition cursor-pointer select-none"
                      >
                        PAT-003 (Guardian)
                      </button>
                    </div>
                  </div>

                  {/* Trust Badge Elements bottom-right positioning */}
                  <div className="border-t border-white/10 pt-6 mt-8 flex flex-wrap gap-4 text-[10.5px] items-center">
                    <div className="flex items-center space-x-2 text-indigo-200">
                      <div className="h-6 w-6 rounded-md bg-teal-400/10 text-teal-300 flex items-center justify-center">
                        <Award className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-semibold uppercase tracking-wider">MOH Compliant Passports</span>
                    </div>

                    <div className="flex items-center space-x-2 text-indigo-200">
                      <div className="h-6 w-6 rounded-md bg-teal-400/10 text-teal-300 flex items-center justify-center">
                        <Shield className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-semibold uppercase tracking-wider">SECURE AES-256 ENCRYPTION</span>
                    </div>

                    <div className="flex items-center space-x-2 text-indigo-200">
                      <div className="h-6 w-6 rounded-md bg-teal-400/10 text-teal-300 flex items-center justify-center">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-semibold uppercase tracking-wider">Real-time Stock Monitor</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: ACTIVE STOCKS */}
              {landingTab === 'stocks' && (
                <motion.div
                  key="stocks"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="inline-flex rounded bg-teal-400/10 border border-teal-500/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 mb-2 uppercase tracking-wide">
                      Public Inventory Records
                    </span>
                    <h2 className="text-2xl font-extrabold tracking-tight text-white">Active Clinical Immunization Inventory</h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-lg">
                      Live batch, manufacturer records, and storage indicators synchronizing securely with clinic logistics databases.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
                    {stocks.map(st => (
                      <div key={st.id} className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-4 flex flex-col justify-between hover:border-teal-400/40 transition">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">CODE: {st.id}</span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              st.dosesAvailable <= st.lowStockThreshold 
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {st.dosesAvailable} doses available
                            </span>
                          </div>
                          <h3 className="font-bold text-white text-sm mt-2">{st.name}</h3>
                          <p className="text-[10.5px] text-slate-400 mt-0.5">Mfr: {st.manufacturer}</p>
                        </div>

                        <div className="border-t border-white/5 pt-3 mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Temp: {st.storageTemp}</span>
                          <span>Lot: {st.batchNumber}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setLandingTab('home')}
                    className="inline-flex items-center space-x-1.5 text-xs text-teal-300 hover:text-white font-bold select-none cursor-pointer mt-2"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    <span>Back to Core Landing</span>
                  </button>
                </motion.div>
              )}

              {/* TAB 3: SIGN IN CONSOLE */}
              {landingTab === 'signin' && (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-xl"
                >
                  <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl relative">
                    
                    {/* Toggle Password Recovery */}
                    {!isRecoveryMode ? (
                      <>
                        <div className="mb-6">
                          <span className="inline-flex rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold px-2 py-0.5 mb-2 uppercase tracking-wide">
                            Secure Clinician Desk
                          </span>
                          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Sign In Console</h2>
                          <p className="text-xs text-slate-500 mt-1">
                            Enter authorized secure credentials to access clinician scheduling and immunizations dispatcher.
                          </p>
                        </div>

                        {errorMessage && (
                          <div className="mb-4.5 flex items-start space-x-2.5 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-medium text-rose-800">
                            <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">Clearance Denied</p>
                              <p className="text-[11px] leading-normal">{errorMessage}</p>
                            </div>
                          </div>
                        )}

                        <form onSubmit={handleSignIn} className="space-y-4">
                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider">Operator Username / Handle</label>
                            <div className="relative mt-1">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <UserIcon className="h-4.5 w-4.5 text-slate-400" />
                              </div>
                              <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                                placeholder="e.g. admin or nurse"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center">
                              <label className="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider">Access PIN / Password</label>
                            </div>
                            <div className="relative mt-1">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock className="h-4.5 w-4.5 text-slate-400" />
                              </div>
                              <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-10 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                                placeholder="••••••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-blue-600 py-2.5 hover:bg-blue-700 text-white text-xs font-bold font-sans cursor-pointer transition uppercase tracking-wider active:scale-95 shadow-lg shadow-blue-500/10"
                          >
                            {isSubmitting ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span>Hashing Signatures...</span>
                              </>
                            ) : (
                              <>
                                <Shield className="h-4 w-4" />
                                <span>Authorize Admin Console</span>
                              </>
                            )}
                          </button>
                        </form>

                        <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                          <button
                            onClick={() => {
                              setIsRecoveryMode(true);
                              setRecoveryStep(1);
                              setRecoveryError(null);
                            }}
                            className="font-bold text-slate-500 hover:text-blue-600 transition cursor-pointer select-none inline-flex items-center space-x-1"
                          >
                            <Key className="h-3 w-3" />
                            <span>Recover Secret Key</span>
                          </button>
                          
                          <button
                            onClick={() => setLandingTab('register')}
                            className="font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer select-none"
                          >
                            New Enrollment
                          </button>
                        </div>
                      </>
                    ) : (
                      // Recovery Challenge Screen View
                      <div>
                        <div className="mb-5">
                          <span className="inline-flex rounded bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold px-2 py-0.5 mb-2 uppercase tracking-wide">
                            Security Recovery Center
                          </span>
                          <h2 className="text-xl font-extrabold text-slate-900">Recover Credentials Pin</h2>
                          <p className="text-xs text-slate-500 mt-1">
                            Answer the associated security challenge question to configure a replacement credentials password.
                          </p>
                        </div>

                        {recoverySuccess && (
                          <div className="mb-4 flex items-center space-x-2 rounded-xl bg-emerald-50 border border-emerald-250 p-3 text-xs font-medium text-emerald-850">
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                            <span>{recoverySuccess}</span>
                          </div>
                        )}

                        {recoveryError && (
                          <div className="mb-4 flex items-center space-x-2 rounded-xl bg-rose-50 border border-rose-150 p-3 text-xs font-medium text-rose-850">
                            <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                            <span>{recoveryError}</span>
                          </div>
                        )}

                        {recoveryStep === 1 ? (
                          <form onSubmit={handleInitiateLookup} className="space-y-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">Provide username account</label>
                              <input
                                type="text"
                                required
                                value={recoveryUsername}
                                onChange={(e) => setRecoveryUsername(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="e.g. nurse, admin, or esther"
                              />
                            </div>

                            <div className="flex gap-2 pt-1.5">
                              <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-xs font-bold hover:bg-blue-700 transition"
                              >
                                Query Health Registry
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsRecoveryMode(false)}
                                className="border border-slate-200 text-slate-600 rounded-xl px-4 py-2 text-xs font-bold hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <form onSubmit={handleCommitReset} className="space-y-3.5 text-xs">
                            <div className="rounded-xl border border-slate-150 bg-slate-50 p-3.5">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Question associated with {lookedUpUser?.name}</span>
                              <div className="font-bold text-slate-800 text-[11.5px] italic mt-1 font-sans">
                                "{lookedUpUser?.securityQuestion}"
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">Challenge response</label>
                              <input
                                type="text"
                                required
                                value={recoveryAnswer}
                                onChange={(e) => setRecoveryAnswer(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-205 px-3 py-2 bg-white text-slate-800 font-semibold"
                                placeholder="Case-insensitive response"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">Define new password PIN</label>
                              <input
                                type="password"
                                required
                                value={recoveryNewPassword}
                                onChange={(e) => setRecoveryNewPassword(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-205 px-3 py-2 bg-white text-slate-850 font-semibold"
                                placeholder="Min 6 characters recommended"
                              />
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                type="submit"
                                className="flex-1 bg-emerald-600 text-white rounded-xl py-2 text-xs font-bold hover:bg-emerald-700 transition"
                              >
                                Save Credentials
                              </button>
                              <button
                                type="button"
                                onClick={() => setRecoveryStep(1)}
                                className="border border-slate-200 text-slate-600 rounded-xl px-4 py-2 text-xs font-bold hover:bg-slate-50"
                              >
                                Back
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}



                  </div>
                </motion.div>
              )}

              {/* TAB 4: REGISTER RECIPIENT */}
              {landingTab === 'register' && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-xl"
                >
                  <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xl relative">
                    
                    <div>
                      <span className="inline-flex rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold px-2 py-0.5 mb-2 uppercase tracking-wide">
                        National Health Registry
                      </span>
                      <h2 className="text-xl font-extrabold text-slate-900">National Immunization Register</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Register a clinical security credential to track schedules, monitor schedules, and download digital immunity passports.
                      </p>
                    </div>

                    {regSuccess && (
                      <div className="my-4 flex items-center space-x-2 rounded-xl bg-emerald-50 border border-emerald-255 p-3 text-xs font-semibold text-emerald-850">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                        <span>{regSuccess}</span>
                      </div>
                    )}

                    {regError && (
                      <div className="my-4 flex items-center space-x-2 rounded-xl bg-rose-50 border border-rose-150 p-3 text-xs font-semibold text-rose-850">
                        <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                        <span>{regError}</span>
                      </div>
                    )}

                    <form onSubmit={handleRegister} className="mt-4 space-y-3 font-sans text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">Full Display Name</label>
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 bg-slate-50/50"
                            placeholder="e.g. Alice Wambui"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">Email Address</label>
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 bg-slate-50/50"
                            placeholder="alice@gmail.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">Login Username</label>
                          <input
                            type="text"
                            required
                            value={regUsername}
                            onChange={(e) => setRegUsername(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 bg-slate-50/50"
                            placeholder="e.g. alice"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">Portal Access Role</label>
                          <select
                            value={regRole}
                            onChange={(e) => setRegRole(e.target.value as any)}
                            className="mt-1 w-full rounded-xl border border-slate-200 px-2 py-2 bg-white text-slate-800"
                          >
                            <option value="Patient">Patient (Self-Service)</option>
                            <option value="Nurse">Staff Nurse</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">Password Pin</label>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 bg-slate-50/50"
                          placeholder="••••••••••••"
                        />
                      </div>

                      <div className="border border-slate-150 rounded-xl p-3 bg-slate-50 space-y-2">
                        <span className="text-[9.5px] font-extrabold text-indigo-900 uppercase tracking-widest block">Secure Challenge Key Recovery</span>
                        <div className="grid grid-cols-2 gap-3 text-[11px]">
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Challenge Question</span>
                            <select
                              value={regQuestion}
                              onChange={(e) => setRegQuestion(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-slate-200 p-1.5 bg-white text-slate-700"
                            >
                              <option value="What the clinic facility name?">Clinic facility name?</option>
                              <option value="What is your home town?">What is your home town?</option>
                              <option value="What was the name of your first pet?">First pet name?</option>
                            </select>
                          </div>

                          <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Case-insensitive response</span>
                            <input
                              type="text"
                              required
                              value={regAnswer}
                              onChange={(e) => setRegAnswer(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-slate-200 p-1.5 bg-white text-slate-800"
                              placeholder="Challenge answer"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-indigo-700 transition uppercase tracking-wider"
                        >
                          Establish Account Credentials
                        </button>
                        <button
                          type="button"
                          onClick={() => setLandingTab('signin')}
                          className="border border-slate-200 text-slate-600 rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition"
                        >
                          Sign In
                        </button>
                      </div>
                    </form>
                    
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Dynamic mini sub-footer inside viewport */}
        <footer className="h-6 bg-black/40 border-t border-white/5 px-6 flex items-center justify-between text-[10px] text-indigo-300/40 shrink-0 font-mono relative z-10">
          <span>End-to-End Encrypted Vaccine Dispatch Platform</span>
          <span>© 2026 MINISTRY OF HEALTH CODES</span>
        </footer>

      </div>

      {/* 3. DOCKABLE POPUP DIALOG: DIGITAL IMMUNIZATION PASS (VACCINATION CERTIFICATE CARD) */}
      <AnimatePresence>
        {isPassModalOpen && searchedPatient && (
          <div id="vax-pass-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-800 font-sans relative border border-slate-200"
            >
              
              {/* Green MOH official header */}
              <div className="bg-emerald-600 p-6 text-white flex items-center justify-between relative relative-z-10">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/10 p-2 rounded-xl border border-white/20 text-teal-300">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold tracking-wider uppercase font-mono text-emerald-100">National Immunization Register</h2>
                    <h1 className="text-xl font-black text-white leading-tight">Digital Vaccine Record</h1>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsPassModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-emerald-700/60 transition text-white/90 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Verified Ribbon */}
              <div className="bg-emerald-50 px-6 py-2 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800 font-semibold uppercase tracking-wider">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 inline bg-white rounded-full shrink-0" />
                  <span>State Registry Confirmed</span>
                </span>
                <span className="font-mono text-slate-500">SIGN-ID: VXP-{searchedPatient.id}</span>
              </div>

              {/* Passport Certificate Inner Body */}
              <div className="p-6 md:p-8 space-y-6">
                
                {/* Holder Profile details */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5.5 items-start">
                  
                  {/* Photo area */}
                  <div className="sm:col-span-3 flex flex-col items-center">
                    <div className="h-24 w-24 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 font-mono shadow-inner relative overflow-hidden shrink-0">
                      <QrCode className="h-16 w-16 text-slate-650" />
                    </div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold font-mono">ENCRYPTED QR</span>
                  </div>

                  {/* Identification Meta text */}
                  <div className="sm:col-span-9 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Recipient Name</span>
                      <span className="font-extrabold text-slate-900 text-[14px] leading-tight block mt-0.5">{searchedPatient.name}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Patient Passport ID</span>
                      <span className="font-mono font-bold text-teal-700 text-[14px] block mt-0.5">{searchedPatient.id}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Date of Birth</span>
                      <span className="font-bold text-slate-700 block mt-0.5">{searchedPatient.birthDate}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Gender Type</span>
                      <span className="font-bold text-slate-700 block mt-0.5">{searchedPatient.gender}</span>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Permanent Address</span>
                      <span className="font-medium text-slate-600 block mt-0.5 truncate">{searchedPatient.address}</span>
                    </div>
                  </div>
                </div>

                {/* Applied Injections Timeline */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block font-mono">Immunization Registry Ledger</span>
                  
                  <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/50">
                    {searchedVaccines.length === 0 ? (
                      <div className="p-4 flex flex-col items-center justify-center text-center space-y-1.5">
                        <AlertCircle className="h-7 w-7 text-amber-500" />
                        <p className="text-xs font-bold text-slate-700">No Injections Recorded Yet</p>
                        <p className="text-[10.5px] text-slate-400">This patient has registration records but has not received vaccine doses.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-150">
                        {searchedVaccines.map((vax, idx) => (
                          <div key={vax.id} className="p-3.5 text-xs flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                <span className="font-bold text-slate-900">{vax.vaccineType}</span>
                                <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 uppercase tracking-wider">{vax.doseNumber}</span>
                              </div>
                              <div className="text-[10.5px] text-slate-500 pl-3.5">
                                Mfr: <span className="font-medium text-slate-700 mr-2">{vax.manufacturer}</span>
                                Lot: <span className="font-mono text-slate-700">{vax.batchNumber}</span>
                              </div>
                            </div>
                            <div className="text-right space-y-1 font-mono">
                              <div className="font-semibold text-slate-705 text-[10.5px]">{vax.dateAdministered}</div>
                              <div className="text-[9px] text-slate-400">Nurse: {vax.administeredBy}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Validation stamping signatures */}
                <div className="border-t border-slate-150 pt-4.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4.5 w-4.5 text-emerald-500 bg-emerald-100 rounded-full p-0.5" />
                    <span>Fingerprint Checksum Secured</span>
                  </div>
                  <div>
                    <span>Facility Code Key: HLTH-KE-8402</span>
                  </div>
                </div>

                {/* Print Controls */}
                <div className="flex items-center space-x-3.5 pt-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer select-none transition uppercase"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Passport</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPassModalOpen(false)}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer select-none transition uppercase"
                  >
                    <span>Close Validation</span>
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
