# CryptoCore - Cryptocurrency Education & Live Market Analysis

A modern, professional **Cryptocurrency Education & Live Market Analysis Platform** featuring a premium fintech interface with glassmorphic glow styling, real-time Indian Rupee (INR) market data, interactive multi-timeframe candlestick and line charts, historical milestones, technical indicator algorithms, an objective AI crypto assistant, and secure multi-device PostgreSQL data synchronization.

---

## Key Highlights

- **1. Split-Screen Landing Page**:
  - Left hero section showcasing **CRYPTOCORE**, core blockchain principles, dynamic metrics, and live 5-asset ticker preview.
  - Right glassmorphic portal with **ENTER DASHBOARD** CTA featuring smooth transitions into the main hub.

- **2. Main Dashboard (Central Hub)**:
  - Frosted glass cards with soft glowing borders and responsive fintech layout.
  - One-click navigation to all 7 separate analytical & educational modules.

- **3. Five Major Cryptocurrencies**:
  - Continuous live INR data feeds for **Bitcoin (BTC)**, **Ethereum (ETH)**, **Tether (USDT)**, **BNB (BNB)**, and **Solana (SOL)**.
  - ₹ Current Price, 24h & 7d % change, Market Cap, 24h Volume, 24h High/Low, Circulating Supply, ATH/ATL.

- **4. Introduction to Cryptocurrency (12 Chapters + Lab)**:
  - Complete curriculum: Blockchain architecture, decentralization, hot vs. cold wallets, seed phrases, mining, Proof of Work vs. Proof of Stake comparison matrix, CEX vs. DEX, stablecoins, benefits and risks.
  - **Interactive Public & Private Key Cryptography Lab**: Live cryptographic signing and verification simulator.

- **5. History of Cryptocurrency**:
  - Comprehensive timeline from the 1982 Cypherpunk roots to 2026+ Spot ETFs.
  - Individual historical dossiers for Bitcoin, Ethereum, Tether, BNB, and Solana detailing launch year, creators, original vision, and current ecosystem role.

- **6. Quantitative Cryptocurrency Analysis**:
  - Live market data cleanly distinguished from calculated technical indicators.
  - Computes 14-period RSI, SMA 20, SMA 50, MACD (line, signal, histogram), Bollinger Bands, Key Support/Resistance levels, and Volatility index.

- **7. Interactive Graphical Analysis**:
  - Multi-view visualizer: **Candlestick (OHLCV)**, **Line Chart**, **Volume Bars**, and **Percentage-Change normalized chart**.
  - 6 selectable timeframes: **1H**, **24H**, **7D**, **30D**, **3M**, and **1Y**.
  - Interactive crosshairs and real-time hover tooltips.

- **8. Live Crypto Surveillance**:
  - Dedicated real-time streaming board with automated 15-second heartbeat refresh countdown, depth indicators, and fallback handling ("Live market data temporarily unavailable.").

- **9. Current Prices Dashboard**:
  - Dedicated cards for all 5 benchmark assets displaying clean INR values, 24h volume, and 7-day sparklines.

- **10. AI Crypto Assistant (Gemini 3.8 Flash)**:
  - Intelligent chatbot grounded with live INR order flows.
  - Handles educational, technical, and comparison questions.
  - Balanced multi-perspective analysis on investment queries with explicit non-financial-advice disclaimers.

- **11. Relational Cloud SQL PostgreSQL & Firebase Authentication**:
  - Drizzle ORM schema storing users, multi-chain tracked wallets, custom portfolio positions with live PnL calculations, cross-device INR price alerts, and chat history.

---

## 1. Project Structure

```
├── server.ts                       # Express full-stack entry point & Gemini API proxy
├── src/
│   ├── main.tsx                    # React client entry point
│   ├── App.tsx                     # Core application orchestrator & routing
│   ├── index.css                   # Tailwind CSS v4 & custom glassmorphism styles
│   ├── context/
│   │   └── AuthContext.tsx         # Firebase client auth provider
│   ├── db/
│   │   ├── index.ts                # Drizzle ORM node-postgres connection pool
│   │   ├── schema.ts               # PostgreSQL database schema definitions
│   │   └── drizzle.config.ts       # Drizzle Kit admin configuration
│   ├── middleware/
│   │   └── auth.ts                 # Firebase Admin token verification middleware
│   ├── components/
│   │   ├── Navbar.tsx              # Top navigation bar with live ticker
│   │   ├── LandingHero.tsx         # Split-screen landing page
│   │   ├── DashboardHome.tsx       # Central navigation hub with 7 modules
│   │   ├── IntroductionView.tsx    # 13 beginner curriculum guides & crypto lab
│   │   ├── HistoryView.tsx         # Historical timeline & 5 asset dossiers
│   │   ├── AnalysisView.tsx        # Technical indicators & fundamental metrics
│   │   ├── GraphicalAnalysisView.tsx # Interactive multi-view charts
│   │   ├── LiveChartsView.tsx      # Real-time surveillance & refresh feed
│   │   ├── CurrentPricesView.tsx   # 5 core assets INR rate board
│   │   ├── AiAssistantView.tsx     # Gemini AI market assistant
│   │   ├── WalletModal.tsx         # Multi-chain wallet & portfolio manager
│   │   ├── AlertsModal.tsx         # PostgreSQL price alert system
│   │   └── DocsModal.tsx           # In-app system documentation modal
│   ├── services/
│   │   └── api.ts                  # Client API communication
│   ├── types/
│   │   └── crypto.ts               # TypeScript data models
│   └── utils/
│       ├── formatters.ts           # Indian Rupee (INR) and date formatters
│       └── cryptoCalculations.test.ts # Unit test suite
├── .github/workflows/deploy.yml    # Automated CI/CD pipeline
├── package.json
└── vite.config.ts
```

---

## 2. How to Install Dependencies

Make sure you have Node.js (version 20 or higher) installed:

```bash
npm install
```

---

## 3. How to Configure API Keys & Environment Variables

Copy the example environment configuration:

```bash
cp .env.example .env
```

Ensure the following variables are configured:

```env
# Gemini API Key for AI Assistant
GEMINI_API_KEY="your-gemini-api-key"

# Cloud SQL PostgreSQL Connection Details
SQL_HOST="127.0.0.1"
SQL_DB_NAME="postgres"
SQL_USER="postgres"
SQL_PASSWORD="your-secure-password"
SQL_ADMIN_USER="postgres"
SQL_ADMIN_PASSWORD="your-secure-password"
```

---

## 4. How to Run Locally

Start the full-stack server (Express backend + Vite frontend):

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 5. How to Build the Production Version

To create the optimized production build:

```bash
npm run build
```

The compiled static assets will be output to `/dist`.

To run the production server locally:

```bash
npm start
```

---

## 6. How to Deploy the Website

### Google Cloud Run Deployment
The application is pre-configured with container-ready Express server (`server.ts`):
1. Build the Docker container.
2. Deploy to Google Cloud Run with port 3000 mapped.
3. Link your Cloud SQL instance via the Cloud SQL Auth Proxy socket.

### Continuous Integration & Deployment (CI/CD)
The `.github/workflows/deploy.yml` pipeline triggers automatically on any commit or pull request to `main`:
1. Installs clean dependencies (`npm ci`).
2. Runs TypeScript typechecking (`tsc --noEmit`).
3. Executes financial calculation tests.
4. Generates production build.

---

## License
MIT License. Built for cryptocurrency education, research, and technical market analysis.
