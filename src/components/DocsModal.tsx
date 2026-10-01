import React from 'react';
import { X, BookOpen, Terminal, ShieldCheck, Database, Cpu, GitBranch, Layers, CheckCircle } from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel-glow w-full max-w-4xl rounded-3xl border border-white/15 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">CryptoCore System Documentation</h2>
              <span className="text-[11px] text-cyan-400 font-mono">
                Architecture, Local Run, API Setup & CI/CD Pipeline
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          {/* 1. Project Structure */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              1. Project Architecture & Directory Structure
            </h3>
            <div className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-slate-300 border border-white/5 overflow-x-auto">
              <pre>{`├── server.ts                   # Express server, Gemini 3.8 Flash AI endpoint & CoinGecko/Binance caching
├── src/
│   ├── main.tsx                # Client application root
│   ├── App.tsx                 # Main application state, routing & live market polling
│   ├── index.css               # Tailwind CSS v4 & glassmorphic styling
│   ├── context/
│   │   └── AuthContext.tsx     # Firebase Google authentication & PostgreSQL sync
│   ├── db/
│   │   ├── index.ts            # Drizzle ORM node-postgres connection pool
│   │   ├── schema.ts           # PostgreSQL relational schema (users, wallets, alerts, portfolios, chat)
│   │   └── drizzle.config.ts   # Drizzle Kit admin configuration
│   ├── middleware/
│   │   └── auth.ts             # Firebase Admin ID token verification middleware
│   ├── components/
│   │   ├── Navbar.tsx          # Glassmorphic header with live ticker tape
│   │   ├── LandingHero.tsx     # Split-screen landing page with "ENTER DASHBOARD" CTA
│   │   ├── DashboardHome.tsx   # Central navigation hub with 7 core modules
│   │   ├── IntroductionView.tsx# 13 beginner curriculum guides & interactive key simulator
│   │   ├── HistoryView.tsx     # Evolutionary timeline & 5 asset historical dossiers
│   │   ├── AnalysisView.tsx    # Technical indicators (RSI, SMA, MACD) & fundamentals
│   │   ├── GraphicalAnalysisView.tsx # Multi-timeframe Candlestick, Line & Volume charts
│   │   ├── LiveChartsView.tsx  # Dedicated real-time streaming surveillance
│   │   ├── CurrentPricesView.tsx # 5 core assets INR rate board
│   │   ├── AiAssistantView.tsx # Gemini 3.8 Flash AI crypto assistant
│   │   ├── WalletModal.tsx     # Multi-chain wallet tracker & simulated PnL manager
│   │   ├── AlertsModal.tsx     # Cloud SQL PostgreSQL price alert triggers
│   │   └── DocsModal.tsx       # Full system documentation & technical overview
│   └── services/
│       └── api.ts              # Frontend client API service
└── .github/workflows/deploy.yml# Automated CI/CD pipeline definition`}</pre>
            </div>
          </div>

          {/* 2. Dependencies */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              2. How to Install Dependencies
            </h3>
            <p className="text-slate-400 text-xs">Run the following command in the project directory:</p>
            <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 border border-white/5">
              npm install
            </div>
          </div>

          {/* 3. API Key Configuration */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              3. How to Configure API Keys & Environment Variables
            </h3>
            <p className="text-slate-400 text-xs">
              Create a <code className="text-white bg-slate-900 px-1 py-0.5 rounded">.env</code> file based on <code className="text-white bg-slate-900 px-1 py-0.5 rounded">.env.example</code>:
            </p>
            <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-amber-300 border border-white/5">
              <pre>{`GEMINI_API_KEY="your-gemini-api-key"
SQL_HOST="127.0.0.1"
SQL_DB_NAME="postgres"
SQL_USER="postgres"
SQL_PASSWORD="your-db-password"
SQL_ADMIN_USER="postgres"
SQL_ADMIN_PASSWORD="your-db-password"`}</pre>
            </div>
          </div>

          {/* 4. Running Locally */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              4. How to Run Locally
            </h3>
            <p className="text-slate-400 text-xs">Start the full-stack development server on port 3000:</p>
            <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-cyan-400 border border-white/5">
              npm run dev
            </div>
            <p className="text-slate-400 text-xs mt-1">Open http://localhost:3000 in your browser.</p>
          </div>

          {/* 5. Building Production */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              5. How to Build the Production Version
            </h3>
            <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-purple-300 border border-white/5">
              npm run build
            </div>
            <p className="text-slate-400 text-xs mt-1">
              To test the production build locally: <code className="text-white bg-slate-900 px-1 py-0.5 rounded">npm start</code>
            </p>
          </div>

          {/* 6. Deployment & CI/CD Pipeline */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              6. CI/CD Pipeline & Automated Deployment
            </h3>
            <p className="text-slate-400 text-xs">
              Automated testing and container deployment configured in <code className="text-white bg-slate-900 px-1 py-0.5 rounded">.github/workflows/deploy.yml</code>:
            </p>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Automated TypeScript compilation check (<code className="font-mono">tsc --noEmit</code>)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Unit tests execution for technical indicators and INR formatting</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Continuous containerization and deployment to Google Cloud Run</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
