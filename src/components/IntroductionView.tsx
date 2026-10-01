import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Key,
  Shield,
  Layers,
  Cpu,
  Wallet,
  Coins,
  Scale,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Send,
  HelpCircle,
  Hash,
  Share2,
} from 'lucide-react';

interface IntroductionViewProps {
  onBackToDashboard: () => void;
}

export const IntroductionView: React.FC<IntroductionViewProps> = ({ onBackToDashboard }) => {
  // Interactive Keypair Demo State
  const [demoMessage, setDemoMessage] = useState('Send 0.5 BTC to Alice');
  const [demoPrivateKey, setDemoPrivateKey] = useState('0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d');
  const [demoPublicKey, setDemoPublicKey] = useState('0x04bfcab92216d80c35d1fecbb97f5899b50f73b4...88d2');
  const [isSigned, setIsSigned] = useState(false);
  const [signatureHash, setSignatureHash] = useState('');

  const handleGenerateKeypair = () => {
    const randomHex = () => Math.random().toString(16).substring(2, 10);
    const newPriv = `0x${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}`;
    const newPub = `0x04${randomHex()}${randomHex()}...${randomHex()}`;
    setDemoPrivateKey(newPriv);
    setDemoPublicKey(newPub);
    setIsSigned(false);
    setSignatureHash('');
  };

  const handleSignTransaction = () => {
    const simulatedSig = `SIG_${Math.abs(demoMessage.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16).toUpperCase()}_ECDSA`;
    setSignatureHash(simulatedSig);
    setIsSigned(true);
  };

  const topics = [
    {
      id: 'what-is-crypto',
      title: 'What is Cryptocurrency?',
      icon: <Coins className="w-6 h-6 text-amber-400" />,
      tag: 'Core Concept',
      analogy: 'Digital Cash Without Central Bankers',
      summary:
        'A cryptocurrency is a digital or virtual currency secured by cryptography, making it nearly impossible to counterfeit or double-spend.',
      points: [
        'Purely digital asset maintained across a distributed computer network rather than a central banking server.',
        'Uses cryptographic hashing functions (like SHA-256) to secure ledger integrity.',
        'Enables borderless, peer-to-peer monetary transfers 24 hours a day, 365 days a year without intermediaries.',
      ],
    },
    {
      id: 'what-is-blockchain',
      title: 'What is Blockchain?',
      icon: <Layers className="w-6 h-6 text-cyan-400" />,
      tag: 'Architecture',
      analogy: 'An Append-Only Digital Ledger Shared by Everyone',
      summary:
        'A blockchain is a decentralized, distributed, immutable digital ledger consisting of blocks of transactions cryptographically linked together.',
      points: [
        'Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.',
        'Immutability: Changing any past transaction alters its hash, breaking all subsequent blocks and alerting the entire network.',
        'Consensus mechanisms ensure all participating nodes agree on the true order and history of transactions.',
      ],
    },
    {
      id: 'how-crypto-works',
      title: 'How Cryptocurrency Works',
      icon: <Cpu className="w-6 h-6 text-indigo-400" />,
      tag: 'Mechanism',
      analogy: 'Automated Triple-Entry Bookkeeping',
      summary:
        'Transactions are grouped in memory pools, validated by consensus algorithms, and appended to the blockchain state without human middlemen.',
      points: [
        'User initiates a transfer signed with their private key.',
        'Nodes broadcast the transaction across a peer-to-peer network.',
        'Miners or Validators verify cryptographic signatures and unspent balances.',
        'Once bundled into a block and confirmed, the recipient immediately owns the newly assigned output.',
      ],
    },
    {
      id: 'decentralization',
      title: 'Decentralization',
      icon: <Share2 className="w-6 h-6 text-purple-400" />,
      tag: 'Philosophy',
      analogy: 'No Single Point of Failure or Shutdown',
      summary:
        'Decentralization refers to the transfer of control and decision-making from a centralized entity (bank, corporation, government) to a distributed network.',
      points: [
        'Censorship-resistance: No single authority can freeze an account or veto an honest transaction.',
        'High fault-tolerance: If 30% of global nodes go offline, the remaining network continues running uninterrupted.',
        'Open-source and permissionless: Anyone with an internet connection can run a node or inspect the protocol code.',
      ],
    },
    {
      id: 'crypto-wallets',
      title: 'Cryptocurrency Wallets',
      icon: <Wallet className="w-6 h-6 text-emerald-400" />,
      tag: 'Storage',
      analogy: 'Keychains, Not Literal Coin Containers',
      summary:
        'Wallets do not physically store coins; coins exist solely on the blockchain. A wallet stores the cryptographic keys needed to unlock and spend them.',
      points: [
        'Hot Wallets: Connected to the internet (e.g. MetaMask, Phantom, mobile apps) for quick trading convenience.',
        'Cold Wallets / Hardware Wallets: Air-gapped physical devices (e.g. Ledger, Trezor) immune to online phishing and malware.',
        'Seed Phrase (Recovery Phrase): 12 or 24 human-readable words representing the master private key. If lost, funds are permanently irrecoverable.',
      ],
    },
    {
      id: 'public-private-keys',
      title: 'Public & Private Keys',
      icon: <Key className="w-6 h-6 text-rose-400" />,
      tag: 'Cryptography',
      analogy: 'Public Address = Bank Account Number; Private Key = Password & ATM PIN',
      summary:
        'Asymmetric cryptography uses mathematical pairs: a public key everyone can see, and a private key only you possess.',
      points: [
        'Public Key / Address: Safe to share with anyone who wants to send you crypto.',
        'Private Key: Must NEVER be shared with anyone. Possessing the private key gives absolute, irrevocable spending authority.',
        'Digital Signatures prove ownership of funds without ever exposing the private key to the counterparty.',
      ],
    },
    {
      id: 'transactions-lifecycle',
      title: 'Cryptocurrency Transactions',
      icon: <Send className="w-6 h-6 text-teal-400" />,
      tag: 'Flow',
      analogy: 'The 5-Step Lifecycle from Click to Finality',
      summary:
        'From sender initiation to block inclusion, transactions follow a deterministic cryptographic pathway across the mempool.',
      points: [
        'Step 1 (Creation): Sender specifies recipient address, amount, and max network gas/fee.',
        'Step 2 (Signing): Sender wallet generates ECDSA / Ed25519 digital signature using private key.',
        'Step 3 (Mempool Broadcast): Transaction is relayed across gossip protocol to node memory pools.',
        'Step 4 (Block Packaging): Block producer includes transaction and solves proof or submits stake attestation.',
        'Step 5 (Finality): After sufficient confirmations, the transaction is irreversible.',
      ],
    },
    {
      id: 'mining-pow',
      title: 'Mining & Proof of Work (PoW)',
      icon: <Hash className="w-6 h-6 text-amber-500" />,
      tag: 'Consensus',
      analogy: 'Global Mathematical Puzzle Competition',
      summary:
        'Proof of Work (used by Bitcoin) secures the network through computation: miners expend electrical energy finding a hash below a target difficulty.',
      points: [
        'Miners calculate trillions of SHA-256 hashes per second trying to discover a valid nonce.',
        'The difficulty automatically adjusts every 2,016 blocks to maintain a 10-minute average block time.',
        'Miners receive the block reward (subsidy + transaction fees) as economic incentive to tell the truth.',
        '51% attack resistance: Rewriting history requires controlling more computing power than the rest of the world combined.',
      ],
    },
    {
      id: 'proof-of-stake',
      title: 'Proof of Stake (PoS)',
      icon: <CheckCircle2 className="w-6 h-6 text-green-400" />,
      tag: 'Consensus',
      analogy: 'Capital Collateral Instead of Electricity',
      summary:
        'Proof of Stake (used by Ethereum and Solana) replaces computational mining with bonded economic capital (staking) to achieve consensus.',
      points: [
        'Validators lock up native tokens (e.g. 32 ETH) as security collateral.',
        'Validators are pseudo-randomly selected to propose new blocks and validate peers.',
        'Slashing: Malicious actions (e.g. double-signing) result in automatic burning of staked funds.',
        'Consumes ~99.9% less electrical energy compared to traditional Proof of Work systems.',
      ],
    },
    {
      id: 'exchanges-cex-dex',
      title: 'Exchanges: CEX vs DEX',
      icon: <RefreshCw className="w-6 h-6 text-sky-400" />,
      tag: 'Trading Venues',
      analogy: 'Wall Street Brokerage vs Automated Peer-to-Peer Bazaar',
      summary:
        'Cryptocurrency exchanges allow users to buy, sell, and swap digital assets, categorized into centralized and decentralized architectures.',
      points: [
        'Centralized Exchanges (CEX): e.g. Binance, CoinDCX. User deposits funds into custodial wallets. High liquidity, fiat on-ramps, but user does not hold keys.',
        'Decentralized Exchanges (DEX): e.g. Uniswap, Raydium. Non-custodial automated market makers (AMMs) executed via smart contracts directly from your wallet.',
        'Golden Rule: "Not your keys, not your coins."',
      ],
    },
    {
      id: 'stablecoins',
      title: 'Stablecoins',
      icon: <Scale className="w-6 h-6 text-blue-400" />,
      tag: 'Price Stability',
      analogy: 'Digital Dollars on Blockchain Rails',
      summary:
        'Cryptocurrencies designed to maintain a stable value pegged to an underlying fiat asset (typically 1 USD = 1 Token).',
      points: [
        'Fiat-Collateralized: Backed 1:1 by cash or short-term treasury bills in commercial bank vaults (e.g. Tether USDT, Circle USDC).',
        'Crypto-Collateralized: Backed by over-collateralized crypto assets held in transparent smart contracts (e.g. DAI).',
        'Crucial for liquidity, remittances, decentralized lending, and hedging against market volatility without exiting to fiat banks.',
      ],
    },
    {
      id: 'advantages-risks',
      title: 'Advantages and Risks of Cryptocurrency',
      icon: <AlertTriangle className="w-6 h-6 text-rose-400" />,
      tag: 'Balanced Overview',
      analogy: 'High Freedom, High Personal Responsibility',
      summary:
        'While cryptocurrencies unlock radical financial inclusion and innovation, they introduce unique systemic and personal risks.',
      points: [
        'Advantage: Direct ownership, 24/7 global settlement, financial autonomy, inflation hedge, programmable money.',
        'Advantage: Banking the unbanked across developing economies without discriminatory hurdles.',
        'Risk: High market volatility and rapid drawdowns in asset valuation.',
        'Risk: Total irreversibility—no customer support exists to reverse a misdirected transfer or recover a leaked seed phrase.',
        'Risk: Smart contract bugs, phishing exploits, and regulatory uncertainties across jurisdictions.',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Navigation Header */}
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
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Module 1: Introduction to Cryptocurrency
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                A structured, beginner-friendly curriculum covering foundational blockchain mechanics, cryptography, and protocols.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300">
            12 In-Depth Chapters
          </span>
        </div>
      </div>

      {/* Interactive Keypair Cryptography Laboratory */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              <Key className="w-3.5 h-3.5" /> Interactive Cryptography Lab
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              How Public & Private Keypairs Sign Transactions
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              In cryptocurrency, you never share your private key. Instead, your wallet uses your private key mathematically to create a unique digital signature. Anyone on the network can verify the signature against your public address!
            </p>
          </div>

          <button
            onClick={handleGenerateKeypair}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition shadow-lg shadow-cyan-500/10 cursor-pointer self-start lg:self-center"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Random Keypair</span>
          </button>
        </div>

        {/* Interactive Sandbox */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          {/* Private Key Box */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-rose-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Private Key (Secret)
              </span>
              <span className="text-[10px] text-rose-400/80 bg-rose-500/10 px-2 py-0.5 rounded">Never Reveal</span>
            </div>
            <div className="font-mono text-xs text-slate-300 bg-black/40 p-2.5 rounded-xl border border-white/5 break-all select-all">
              {demoPrivateKey}
            </div>
            <p className="text-[11px] text-slate-400">
              Stored securely on your device. Used to mathematically sign outbound transactions.
            </p>
          </div>

          {/* Public Address Box */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Unlock className="w-3.5 h-3.5" /> Public Key / Address
              </span>
              <span className="text-[10px] text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded">Safe to Share</span>
            </div>
            <div className="font-mono text-xs text-slate-300 bg-black/40 p-2.5 rounded-xl border border-white/5 break-all select-all">
              {demoPublicKey}
            </div>
            <p className="text-[11px] text-slate-400">
              Derived from the private key via elliptic curve math (ECDSA). Others send funds here.
            </p>
          </div>

          {/* Signing Simulator */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/20 space-y-2">
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Transaction Message to Sign
            </span>
            <input
              type="text"
              value={demoMessage}
              onChange={(e) => {
                setDemoMessage(e.target.value);
                setIsSigned(false);
              }}
              className="w-full text-xs bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
              placeholder="e.g. Send 0.5 BTC to Alice"
            />
            <button
              onClick={handleSignTransaction}
              className="w-full py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-90 transition cursor-pointer"
            >
              Sign with Private Key
            </button>
            {isSigned && (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 font-mono flex items-center justify-between">
                <span>Verified: {signatureHash}</span>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proof of Work vs Proof of Stake Comparison Matrix */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Proof of Work (PoW) vs Proof of Stake (PoS) Comparison
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-3 px-4 font-semibold">Dimension</th>
                <th className="py-3 px-4 font-semibold text-amber-400">Proof of Work (PoW)</th>
                <th className="py-3 px-4 font-semibold text-emerald-400">Proof of Stake (PoS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-slate-300">
              <tr>
                <td className="py-3 px-4 font-bold text-white">Primary Representative</td>
                <td className="py-3 px-4 text-amber-300 font-mono">Bitcoin (BTC), Litecoin</td>
                <td className="py-3 px-4 text-emerald-300 font-mono">Ethereum (ETH), Solana (SOL)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Network Security Resource</td>
                <td className="py-3 px-4">Computational power (ASIC hardware & electricity)</td>
                <td className="py-3 px-4">Locked native capital collateral (Staking)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Block Creator Selection</td>
                <td className="py-3 px-4">First miner to find hash meeting difficulty target</td>
                <td className="py-3 px-4">Deterministic pseudo-random algorithm based on stake</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Energy Consumption</td>
                <td className="py-3 px-4 text-rose-400 font-semibold">High (national grid scale)</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">~99.9% Lower than PoW</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Penalties for Dishonesty</td>
                <td className="py-3 px-4">Wasted electricity with zero reward payout</td>
                <td className="py-3 px-4 text-rose-400">Slashing (permanent burning of staked collateral)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive 12 Curriculum Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          <span>Curriculum Modules & Conceptual Breakdowns</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, idx) => (
            <div
              key={topic.id}
              className="glass-panel glass-card-hover p-6 rounded-3xl border border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10">
                    {topic.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 px-2.5 py-1 rounded-full bg-slate-900 border border-white/5">
                    {topic.tag}
                  </span>
                </div>

                <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Chapter {idx + 1}
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">{topic.title}</h3>

                <div className="my-2.5 p-2 rounded-xl bg-slate-950/60 border border-white/5 text-[11px] text-cyan-300 font-medium">
                  💡 <span className="font-semibold text-white">Analogy:</span> {topic.analogy}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {topic.summary}
                </p>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  {topic.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-[11px] text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
