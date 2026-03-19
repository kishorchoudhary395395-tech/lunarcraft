import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogOut, User, ShieldCheck, Moon, ArrowRight, ShieldAlert, CheckCircle2, Trophy, Clock, Zap, MessageSquare, HelpCircle, Settings, ExternalLink } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, getDoc, collection, query, where, limit, orderBy } from 'firebase/firestore';
import { UserProfile, Ticket, Suggestion } from '../types';

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [recentSuggestions, setRecentSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile);
          setIsLoading(false);
        } else {
          navigate('/login');
        }
      });

      const ticketsQuery = query(
        collection(db, 'tickets'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const unsubscribeTickets = onSnapshot(ticketsQuery, (snapshot) => {
        setRecentTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket)));
      });

      const suggestionsQuery = query(
        collection(db, 'suggestions'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const unsubscribeSuggestions = onSnapshot(suggestionsQuery, (snapshot) => {
        setRecentSuggestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Suggestion)));
      });

      return () => {
        unsubscribeProfile();
        unsubscribeTickets();
        unsubscribeSuggestions();
      };
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://mc-heads.net/avatar/${userProfile?.minecraftUsername}/96`} 
                  alt={userProfile?.minecraftUsername}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-3xl font-black text-white">{userProfile?.minecraftUsername}</h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${userProfile?.role === 'admin' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20'}`}>
                  {userProfile?.role}
                </span>
              </div>
              <p className="text-zinc-500 text-sm font-medium">{userProfile?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-bold rounded-2xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Grid */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Server Rank', value: 'NOVA', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                { label: 'Total Votes', value: '42', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Lunar Coins', value: '1,250', icon: Zap, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
              ].map((stat) => (
                <div key={stat.label} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Clock className="w-5 h-5 text-cyan-500 mr-2" />
                  Recent Activity
                </h3>
              </div>
              <div className="space-y-4">
                {recentTickets.length === 0 && recentSuggestions.length === 0 ? (
                  <div className="p-12 text-center bg-zinc-900/30 border border-zinc-800 rounded-3xl border-dashed">
                    <p className="text-zinc-500">No recent activity found.</p>
                  </div>
                ) : (
                  <>
                    {recentTickets.map(ticket => (
                      <Link key={ticket.id} to="/support" className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-cyan-500/30 transition-all group">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-cyan-500" />
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">Support Ticket: {ticket.subject}</p>
                            <p className="text-zinc-500 text-xs">Status: {ticket.status}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-cyan-500 transition-colors" />
                      </Link>
                    ))}
                    {recentSuggestions.map(suggestion => (
                      <Link key={suggestion.id} to="/suggestions" className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-cyan-500/30 transition-all group">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">Suggestion: {suggestion.title}</p>
                            <p className="text-zinc-500 text-xs">Votes: {suggestion.votes}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-cyan-500 transition-colors" />
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Settings className="w-5 h-5 text-cyan-500 mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link to="/vote" className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800 hover:border-cyan-500/30 transition-all group">
                  <span className="text-zinc-300 font-bold text-sm">Vote for Server</span>
                  <ExternalLink className="w-4 h-4 text-zinc-700 group-hover:text-cyan-500 transition-colors" />
                </Link>
                <Link to="/store" className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800 hover:border-cyan-500/30 transition-all group">
                  <span className="text-zinc-300 font-bold text-sm">Visit Store</span>
                  <ExternalLink className="w-4 h-4 text-zinc-700 group-hover:text-cyan-500 transition-colors" />
                </Link>
                <Link to="/support" className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800 hover:border-cyan-500/30 transition-all group">
                  <span className="text-zinc-300 font-bold text-sm">Get Support</span>
                  <ExternalLink className="w-4 h-4 text-zinc-700 group-hover:text-cyan-500 transition-colors" />
                </Link>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl text-white">
              <h3 className="text-xl font-black mb-4">LUNAR PLUS</h3>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                Unlock exclusive cosmetics, priority queue, and special discord roles with Lunar Plus.
              </p>
              <Link to="/store" className="block w-full py-3 bg-white text-black font-black text-center rounded-xl hover:scale-105 transition-transform">
                UPGRADE NOW
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
