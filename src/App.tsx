import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Store from './pages/Store';
import Vote from './pages/Vote';
import Suggestions from './pages/Suggestions';
import Support from './pages/Support';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-cyan-500/30 selection:text-cyan-400">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/store" element={<Store />} />
            <Route path="/vote" element={<Vote />} />
            <Route path="/suggestions" element={<Suggestions />} />
            <Route path="/support" element={<Support />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
          
          <footer className="py-12 border-t border-zinc-900 bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col items-center md:items-start">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center">
                      <div className="w-3 h-3 bg-black rounded-full" />
                    </div>
                    <span className="text-lg font-bold tracking-tighter text-white">LUNAR<span className="text-cyan-500">CRAFT</span></span>
                  </div>
                  <p className="text-zinc-500 text-sm max-w-xs text-center md:text-left">
                    The ultimate Minecraft experience for Java and Bedrock players. Join our community today!
                  </p>
                </div>
                
                <div className="flex items-center space-x-8 text-sm font-bold uppercase tracking-widest text-zinc-600">
                  <Link to="/" className="hover:text-cyan-500 transition-colors">Home</Link>
                  <Link to="/store" className="hover:text-cyan-500 transition-colors">Store</Link>
                  <Link to="/vote" className="hover:text-cyan-500 transition-colors">Vote</Link>
                  <Link to="/support" className="hover:text-cyan-500 transition-colors">Support</Link>
                </div>
                
                <div className="text-center md:text-right">
                  <p className="text-zinc-600 text-xs mb-2">© 2026 Lunar Craft Server. All rights reserved.</p>
                  <p className="text-zinc-700 text-[10px] uppercase tracking-widest font-bold">Not affiliated with Mojang AB.</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
    </Router>
  );
}
