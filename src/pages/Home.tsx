import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Copy, Check, Users, Shield, Zap, Trophy, ArrowRight, Sword, Map, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ServerStatus {
  online: boolean;
  players: {
    online: number;
    max: number;
  };
  version: string;
  motd: string;
}

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const serverIP = 'play.lunarcraft.fun';
  const serverPort = '25565';

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`https://api.mcsrvstat.us/3/${serverIP}`);
        const data = await response.json();
        setStatus({
          online: data.online,
          players: {
            online: data.players?.online || 0,
            max: data.players?.max || 0,
          },
          version: data.version || '1.21.11',
          motd: data.motd?.clean?.[0] || 'Welcome to Lunar Craft!',
        });
      } catch (error) {
        console.error('Error fetching server status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const copyIP = () => {
    navigator.clipboard.writeText(serverIP);
    setCopied(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#ffffff', '#000000']
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    {
      title: 'Survival',
      description: 'Explore a vast world, build your empire, and survive the night with custom plugins and a balanced economy.',
      icon: Map,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Practice',
      description: 'Sharpen your PvP skills in our dedicated practice arena. Instant respawns and various kits available.',
      icon: Target,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10'
    },
    {
      title: 'Bedwars',
      description: 'Protect your bed, gather resources, and eliminate opponents in this classic strategic team-based game.',
      icon: Sword,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10'
    }
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>Version 1.21.11 • Java & Bedrock</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6">
              LUNAR<span className="text-cyan-500">CRAFT</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Experience the ultimate Minecraft adventure. Join thousands of players in our unique Survival, Practice, and Bedwars realms.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={copyIP}
                className="group relative flex items-center space-x-3 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                <span className="text-lg">{serverIP}</span>
                <div className="h-6 w-px bg-black/10" />
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                
                {copied && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -40 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs py-1 px-2 rounded"
                  >
                    Copied!
                  </motion.div>
                )}
              </button>

              <div className="flex items-center space-x-4 px-6 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-sm">
                <div className="flex flex-col items-start">
                  <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Players Online</span>
                  <span className="text-xl font-mono font-bold text-white">
                    {status?.players.online ?? '...'}<span className="text-zinc-600">/{status?.players.max ?? '...'}</span>
                  </span>
                </div>
                <Users className="w-8 h-8 text-cyan-500 opacity-50" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-zinc-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl hover:border-cyan-500/50 transition-all"
              >
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  {feature.description}
                </p>
                <Link to="/store" className="inline-flex items-center text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                  Explore Mode <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Achievements Section */}
      <section className="py-24 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Players', value: '10k+', icon: Users },
              { label: 'Custom Plugins', value: '50+', icon: Zap },
              { label: 'Uptime', value: '99.9%', icon: Shield },
              { label: 'Tournaments', value: 'Weekly', icon: Trophy },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-900 rounded-xl mb-4">
                  <stat.icon className="w-6 h-6 text-cyan-500" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-zinc-500 uppercase tracking-widest font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
