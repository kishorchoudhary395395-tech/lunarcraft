import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Trash2, CreditCard, ShieldCheck, Zap, Star, Crown, Package, X } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Product } from '../types';

export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [category, setCategory] = useState<'all' | 'rank' | 'item' | 'perk'>('all');

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
    });

    // If no products in DB, provide some defaults for demo
    if (products.length === 0) {
      setProducts([
        { id: '1', name: 'LUNAR Rank', price: 19.99, description: 'The ultimate rank with exclusive perks, flying, and custom prefixes.', category: 'rank', image: 'https://picsum.photos/seed/rank1/400/400' },
        { id: '2', name: 'NOVA Rank', price: 9.99, description: 'Great entry-level rank with colored chat and priority queue.', category: 'rank', image: 'https://picsum.photos/seed/rank2/400/400' },
        { id: '3', name: '5000 Coins', price: 4.99, description: 'In-game currency for Survival and Bedwars cosmetics.', category: 'item', image: 'https://picsum.photos/seed/coins/400/400' },
        { id: '4', name: 'Custom Cape', price: 14.99, description: 'A unique cosmetic cape visible to all players on the server.', category: 'perk', image: 'https://picsum.photos/seed/cape/400/400' },
        { id: '5', name: 'Private Vaults', price: 2.99, description: 'Access to 3 extra private vaults in Survival mode.', category: 'perk', image: 'https://picsum.photos/seed/vault/400/400' },
        { id: '6', name: 'Bedwars Kit Bundle', price: 7.99, description: 'Unlock all basic kits for Bedwars permanently.', category: 'item', image: 'https://picsum.photos/seed/bundle/400/400' },
      ]);
    }

    return () => unsubscribe();
  }, []);

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const filteredProducts = category === 'all' 
    ? products 
    : products.filter(p => p.category === category);

  return (
    <div className="pt-24 pb-12 min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-white mb-4"
          >
            SERVER <span className="text-cyan-500">STORE</span>
          </motion.h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Support the server and get exclusive perks, ranks, and items. All purchases are instant and secure.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {['all', 'rank', 'item', 'perk'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat as any)}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                category === cat 
                  ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {cat}s
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <span className="text-cyan-400 font-bold">${product.price}</span>
                </div>
                <div className="absolute top-4 left-4">
                  {product.category === 'rank' && <Crown className="w-6 h-6 text-yellow-500 drop-shadow-lg" />}
                  {product.category === 'item' && <Package className="w-6 h-6 text-cyan-500 drop-shadow-lg" />}
                  {product.category === 'perk' && <Zap className="w-6 h-6 text-purple-500 drop-shadow-lg" />}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                <p className="text-zinc-400 text-sm mb-6 flex-grow">{product.description}</p>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full py-3 bg-zinc-800 hover:bg-cyan-500 hover:text-black text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-6 h-6 text-cyan-500" />
                  <h2 className="text-xl font-bold text-white">Your Cart</h2>
                  <span className="bg-cyan-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    {cart.length}
                  </span>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                      <ShoppingCart className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500">Your cart is empty</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 text-cyan-400 font-bold hover:text-cyan-300"
                    >
                      Browse Store
                    </button>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center space-x-4 p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-grow">
                        <h4 className="text-white font-bold">{item.name}</h4>
                        <p className="text-cyan-500 font-mono text-sm">${item.price}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(index)}
                        className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-zinc-400 font-medium">Total Amount</span>
                    <span className="text-2xl font-black text-white">${totalPrice.toFixed(2)}</span>
                  </div>
                  <button className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-2xl transition-all flex items-center justify-center space-x-3 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                    <CreditCard className="w-5 h-5" />
                    <span>Checkout Now</span>
                  </button>
                  <div className="mt-4 flex items-center justify-center space-x-4 text-zinc-500 text-xs uppercase tracking-widest font-bold">
                    <div className="flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>Instant Delivery</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
