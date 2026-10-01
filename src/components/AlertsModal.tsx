import React, { useState, useEffect } from 'react';
import { CryptoCoin, PriceAlert } from '../types/crypto.ts';
import { formatInr } from '../utils/formatters.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { getAlertsApi, addAlertApi, deleteAlertApi } from '../services/api.ts';
import { X, Bell, Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: CryptoCoin[];
}

export const AlertsModal: React.FC<AlertsModalProps> = ({ isOpen, onClose, coins }) => {
  const { user, idToken, signInWithGoogle } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [selectedCoinId, setSelectedCoinId] = useState('bitcoin');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'GREATER_THAN' | 'LESS_THAN'>('GREATER_THAN');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !idToken) return;
    async function loadAlerts() {
      setLoading(true);
      try {
        const list = await getAlertsApi(idToken!);
        setAlerts(list);
      } catch (e) {
        console.error('Error fetching alerts:', e);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, [isOpen, idToken]);

  if (!isOpen) return null;

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken || !targetPrice) return;
    const coin = coins.find((c) => c.id === selectedCoinId);
    if (!coin) return;

    try {
      const added = await addAlertApi(idToken, {
        coinId: coin.id,
        symbol: coin.symbol,
        targetPriceInr: targetPrice,
        condition,
      });
      setAlerts([...alerts, added]);
      setTargetPrice('');
      setStatusMsg('Alert created and synchronized to PostgreSQL.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to create alert');
    }
  };

  const handleDeleteAlert = async (id: number) => {
    if (!idToken) return;
    try {
      await deleteAlertApi(idToken, id);
      setAlerts(alerts.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete alert');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel-glow w-full max-w-xl rounded-3xl border border-white/15 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">INR Price Alerts</h2>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Synchronized across devices via PostgreSQL
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {!user ? (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 text-center space-y-3">
              <ShieldCheck className="w-8 h-8 text-cyan-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Sign In to Set Cloud Price Alerts</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Set custom INR price triggers that notify and persist across all your logged-in devices.
              </p>
              <button
                onClick={signInWithGoogle}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
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

              {/* Add Alert Form */}
              <form onSubmit={handleAddAlert} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <span className="text-xs font-bold text-white block">Create New Price Trigger</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Asset</label>
                    <select
                      value={selectedCoinId}
                      onChange={(e) => setSelectedCoinId(e.target.value)}
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
                    <label className="text-[10px] text-slate-400 block mb-1">Condition</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as any)}
                      className="w-full text-xs bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      <option value="GREATER_THAN">Rises Above (&gt;)</option>
                      <option value="LESS_THAN">Drops Below (&lt;)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Target Price (INR)</label>
                    <input
                      type="number"
                      step="any"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder="e.g. 9500000"
                      className="w-full text-xs bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  Save Alert to Database
                </button>
              </form>

              {/* Alerts List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400">Active Price Alerts:</span>
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No alerts configured yet.</p>
                ) : (
                  <div className="space-y-2">
                    {alerts.map((al) => {
                      const coin = coins.find((c) => c.id === al.coinId);
                      const currentPrice = coin ? coin.currentPriceInr : 0;
                      const target = parseFloat(al.targetPriceInr);
                      const isTriggered =
                        al.condition === 'GREATER_THAN'
                          ? currentPrice >= target
                          : currentPrice <= target;

                      return (
                        <div
                          key={al.id}
                          className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{al.symbol}</span>
                              <span className="text-slate-400">
                                {al.condition === 'GREATER_THAN' ? 'Rises Above' : 'Drops Below'}
                              </span>
                              <span className="font-mono text-cyan-300 font-bold">
                                {formatInr(target)}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Current: {formatInr(currentPrice)}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isTriggered
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {isTriggered ? 'TRIGGERED' : 'ACTIVE'}
                            </span>
                            <button
                              onClick={() => handleDeleteAlert(al.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
