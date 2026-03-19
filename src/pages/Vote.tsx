import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Vote, ExternalLink, Gift, Trophy, CheckCircle2, Star, ShieldCheck, Zap } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

export default function VotePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [votedSites, setVotedSites] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const votingSites = [
    { id: '1', name: 'Planet Minecraft', url: 'https://www.planetminecraft.com', rewards: '500 Coins + 1 Common Crate' },
    { id: '2', name: 'Minecraft-MP', url: 'https://minecraft-mp.com', rewards: '500 Coins + 1 Common Crate' },
    { id: '3', name: 'Minecraft Servers', url: 'https://minecraftservers.org', rewards: '500 Coins + 1 Common Crate' },
    { id: '4', name: 'TopG', url: 'https://topg.org', rewards: '500 Coins + 1 Common Crate' },
    { id: '5', name: 'MCSL', url: 'https://minecraft-server-list.com', rewards: '500 Coins + 1 Common Crate' },
  ];

  const handleVote = (siteId: string, url: string) => {
    window.open(url, '_blank');
    if (!votedSites.includes(siteId)) {
      setVotedSites([...votedSites, siteId]);
    }
  };

  return (
    <div className="pt-24 pb-12 min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500/10 rounded-3xl mb-6 border border-cyan-500/20"
          >
            <Vote className="w-10 h-10 text-cyan-500" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-white mb-4"
          >
            VOTE FOR <span className="text-cyan-500">LUNAR CRAFT</span>
          </motion.h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Support the server by voting on these sites. You'll receive awesome rewards in-game for every vote!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Voting Sites List */}
          <div className="lg:col-span-2 space-y-4">
            {votingSites.map((site, index) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col sm:flex-row items-center justify-between p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-center space-x-6 mb-4 sm:mb-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${votedSites.includes(site.id) ? 'bg-emerald-500/10' : 'bg-zinc-800'}`}>
                    {votedSites.includes(site.id) ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Star className="w-6 h-6 text-zinc-600 group-hover:text-cyan-500 transition-colors" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{site.name}</h3>
                    <p className="text-zinc-500 text-sm flex items-center">
                      <Gift className="w-3 h-3 mr-1 text-cyan-500" />
                      {site.rewards}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleVote(site.id, site.url)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    votedSites.includes(site.id)
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                  }`}
                >
                  <span>{votedSites.includes(site.id) ? 'Voted' : 'Vote Now'}</span>
                  {!votedSites.includes(site.id) && <ExternalLink className="w-4 h-4" />}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Rewards Sidebar */}
          <div className="space-y-8">
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/20 transition-colors" />
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
                Vote Rewards
              </h3>
              <ul className="space-y-4">
                {[
                  { label: 'Daily Vote', reward: '500 Coins + 1 Common Crate', icon: Zap },
                  { label: 'All Sites (Daily)', reward: 'Bonus 1000 Coins + 1 Rare Crate', icon: Star },
                  { label: 'Top Voter (Monthly)', reward: '$25 Store Credit + LUNAR Rank', icon: Trophy },
                ].map((item) => (
                  <li key={item.label} className="flex items-start space-x-4">
                    <div className="mt-1 w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-3 h-3 text-cyan-500" />
                    </div>
                    <div>
                      <span className="block text-zinc-300 font-bold text-sm">{item.label}</span>
                      <span className="block text-zinc-500 text-xs">{item.reward}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-zinc-400 text-sm">Your Votes Today</span>
                  <span className="text-white font-bold">{votedSites.length} / {votingSites.length}</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(votedSites.length / votingSites.length) * 100}%` }}
                    className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <ShieldCheck className="w-5 h-5 text-cyan-500 mr-2" />
                How it works
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                1. Click "Vote Now" for each site.<br/>
                2. Enter your Minecraft username.<br/>
                3. Complete the captcha and submit.<br/>
                4. Rewards are sent instantly in-game!<br/><br/>
                <span className="text-xs text-zinc-500 italic">Note: You must be online or have joined the server at least once to receive rewards.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
