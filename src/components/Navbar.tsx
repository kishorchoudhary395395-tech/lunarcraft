import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Moon, ShoppingCart, Vote, MessageSquare, HelpCircle, User, LogOut } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '../types';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data() as UserProfile);
          }
        });
        return () => unsubscribeProfile();
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: Moon },
    { name: 'Store', path: '/store', icon: ShoppingCart },
    { name: 'Vote', path: '/vote', icon: Vote },
    { name: 'Suggestions', path: '/suggestions', icon: MessageSquare },
    { name: 'Support', path: '/support', icon: HelpCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Moon className="w-5 h-5 text-black fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tighter text-white">LUNAR<span className="text-cyan-500">CRAFT</span></span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            ))}
            
            <div className="h-6 w-px bg-zinc-800 mx-2" />
            
            {userProfile ? (
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 transition-all group"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center overflow-hidden">
                   <img 
                    src={`https://mc-heads.net/avatar/${userProfile.minecraftUsername}/24`} 
                    alt={userProfile.minecraftUsername}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-sm font-medium text-zinc-200 group-hover:text-cyan-400">
                  {userProfile.minecraftUsername}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-950 border-b border-zinc-800 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </Link>
              ))}
              <div className="pt-4 pb-2 border-t border-zinc-800 mt-2">
                {userProfile ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-zinc-200 hover:bg-zinc-800"
                  >
                    <img 
                      src={`https://mc-heads.net/avatar/${userProfile.minecraftUsername}/24`} 
                      alt={userProfile.minecraftUsername}
                      className="w-6 h-6 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                    <span>{userProfile.minecraftUsername}</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-cyan-500 text-black font-bold"
                  >
                    <User className="w-5 h-5" />
                    <span>Login / Register</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
