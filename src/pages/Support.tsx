import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Plus, Send, X, Clock, CheckCircle2, MessageSquare, ShieldAlert, ChevronRight, FileText } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, where, orderBy, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { Ticket, UserProfile } from '../types';
import { handleFirestoreError } from '../utils/firestoreErrorHandler';
import { OperationType } from '../types';

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('General');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        }

        const q = query(
          collection(db, 'tickets'),
          where('uid', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const unsubscribeTickets = onSnapshot(q, (snapshot) => {
          const ticketsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
          setTickets(ticketsData);
        });
        return () => unsubscribeTickets();
      } else {
        setUserProfile(null);
        setTickets([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !subject || !message) return;

    setIsSubmitting(true);
    try {
      const ticketData = {
        uid: auth.currentUser.uid,
        category,
        subject,
        message,
        status: 'open',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      await addDoc(collection(db, 'tickets'), ticketData);
      setSubject('');
      setMessage('');
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tickets');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'closed': return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  return (
    <div className="pt-24 pb-12 min-h-screen bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              SUPPORT <span className="text-cyan-500">CENTER</span>
            </h1>
            <p className="text-zinc-400">
              Need help? Create a ticket and our staff will assist you as soon as possible.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <Plus className="w-5 h-5" />
            <span>Create Ticket</span>
          </button>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {!auth.currentUser ? (
            <div className="text-center py-24 bg-zinc-900/30 border border-zinc-800 rounded-3xl">
              <ShieldAlert className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-zinc-400 mb-6">You must be logged in to view your tickets.</p>
              <Link to="/login" className="px-8 py-3 bg-cyan-500 text-black font-bold rounded-xl">Login Now</Link>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-24 bg-zinc-900/30 border border-zinc-800 rounded-3xl">
              <HelpCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">You haven't created any tickets yet.</p>
            </div>
          ) : (
            tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTicket(ticket)}
                className="group p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-cyan-500/30 transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(ticket.status)}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-white font-bold">{ticket.subject}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-zinc-500">
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {ticket.createdAt instanceof Timestamp ? ticket.createdAt.toDate().toLocaleDateString() : new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center"><MessageSquare className="w-3 h-3 mr-1" /> {ticket.category}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-cyan-500 transition-colors" />
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8 z-[90] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Create Support Ticket</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                      <option value="General">General</option>
                      <option value="Store">Store / Payment</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Player Report">Player Report</option>
                      <option value="Appeal">Ban Appeal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief summary..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8 z-[90] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedTicket.subject}</h2>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full border ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status}</span>
                    <span className="text-zinc-500">ID: {selectedTicket.id.slice(0, 8)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-black font-bold text-xs">YOU</div>
                    <span className="text-zinc-400 text-xs">{selectedTicket.createdAt instanceof Timestamp ? selectedTicket.createdAt.toDate().toLocaleString() : new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.message}
                  </p>
                </div>

                <div className="p-6 bg-zinc-800/30 rounded-2xl border border-zinc-800 border-dashed text-center">
                  <p className="text-zinc-500 text-sm italic">Our staff will reply to your ticket shortly. You will be notified when there's an update.</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
