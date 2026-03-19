import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ThumbsUp, ThumbsDown, Plus, Send, X, CheckCircle2, Clock, Zap, ShieldAlert } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, Timestamp, getDoc } from 'firebase/firestore';
import { Suggestion, UserProfile } from '../types';
import { handleFirestoreError } from '../utils/firestoreErrorHandler';
import { OperationType } from '../types';

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'suggestions'), orderBy('votes', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const suggestionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Suggestion));
      setSuggestions(suggestionsData);
    });

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
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

    return () => {
      unsubscribe();
      unsubscribeAuth();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newTitle || !newDescription) return;

    setIsSubmitting(true);
    try {
      const suggestionData = {
        uid: auth.currentUser.uid,
        title: newTitle,
        description: newDescription,
        votes: 0,
        status: 'under-review',
        createdAt: Timestamp.now()
      };
      await addDoc(collection(db, 'suggestions'), suggestionData);
      setNewTitle('');
      setNewDescription('');
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'suggestions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (suggestionId: string, currentVotes: number, delta: number) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'suggestions', suggestionId), {
        votes: currentVotes + delta
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `suggestions/${suggestionId}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under-review': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'planned': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
      case 'implemented': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'under-review': return <Clock className="w-3 h-3 mr-1" />;
      case 'planned': return <Zap className="w-3 h-3 mr-1" />;
      case 'implemented': return <CheckCircle2 className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="pt-24 pb-12 min-h-screen bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              SERVER <span className="text-cyan-500">SUGGESTIONS</span>
            </h1>
            <p className="text-zinc-400">
              Help us improve Lunar Craft. Share your ideas and vote on others.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <Plus className="w-5 h-5" />
            <span>New Suggestion</span>
          </button>
        </div>

        {/* Suggestions List */}
        <div className="space-y-6">
          {suggestions.length === 0 ? (
            <div className="text-center py-24 bg-zinc-900/30 border border-zinc-800 rounded-3xl">
              <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">No suggestions yet. Be the first to share an idea!</p>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl hover:border-cyan-500/30 transition-all flex items-start gap-6"
              >
                {/* Vote Controls */}
                <div className="flex flex-col items-center space-y-2 bg-zinc-950 p-2 rounded-2xl border border-zinc-800">
                  <button 
                    onClick={() => handleVote(suggestion.id, suggestion.votes, 1)}
                    className="p-2 text-zinc-500 hover:text-cyan-500 transition-colors"
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                  <span className={`font-black text-lg ${suggestion.votes >= 0 ? 'text-white' : 'text-red-500'}`}>
                    {suggestion.votes}
                  </span>
                  <button 
                    onClick={() => handleVote(suggestion.id, suggestion.votes, -1)}
                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                  >
                    <ThumbsDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(suggestion.status)}`}>
                      {getStatusIcon(suggestion.status)}
                      {suggestion.status.replace('-', ' ')}
                    </span>
                    <span className="text-zinc-600 text-xs">
                      {suggestion.createdAt instanceof Timestamp ? suggestion.createdAt.toDate().toLocaleDateString() : new Date(suggestion.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {suggestion.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* New Suggestion Modal */}
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
                <h2 className="text-2xl font-bold text-white">New Suggestion</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {!auth.currentUser ? (
                <div className="text-center py-12">
                  <ShieldAlert className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-zinc-400 mb-6">You must be logged in to submit a suggestion.</p>
                  <Link to="/login" className="px-8 py-3 bg-cyan-500 text-black font-bold rounded-xl">Login Now</Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Title</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g., Add more Bedwars maps"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Description</label>
                    <textarea
                      required
                      rows={5}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Explain your idea in detail..."
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
                        <span>Submit Suggestion</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
