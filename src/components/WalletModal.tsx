import React, { useState, useEffect } from 'react';
import { CryptoCoin, TrackedWallet, PortfolioHolding } from '../types/crypto.ts';
import { formatInr, formatCompactInr, formatNumber } from '../utils/formatters.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  getWalletsApi,
  addWalletApi,
  deleteWalletApi,
  getPortfolioApi,
  addPortfolioApi,
  deletePortfolioApi,
} from '../services/api.ts';
import {
  X,
  Wallet,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Layers,
  PieChart,
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: CryptoCoin[];
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, coins }) => {
  const { user, idToken, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'holdings' | 'wallets'>('holdings');

  // Wallets state
  const [wallets, setWallets] = useState<TrackedWallet[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [newChain, setNewChain] = useState('ethereum');
  const [newLabel, setNewLabel] = useState('');

  // Portfolio holdings state
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [selectedCoinId, setSelectedCoinId] = useState('bitcoin');
  const [amount, setAmount] = useState('');
  const [buyPriceInr, setBuyPriceInr] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Load user data if authenticated
  useEffect(() => {
    if (!isOpen || !idToken) return;
    async function loadData() {
      setLoading(true);
      try {
        const [wList, pList] = await Promise.all([
          getWalletsApi(idToken!),
          getPortfolioApi(idToken!),
        ]);
        setWallets(wList);
        setHoldings(pList);
      } catch (e) {
        console.error('Error loading wallet data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isOpen, idToken]);

  if (!isOpen) return null;

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken || !newAddress || !newLabel) return;
    try {
      const added = await addWalletApi(idToken, {
        walletAddress: newAddress,
        chain: newChain,
        label: newLabel,
      });
      setWallets([...wallets, added]);
      setNewAddress('');
      setNewLabel('');
      setStatusMsg('Wallet added to PostgreSQL database.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to add wallet');
    }
  };

  const handleDeleteWallet = async (id: number) => {
    if (!idToken) return;
    try {
      await deleteWalletApi(idToken, id);
      setWallets(wallets.filter((w) => w.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete wallet');
    }
  };

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken || !amount || !buyPriceInr) return;
    const coin = coins.find((c) => c.id === selectedCoinId);
    if (!coin) return;

    try {
      const added = await addPortfolioApi(idToken, {
        coinId: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        amount,
        buyPriceInr,
      });
      setHoldings([...holdings, added]);
      setAmount('');
      setBuyPriceInr('');
      setStatusMsg('Position added to PostgreSQL portfolio.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to add portfolio position');
    }
  };

  const handleDeleteHolding = async (id: number) => {
    if (!idToken) return;
    try {
      await deletePortfolioApi(idToken, id);
      setHoldings(holdings.filter((h) => h.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete portfolio holding');
    }
  };

  // Portfolio total calculation
  let totalPortfolioValueInr = 0;
  let totalCostBasisInr = 0;

  const holdingDetails = holdings.map((h) => {
    const coin = coins.find((c) => c.id === h.coinId);
    const currentPrice = coin ? coin.currentPriceInr : parseFloat(h.buyPriceInr);
    const qty = parseFloat(h.amount) || 0;
    const buyPrice = parseFloat(h.buyPriceInr) || 0;
    const cost = qty * buyPrice;
    const currentValue = qty * currentPrice;
    const pnl = currentValue - cost;
    const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

    totalPortfolioValueInr += currentValue;
    totalCostBasisInr += cost;

    return { ...h, currentPrice, currentValue, pnl, pnlPercent };
  });

  const totalPnl = totalPortfolioValueInr - totalCostBasisInr;
  const totalPnlPercent = totalCostBasisInr > 0 ? (totalPnl / totalCostBasisInr) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel-glow w-full max-w-3xl rounded-3xl border border-white/15 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Wallet & Portfolio Manager</h2>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Backed by Cloud SQL PostgreSQL
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-white/10 bg-slate-900/50 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('holdings')}
            className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'holdings'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Portfolio Holdings & PnL ({holdings.length})
          </button>
          <button
            onClick={() => setActiveTab('wallets')}
            className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              activeTab === 'wallets'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Tracked Multi-Chain Wallets ({wallets.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!user ? (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 text-center space-y-3">
              <ShieldCheck className="w-8 h-8 text-cyan-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Sign In to Synchronize Across Devices</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Sign in with Google to securely store and sync your custom crypto wallets and portfolio positions in our PostgreSQL relational database.
              </p>
              <button
                onClick={signInWithGoogle}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Sign In with Google
              </button>
            </div>
          ) : (
            <>
              {statusMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                  {statusMsg}
                </div>
              )}

              {/* Tab 1: Holdings */}
              {activeTab === 'holdings' && (
                <div className="space-y-6">
                  {/* Summary Metric Bar */}
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/70 border border-white/5">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Value</span>
                      <span className="text-base sm:text-lg font-bold font-mono text-white mt-0.5 block">
                        {formatInr(totalPortfolioValueInr)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cost Basis</span>
                      <span className="text-base sm:text-lg font-bold font-mono text-slate-300 mt-0.5 block">
                        {formatInr(totalCostBasisInr)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Net PnL</span>
                      <span
                        className={`text-base sm:text-lg font-bold font-mono mt-0.5 block ${
                          totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {totalPnl >= 0 ? '+' : ''}{formatInr(totalPnl)} ({totalPnlPercent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Add Holding Form */}
                  <form onSubmit={handleAddHolding} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                    <span className="text-xs font-bold text-white block">Add Holding to PostgreSQL</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Asset</label>
                        <select
                          value={selectedCoinId}
                          onChange={(e) => {
                            setSelectedCoinId(e.target.value);
                            const coin = coins.find((c) => c.id === e.target.value);
                            if (coin) setBuyPriceInr(coin.currentPriceInr.toString());
                          }}
                          className="w-full text-xs bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                        >
                          {coins.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.symbol})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Quantity</label>
                        <input
                          type="number"
                          step="any"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="e.g. 0.25"
                          className="w-full text-xs bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Buy Price (INR)</label>
                        <input
                          type="number"
                          step="any"
                          value={buyPriceInr}
                          onChange={(e) => setBuyPriceInr(e.target.value)}
                          placeholder="e.g. 8500000"
                          className="w-full text-xs bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none font-mono"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold text-xs transition cursor-pointer"
                    >
                      Save to Database
                    </button>
                  </form>

                  {/* Holdings List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400">Current Positions:</span>
                    {holdingDetails.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No holdings saved yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {holdingDetails.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-white">{item.name} ({item.symbol})</div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {item.amount} @ {formatInr(parseFloat(item.buyPriceInr))}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-bold font-mono text-white">{formatInr(item.currentValue)}</div>
                              <div
                                className={`text-[10px] font-mono font-bold ${
                                  item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {item.pnl >= 0 ? '+' : ''}{formatInr(item.pnl)} ({item.pnlPercent.toFixed(1)}%)
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteHolding(item.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Multi-Chain Wallets */}
              {activeTab === 'wallets' && (
                <div className="space-y-6">
                  {/* Add Wallet Form */}
                  <form onSubmit={handleAddWallet} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                    <span className="text-xs font-bold text-white block">Add Wallet to Track in PostgreSQL</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Chain</label>
                        <select
                          value={newChain}
                          onChange={(e) => setNewChain(e.target.value)}
                          className="w-full text-xs bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                        >
                          <option value="ethereum">Ethereum (ERC-20)</option>
                          <option value="bitcoin">Bitcoin (BTC)</option>
                          <option value="solana">Solana (SPL)</option>
                          <option value="binance-smart-chain">BNB Smart Chain</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Label</label>
                        <input
                          type="text"
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          placeholder="e.g. My Ledger Cold Storage"
                          className="w-full text-xs bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Public Address</label>
                        <input
                          type="text"
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          placeholder="0x... or bc1..."
                          className="w-full text-xs bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none font-mono"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold text-xs transition cursor-pointer"
                    >
                      Save Wallet to Database
                    </button>
                  </form>

                  {/* Wallets List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400">Tracked Addresses:</span>
                    {wallets.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No wallets connected or tracked yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {wallets.map((w) => (
                          <div
                            key={w.id}
                            className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{w.label}</span>
                                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                                  {w.chain}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-sm">
                                {w.walletAddress}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteWallet(w.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
