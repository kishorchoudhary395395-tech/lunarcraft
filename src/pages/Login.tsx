import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, User, ShieldCheck, Moon, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { UserProfile } from '../types';

export default function Login() {
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [step, setStep] = useState<'auth' | 'link'>('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          navigate('/dashboard');
        } else {
          setStep('link');
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Failed to login with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkMinecraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !minecraftUsername) return;

    setIsLoading(true);
    setError(null);
    try {
      // Basic validation: Minecraft usernames are 3-16 chars, alphanumeric + underscores
      const isValid = /^[a-zA-Z0-9_]{3,16}$/.test(minecraftUsername);
      if (!isValid) {
        setError('Invalid Minecraft username. Must be 3-16 characters (A-Z, 0-9, _).');
        setIsLoading(false);
        return;
      }

      const userProfile: UserProfile = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email!,
        minecraftUsername: minecraftUsername,
        role: 'user',
        createdAt: Timestamp.now()
      };

      await setDoc(doc(db, 'users', auth.currentUser.uid), userProfile);
      navigate('/dashboard');
    } catch (err) {
      console.error('Linking error:', err);
      setError('Failed to link Minecraft account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-zinc-950 px-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500 rounded-2xl mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <Moon className="w-8 h-8 text-black fill-current" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            {step === 'auth' ? 'Welcome Back' : 'One Last Step'}
          </h1>
          <p className="text-zinc-400">
            {step === 'auth' 
              ? 'Join the Lunar Craft community today.' 
              : 'Link your Minecraft account to continue.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {step === 'auth' ? (
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-4 bg-white hover:bg-zinc-100 text-black font-bold rounded-2xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
            <p className="text-center text-zinc-500 text-xs mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLinkMinecraft} className="space-y-6">
            <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Authenticated!</p>
                <p className="text-zinc-500 text-xs">{auth.currentUser?.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Minecraft Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                <input
                  type="text"
                  required
                  value={minecraftUsername}
                  onChange={(e) => setMinecraftUsername(e.target.value)}
                  placeholder="e.g., Notch"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <p className="mt-2 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Must match your in-game name exactly</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-2xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-8 border-t border-zinc-800 flex items-center justify-center space-x-6 text-zinc-600">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Secure</span>
          </div>
          <div className="flex items-center space-x-1">
            <LogIn className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Fast Login</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
