import React, { useState } from 'react';
import { ActiveTab, CryptoCoin } from '../types/crypto.ts';
import { formatInr } from '../utils/formatters.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  BookOpen,
  History,
  TrendingUp,
  BarChart3,
  Activity,
  Coins,
  Bot,
  RefreshCw,
  Wallet,
  Bell,
  HelpCircle,
  Menu,
  X,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  coins: CryptoCoin[];
  isRefreshing: boolean;
  onRefresh: () => void;
  refreshSeconds: number;
  onOpenWallets: () => void;
  onOpenAlerts: () => void;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  coins,
  isRefreshing,
  onRefresh,
  refreshSeconds,
  onOpenWallets,
  onOpenAlerts,
  onOpenDocs,
}) => {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'intro', label: 'Introduction', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'analysis', label: 'Analysis', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'graphs', label: 'Graphs', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'live-charts', label: 'Live Charts', icon: <Activity className="w-4 h-4" /> },
    { id: 'prices', label: 'Prices', icon: <Coins className="w-4 h-4" /> },
    { id: 'assistant', label: 'AI Assistant', icon: <Bot className="w-4 h-4 text-cyan-400" /> },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 backdrop-blur-xl">
      {/* Top Mini Ticker Bar */}
      <div className="bg-slate-950/80 border-b border-white/5 py-1 px-4 text-xs overflow-x-auto no-scrollbar flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            Live INR Ticker
          </div>
          {coins.map((coin) => {
            const isPositive = coin.priceChangePercentage24h >= 0;
            return (
              <button
                key={coin.id}
                onClick={() => setActiveTab('analysis')}
                className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
              >
                <span className="font-semibold text-slate-300">{coin.symbol}:</span>
                <span className="font-mono text-white">{formatInr(coin.currentPriceInr, coin.currentPriceInr > 1000 ? 0 : 2)}</span>
                <span className={`text-[11px] font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? '+' : ''}{coin.priceChangePercentage24h.toFixed(1)}%
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition px-2 py-0.5 rounded bg-white/5 border border-white/10"
            title="Auto-refreshing every 15s"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="font-mono text-[10px] text-slate-400">{refreshSeconds}s</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition" />
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300">
                    CRYPTOCORE
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    INR PRO
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Intelligence & Education
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 shadow-inner">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Action Tools & Auth */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onOpenWallets}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-white/10 transition cursor-pointer"
              title="Track Wallets & Holdings in Postgres"
            >
              <Wallet className="w-3.5 h-3.5 text-indigo-400" />
              <span>Wallet</span>
            </button>

            <button
              onClick={onOpenAlerts}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-white/10 transition cursor-pointer"
              title="Price Alerts in Postgres"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Alerts</span>
            </button>

            <button
              onClick={onOpenDocs}
              className="p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-white/10 transition cursor-pointer"
              title="System Documentation & Architecture"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Auth Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-full border border-emerald-400/50" />
                  ) : (
                    <User className="w-4 h-4 text-emerald-400" />
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-semibold text-white leading-tight max-w-[90px] truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" /> Synced
                    </span>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition rounded-lg hover:bg-rose-500/10 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-white rounded-xl shadow-md shadow-cyan-500/20 transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950/95 px-4 pt-3 pb-6 space-y-2">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-white/10">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === item.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onOpenWallets();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-slate-300"
              >
                <Wallet className="w-4 h-4 text-indigo-400" /> Wallet
              </button>
              <button
                onClick={() => {
                  onOpenAlerts();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-slate-300"
              >
                <Bell className="w-4 h-4 text-amber-400" /> Alerts
              </button>
              <button
                onClick={() => {
                  onOpenDocs();
                  setMobileMenuOpen(false);
                }}
                className="p-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-slate-300"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {user ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-white">{user.email}</span>
                </div>
                <button onClick={signOut} className="text-xs text-rose-400 hover:underline">
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 rounded-xl"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
