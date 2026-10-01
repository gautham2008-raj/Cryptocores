import React, { useState } from 'react';
import {
  ArrowLeft,
  History,
  Calendar,
  Layers,
  Award,
  Shield,
  Zap,
  CheckCircle,
  ExternalLink,
  Milestone,
} from 'lucide-react';

interface HistoryViewProps {
  onBackToDashboard: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onBackToDashboard }) => {
  const [selectedTimelineCategory, setSelectedTimelineCategory] = useState<'ALL' | 'EARLY' | 'EXPANSION' | 'INSTITUTIONAL'>('ALL');

  const timelineEvents = [
    {
      year: '1982 - 1998',
      title: 'Cypherpunks & Digital Cash Precursors',
      category: 'EARLY',
      description:
        'David Chaum conceives DigiCash (blind signatures). Wei Dai proposes B-Money (decentralized consensus and contracts), and Nick Szabo designs Bit Gold, introducing proof-of-work concepts that inspired Bitcoin.',
      impact: 'Pioneered cryptographic foundations of digital cash without central authorities.',
    },
    {
      year: '2008',
      title: 'Satoshi Nakamoto & The Bitcoin Whitepaper',
      category: 'EARLY',
      description:
        'On October 31, 2008, Satoshi Nakamoto publishes "Bitcoin: A Peer-to-Peer Electronic Cash System" to the Cryptography Mailing List during the global subprime mortgage financial crisis.',
      impact: 'Solved the fundamental Byzantine Generals and Double-Spending problems via Proof of Work.',
    },
    {
      year: '2009',
      title: 'Genesis Block & First Transfer',
      category: 'EARLY',
      description:
        'On January 3, 2009, Satoshi mines Block 0 embedding the headline: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks". Days later, Satoshi sends 10 BTC to Hal Finney in the first transaction.',
      impact: 'The first successful decentralized monetary network begins continuous uptime.',
    },
    {
      year: '2010',
      title: 'Bitcoin Pizza Day & Market Pricing',
      category: 'EARLY',
      description:
        'Laszlo Hanyecz pays 10,000 BTC for two Papa John pizzas on May 22, 2010, marking the first known commercial real-world transaction for Bitcoin (establishing a ~$0.0041/BTC value).',
      impact: 'Transitioned cryptocurrency from academic experiment to economic medium of exchange.',
    },
    {
      year: '2014',
      title: 'Emergence of Fiat Stablecoins (Tether)',
      category: 'EXPANSION',
      description:
        'Realcoin (rebranded as Tether USDT) is launched on the Omni Layer protocol, offering digital dollar tokens backed 1:1 by reserve assets, providing traders an escape from high volatility without exiting to fiat banks.',
      impact: 'Created the backbone of decentralized liquidity and global borderless dollar rails.',
    },
    {
      year: '2015',
      title: 'Ethereum & Turing-Complete Smart Contracts',
      category: 'EXPANSION',
      description:
        'Vitalik Buterin and co-founders launch the Ethereum frontier network, enabling developers to write arbitrary logic, decentralized applications (dApps), and programmable tokens (ERC-20 standard).',
      impact: 'Expanded blockchain from simple currency into a global decentralized virtual computer (EVM).',
    },
    {
      year: '2017',
      title: 'The ICO Boom & BNB Launch',
      category: 'EXPANSION',
      description:
        'Binance introduces Build and Build (BNB) token to reduce exchange trading fees. Initial Coin Offerings (ICOs) raise billions, propelling cryptocurrency into retail and mainstream financial media consciousness.',
      impact: 'Demonstrated utility tokens and rapid exchange ecosystem expansion.',
    },
    {
      year: '2020',
      title: 'DeFi Summer & Solana High-Throughput L1',
      category: 'EXPANSION',
      description:
        'Automated liquidity pools (Uniswap, Compound, Aave) inaugurate "DeFi Summer". Simultaneously, Anatoly Yakovenko launches Solana introducing Proof of History (PoH) with sub-second block finality and 50,000+ TPS.',
      impact: 'Established decentralized lending, automated swaps, and ultra-high-speed layer-1 blockchains.',
    },
    {
      year: '2021 - 2022',
      title: 'NFT Wave & The Ethereum Merge',
      category: 'EXPANSION',
      description:
        'Non-Fungible Tokens (NFTs) introduce digital provenance to art and gaming. In September 2022, Ethereum successfully completes "The Merge", transitioning seamlessly from Proof of Work to Proof of Stake and reducing energy usage by 99.95%.',
      impact: 'Proved major live architectural upgrades are possible without downtime; ESG compliant.',
    },
    {
      year: '2024 - 2026',
      title: 'Spot ETFs & Institutional Mainstream Adoption',
      category: 'INSTITUTIONAL',
      description:
        'Global regulators (including the US SEC) approve historic Spot Bitcoin and Spot Ethereum Exchange-Traded Funds (ETFs), allowing trillions in sovereign wealth, pension funds, and institutional capital to enter crypto.',
      impact: 'Cryptocurrency cements its status as a recognized macro asset class alongside gold and equities.',
    },
  ];

  const cryptoDeepDives = [
    {
      coin: 'Bitcoin (BTC)',
      symbol: 'BTC',
      launchYear: '2009',
      creator: 'Satoshi Nakamoto (Anonymous Pseudonym)',
      originalPurpose:
        'A purely peer-to-peer version of electronic cash that allows online payments to be sent directly from one party to another without going through a financial institution.',
      majorDevelopments: [
        '2010: First real-world commercial transaction (10,000 BTC for 2 pizzas).',
        '2017: Segregated Witness (SegWit) activated, enabling Lightning Network layer-2 microtransactions.',
        '2021: Taproot upgrade introduced Schnorr signatures for enhanced privacy and smart contract efficiency.',
        '2024: Historic approval of 11 US Spot Bitcoin ETFs with record inflows.',
      ],
      currentRole:
        'Known globally as "Digital Gold" and the ultimate decentralized store of value. It anchors the entire cryptocurrency market cap with an immutable 21 million supply limit.',
      borderAccent: 'border-amber-500/40',
      tagColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    },
    {
      coin: 'Ethereum (ETH)',
      symbol: 'ETH',
      launchYear: '2015',
      creator: 'Vitalik Buterin, Gavin Wood, Charles Hoskinson & co-founders',
      originalPurpose:
        'A general-purpose decentralized world computer executing Turing-complete code (smart contracts) without downtime, censorship, fraud, or third-party interference.',
      majorDevelopments: [
        '2015: Frontier Genesis release of Ethereum Virtual Machine (EVM).',
        '2017: ERC-20 and ERC-721 token standards pioneered modern tokens and NFTs.',
        '2021: EIP-1559 base fee burning mechanism introduced deflationary tokenomics.',
        '2022: The Merge transition to Proof of Stake consensus.',
        '2024: Dencun upgrade with EIP-4844 Proto-Danksharding drastically slashing Layer-2 gas fees.',
      ],
      currentRole:
        'The settlement and liquidity foundation for the decentralized economy, hosting the majority of Total Value Locked (TVL) in DeFi, stablecoins, and Layer-2 rollups (Arbitrum, Optimism, Base).',
      borderAccent: 'border-indigo-500/40',
      tagColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    },
    {
      coin: 'Tether (USDT)',
      symbol: 'USDT',
      launchYear: '2014',
      creator: 'Brock Pierce, Reeve Collins, Craig Sellars (Tether Limited)',
      originalPurpose:
        'To facilitate the use of fiat currencies in a digital manner without the price volatility and complexity typically associated with a digital token.',
      majorDevelopments: [
        '2014: Launched as Realcoin on the Bitcoin blockchain via the Omni protocol.',
        '2018: Multichain expansion to Ethereum (ERC-20), Tron (TRC-20), and Solana.',
        '2021-2024: Reached over $140 Billion market capitalization, backed predominantly by US Treasury Bills, generating billions in operational profit.',
      ],
      currentRole:
        'The undisputed liquidity engine of the global crypto market. USDT accounts for the lion’s share of daily spot volume, international cross-border trade, and hedge reserves against currency devaluation.',
      borderAccent: 'border-emerald-500/40',
      tagColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    },
    {
      coin: 'BNB (BNB)',
      symbol: 'BNB',
      launchYear: '2017',
      creator: 'Changpeng Zhao (CZ) & Binance Holdings',
      originalPurpose:
        'Initially an ERC-20 utility token offering fee discounts on the Binance exchange platform, with a commitment to use exchange profits to burn tokens quarterly.',
      majorDevelopments: [
        '2017: Launched via public ICO raising $15M.',
        '2019: Migrated to Binance Chain native blockchain.',
        '2020: Launch of Binance Smart Chain (now BNB Chain), providing EVM-compatible ultra-cheap transactions.',
        '2022: Introduction of BNB Auto-Burn formula based on block production and BNB price.',
      ],
      currentRole:
        'Powers the high-throughput BNB Chain ecosystem, serves as the primary governance/gas token for decentralized protocols, and provides VIP benefits across the largest crypto trading platform.',
      borderAccent: 'border-yellow-500/40',
      tagColor: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    },
    {
      coin: 'Solana (SOL)',
      symbol: 'SOL',
      launchYear: '2020',
      creator: 'Anatoly Yakovenko, Greg Fitzgerald, Raj Gokal (Solana Labs)',
      originalPurpose:
        'To build a web-scale blockchain capable of hosting modern financial markets and consumer apps without relying on complex sharding or Layer-2 rollups.',
      majorDevelopments: [
        '2017-2018: Whitepaper invented Proof of History (PoH), an encoded verifiable delay function establishing chronological order before consensus.',
        '2020: Mainnet Beta launch achieving 400ms block times and sub-cent fees.',
        '2023-2024: Firedancer high-performance independent validator client developed by Jump Crypto, demonstrating enterprise-grade resilience.',
      ],
      currentRole:
        'The leading high-speed monolithic Layer-1 blockchain for high-frequency trading, decentralized physical infrastructure networks (DePIN), memecoins, and consumer payments (Solana Pay).',
      borderAccent: 'border-purple-500/40',
      tagColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    },
  ];

  const filteredEvents = timelineEvents.filter((ev) => {
    if (selectedTimelineCategory === 'ALL') return true;
    return ev.category === selectedTimelineCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Module 2: History of Cryptocurrency
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                From early cypherpunk cryptography to modern institutional spot ETFs: tracing the revolution of decentralized value.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300">
            1982 — 2026+ Era
          </span>
        </div>
      </div>

      {/* 5 Individual History Cards for Core Cryptocurrencies */}
      <div className="space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 mb-2">
            <Award className="w-3.5 h-3.5" /> Selected Major Assets
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Individual Cryptocurrency Historical Dossiers
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Examine the inception, founding vision, major protocol milestones, and current role of our five core tracked assets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cryptoDeepDives.map((crypto, index) => (
            <div
              key={crypto.symbol}
              className={`glass-panel p-6 rounded-3xl border ${crypto.borderAccent} space-y-4 flex flex-col justify-between ${
                index === 4 ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-sm text-white">
                      {crypto.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{crypto.coin}</h3>
                      <div className="text-[11px] text-slate-400">Launch Year: {crypto.launchYear}</div>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${crypto.tagColor}`}>
                    {crypto.launchYear} Pioneer
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Creator / Founding Organization
                  </div>
                  <div className="text-xs font-bold text-slate-200">{crypto.creator}</div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Original Purpose & Design
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/5">
                    {crypto.originalPurpose}
                  </p>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Key Historical Milestones
                  </div>
                  <div className="space-y-1.5">
                    {crypto.majorDevelopments.map((dev, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2 text-[11px] text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{dev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                  Current Role in the Crypto Ecosystem
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {crypto.currentRole}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evolutionary Timeline Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Milestone className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Cryptocurrency Development Timeline
              </h2>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Filter milestones by technological and economic epoch.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/10 self-start sm:self-center">
            {(['ALL', 'EARLY', 'EXPANSION', 'INSTITUTIONAL'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedTimelineCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedTimelineCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Items */}
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-indigo-500 before:to-purple-600">
          {filteredEvents.map((ev, idx) => (
            <div key={idx} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[27px] sm:-left-[35px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400 group-hover:border-white group-hover:scale-125 transition duration-200" />

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/5 group-hover:border-cyan-500/30 transition space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    {ev.year}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    {ev.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{ev.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>

                <div className="pt-2 text-[11px] text-indigo-300 font-medium flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Impact: {ev.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
