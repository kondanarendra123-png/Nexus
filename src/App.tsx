/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Cpu, 
  Zap, 
  X, 
  ChevronRight, 
  Mail, 
  BookOpen,
  Github,
  Linkedin,
  Twitter,
  Lock,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  getDocFromServer 
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

// --- Types ---
interface ProfileData {
  name: string;
  email: string;
  rollNumber: string;
  year: string;
  bio: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

// --- Error Handling ---
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Components ---

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-navy-950 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-navy-400 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-navy-600 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-navy-800 rounded-2xl border border-navy-700 mb-6 shadow-xl">
            <Zap className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tighter mb-2">Welcome to NEXAS</h1>
          <p className="text-navy-400">{isSignUp ? 'Create an account to join GNITC EEE' : 'Sign in to access the GNITC EEE portal'}</p>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-navy-500 transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-navy-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-white text-navy-900 rounded-xl font-bold text-lg hover:bg-navy-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>{isSignUp ? 'Sign Up' : 'Sign In'} <ChevronRight size={20} /></>
              )}
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-navy-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-navy-900 px-2 text-navy-500 tracking-widest">Or continue with</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 bg-navy-800 text-white border border-navy-700 rounded-xl font-semibold hover:bg-navy-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-navy-800 text-center">
            <p className="text-navy-500 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-navy-300 hover:text-white transition-colors font-semibold"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = ({ onOpenProfile, onLogout }: { onOpenProfile: () => void; onLogout: () => void }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/80 backdrop-blur-md border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center border border-navy-600">
            <Zap className="text-navy-100 w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-white">NEXAS</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#home" className="text-navy-300 hover:text-white transition-colors text-sm font-medium uppercase tracking-widest">Home</a>
          <a href="#about" className="text-navy-300 hover:text-white transition-colors text-sm font-medium uppercase tracking-widest">About</a>
          <button 
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-navy-700 hover:bg-navy-600 text-white px-5 py-2.5 rounded-full border border-navy-500 transition-all text-sm font-medium uppercase tracking-widest"
          >
            <User size={16} />
            Profile
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-navy-400 hover:text-red-400 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const ProfileModal = ({ 
  isOpen, 
  onClose, 
  profile, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  profile: ProfileData;
  onSave: (p: ProfileData) => Promise<void>;
}) => {
  const [tempProfile, setTempProfile] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setTempProfile(profile);
  }, [isOpen, profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(tempProfile);
      onClose();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-navy-800 border border-navy-700 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">User Profile</h2>
                <button onClick={onClose} className="p-2 hover:bg-navy-700 rounded-full transition-colors">
                  <X size={20} className="text-navy-400" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                    className="w-full bg-navy-900 border border-navy-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-navy-500 transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Roll Number</label>
                    <input 
                      type="text" 
                      value={tempProfile.rollNumber}
                      onChange={(e) => setTempProfile({ ...tempProfile, rollNumber: e.target.value })}
                      className="w-full bg-navy-900 border border-navy-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-navy-500 transition-colors"
                      placeholder="e.g. 21K81A02XX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Year</label>
                    <select 
                      value={tempProfile.year}
                      onChange={(e) => setTempProfile({ ...tempProfile, year: e.target.value })}
                      className="w-full bg-navy-900 border border-navy-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-navy-500 transition-colors appearance-none"
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    readOnly
                    value={tempProfile.email}
                    className="w-full bg-navy-900/50 border border-navy-800 rounded-xl px-4 py-3 text-navy-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Bio</label>
                  <textarea 
                    rows={3}
                    value={tempProfile.bio}
                    onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                    className="w-full bg-navy-900 border border-navy-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-navy-500 transition-colors resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={onClose}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 rounded-xl border border-navy-700 text-navy-300 font-medium hover:bg-navy-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 rounded-xl bg-white text-navy-900 font-bold hover:bg-navy-100 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isSaving ? <div className="w-5 h-5 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" /> : 'Save Profile'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function AppContent() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    rollNumber: '',
    year: '',
    bio: ''
  });

  useEffect(() => {
    setPersistence(auth, browserSessionPersistence).catch(err => {
      console.error('Persistence error:', err);
    });
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}`;
    const unsubscribe = onSnapshot(doc(db, path), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as ProfileData);
      } else {
        setProfile({
          name: user.displayName || '',
          email: user.email || '',
          rollNumber: '',
          year: '',
          bio: ''
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSaveProfile = async (updatedProfile: ProfileData) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, path), updatedProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-navy-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-navy-900 selection:bg-navy-500 selection:text-white">
      <Navbar 
        onOpenProfile={() => setIsProfileOpen(true)} 
        onLogout={handleLogout}
      />
      
      <main>
        {/* Hero Section */}
        <section id="home" className="relative pt-40 pb-20 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-20 pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-navy-400 rounded-full blur-[120px]" />
            <div className="absolute bottom-20 right-10 w-64 h-64 bg-navy-600 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-800 border border-navy-700 text-navy-300 text-xs font-bold uppercase tracking-widest mb-8">
                <Cpu size={14} />
                <span>Empowering Electrical Excellence</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-8 leading-[0.9]">
                NEXAS <br />
                <span className="text-navy-400">GNITC EEE</span>
              </h1>
              <p className="text-xl text-navy-300 max-w-2xl mx-auto mb-12 leading-relaxed">
                The premier hub for Electrical and Electronics Engineering at Guru Nanak Institutions. 
                Connecting students, faculty, and industry pioneers.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="px-8 py-4 bg-white text-navy-900 rounded-full font-bold text-lg hover:bg-navy-100 transition-all flex items-center gap-2"
                >
                  Get Started <ChevronRight size={20} />
                </button>
                <a 
                  href="#about"
                  className="px-8 py-4 bg-navy-800 text-white border border-navy-700 rounded-full font-bold text-lg hover:bg-navy-700 transition-all"
                >
                  Learn More
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-32 px-6 bg-navy-950">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-8 font-serif italic">
                  The Power of EEE at GNITC
                </h2>
                <div className="space-y-6 text-navy-300 text-lg leading-relaxed">
                  <p>
                    Electrical and Electronics Engineering (EEE) is the backbone of modern civilization. At GNITC, our EEE department is more than just a course; it's a gateway to the future of energy, automation, and sustainable technology.
                  </p>
                  <p>
                    GNITC provides state-of-the-art laboratories and a curriculum designed to bridge the gap between theoretical knowledge and industrial application. From Power Systems to Control Engineering, we prepare students to lead the global energy transition.
                  </p>
                  <div className="grid grid-cols-2 gap-6 pt-8">
                    <div className="p-6 bg-navy-900 rounded-2xl border border-navy-800">
                      <Zap className="text-navy-400 mb-4" size={32} />
                      <h3 className="text-white font-bold mb-2">Innovation</h3>
                      <p className="text-sm text-navy-400">Cutting-edge research in renewable energy and smart grids.</p>
                    </div>
                    <div className="p-6 bg-navy-900 rounded-2xl border border-navy-800">
                      <Cpu className="text-navy-400 mb-4" size={32} />
                      <h3 className="text-white font-bold mb-2">Technology</h3>
                      <p className="text-sm text-navy-400">Advanced microcontrollers and power electronics labs.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="aspect-square rounded-3xl overflow-hidden border border-navy-800 shadow-2xl">
                  <img 
                    src="/Nexus.png" 
                    alt="Engineering Lab" 
                    className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent" />
                </div>
                <div className="absolute -bottom-10 -left-10 p-8 bg-navy-800 border border-navy-700 rounded-2xl hidden md:block max-w-xs">
                  <BookOpen className="text-navy-400 mb-4" size={24} />
                  <p className="text-white font-medium italic">"The science of today is the technology of tomorrow."</p>
                  <p className="text-navy-400 text-sm mt-2">— Edward Teller</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 border-y border-navy-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              <div>
                <div className="text-4xl font-bold text-white mb-2">0</div>
                <div className="text-navy-400 text-sm uppercase tracking-widest font-semibold">Active Students</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">0</div>
                <div className="text-navy-400 text-sm uppercase tracking-widest font-semibold">Expert Faculty</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">0</div>
                <div className="text-navy-400 text-sm uppercase tracking-widest font-semibold">Modern Labs</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">0%</div>
                <div className="text-navy-400 text-sm uppercase tracking-widest font-semibold">Placement Rate</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 px-6 border-t border-navy-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-navy-400 w-6 h-6" />
                <span className="text-xl font-bold tracking-tighter text-white">NEXAS</span>
              </div>
              <p className="text-navy-400 max-w-sm">
                Guru Nanak Institutions Technical Campus <br />
                Department of Electrical & Electronics Engineering
              </p>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="p-3 bg-navy-800 rounded-full text-navy-400 hover:text-white hover:bg-navy-700 transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="p-3 bg-navy-800 rounded-full text-navy-400 hover:text-white hover:bg-navy-700 transition-all">
                <Linkedin size={20} />
              </a>
              <a href="#" className="p-3 bg-navy-800 rounded-full text-navy-400 hover:text-white hover:bg-navy-700 transition-all">
                <Github size={20} />
              </a>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-navy-800/50 flex flex-col md:flex-row justify-between text-navy-500 text-sm">
            <p>© 2026 Nexas GNITC. All rights reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-navy-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-navy-300 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppContent />
  );
}
