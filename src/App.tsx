import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, CryptoCoin } from './types/crypto.ts';
import { AuthProvider } from './context/AuthContext.tsx';
import { fetchCryptoPrices } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { LandingHero } from './components/LandingHero.tsx';
import { DashboardHome } from './components/DashboardHome.tsx';
import { IntroductionView } from './components/IntroductionView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { AnalysisView } from './components/AnalysisView.tsx';
import { GraphicalAnalysisView } from './components/GraphicalAnalysisView.tsx';
import { LiveChartsView } from './components/LiveChartsView.tsx';
import { CurrentPricesView } from './components/CurrentPricesView.tsx';
import { AiAssistantView } from './components/AiAssistantView.tsx';
import { WalletModal } from './components/WalletModal.tsx';
import { AlertsModal } from './components/AlertsModal.tsx';
import { DocsModal } from './components/DocsModal.tsx';
import { ShieldCheck, Heart, Terminal } from 'lucide-react';

const REFRESH_INTERVAL_SECONDS = 15;

function MainApp() {
  const [hasEnteredDashboard, setHasEnteredDashboard] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedCoinId, setSelectedCoinId] = useState<string>('bitcoin');

  const [coins, setCoins] = useState<CryptoCoin[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSeconds, setRefreshSeconds] = useState(REFRESH_INTERVAL_SECONDS);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);

  // Fetch prices function
  const loadPrices = useCallback(async () => {
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const response = await fetchCryptoPrices();
      if (response && Array.isArray(response.data) && response.data.length > 0) {
        setCoins(response.data);
        setLastUpdated(response.lastUpdated || new Date().toISOString());
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Live market data temporarily unavailable.');
    } finally {
      setIsRefreshing(false);
      setRefreshSeconds(REFRESH_INTERVAL_SECONDS);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  // 15-second countdown timer for auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshSeconds((prev) => {
        if (prev <= 1) {
          loadPrices();
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadPrices]);

  const handleSelectCoinForAnalysis = (coinId: string) => {
    setSelectedCoinId(coinId);
    setActiveTab('analysis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToGraphs = (coinId: string) => {
    setSelectedCoinId(coinId);
    setActiveTab('graphs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Top Glassmorphic Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setHasEnteredDashboard(true);
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        coins={coins}
        isRefreshing={isRefreshing}
        onRefresh={loadPrices}
        refreshSeconds={refreshSeconds}
        onOpenWallets={() => setWalletModalOpen(true)}
        onOpenAlerts={() => setAlertsModalOpen(true)}
        onOpenDocs={() => setDocsModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {!hasEnteredDashboard ? (
          <LandingHero
            onEnterDashboard={() => {
              setHasEnteredDashboard(true);
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            coins={coins}
          />
        ) : (
          <div className="animate-fade-in transition-opacity duration-300">
            {activeTab === 'dashboard' && (
              <DashboardHome
                coins={coins}
                setActiveTab={setActiveTab}
                onSelectCoinForAnalysis={handleSelectCoinForAnalysis}
                onOpenWallets={() => setWalletModalOpen(true)}
                onOpenAlerts={() => setAlertsModalOpen(true)}
              />
            )}

            {activeTab === 'intro' && (
              <IntroductionView onBackToDashboard={() => setActiveTab('dashboard')} />
            )}

            {activeTab === 'history' && (
              <HistoryView onBackToDashboard={() => setActiveTab('dashboard')} />
            )}

            {activeTab === 'analysis' && (
              <AnalysisView
                coins={coins}
                selectedCoinId={selectedCoinId}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onNavigateToGraphs={handleNavigateToGraphs}
              />
            )}

            {activeTab === 'graphs' && (
              <GraphicalAnalysisView
                coins={coins}
                initialCoinId={selectedCoinId}
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'live-charts' && (
              <LiveChartsView
                coins={coins}
                isRefreshing={isRefreshing}
                onRefresh={loadPrices}
                refreshSeconds={refreshSeconds}
                lastUpdated={lastUpdated}
                errorMessage={errorMessage}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onSelectCoinForAnalysis={handleSelectCoinForAnalysis}
              />
            )}

            {activeTab === 'prices' && (
              <CurrentPricesView
                coins={coins}
                isRefreshing={isRefreshing}
                onRefresh={loadPrices}
                refreshSeconds={refreshSeconds}
                lastUpdated={lastUpdated}
                errorMessage={errorMessage}
                onBackToDashboard={() => setActiveTab('dashboard')}
                onSelectCoinForAnalysis={handleSelectCoinForAnalysis}
              />
            )}

            {activeTab === 'assistant' && (
              <AiAssistantView coins={coins} onBackToDashboard={() => setActiveTab('dashboard')} />
            )}
          </div>
        )}
      </main>

      {/* Persistent Modals */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        coins={coins}
      />

      <AlertsModal
        isOpen={alertsModalOpen}
        onClose={() => setAlertsModalOpen(false)}
        coins={coins}
      />

      <DocsModal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
      />

      {/* Professional Fintech Footer */}
      <footer className="border-t border-white/10 bg-slate-950/90 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">
              CRYPTOCORE
            </span>
            <span>• Cryptocurrency Intelligence & Education</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setDocsModalOpen(true)} className="hover:text-cyan-300 transition">
              System Documentation
            </button>
            <button onClick={() => setWalletModalOpen(true)} className="hover:text-cyan-300 transition">
              PostgreSQL Wallets
            </button>
            <button onClick={() => setAlertsModalOpen(true)} className="hover:text-cyan-300 transition">
              Price Alerts
            </button>
          </div>

          <div className="text-[11px] text-slate-400 text-center md:text-right">
            <span>Prices in Indian Rupees (INR) • Informational only, not financial advice.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
