import { CryptoCoin, ChartDataResponse, TrackedWallet, PriceAlert, PortfolioHolding, ChatMessage } from '../types/crypto.ts';

export async function fetchCryptoPrices(): Promise<{ success: boolean; data: CryptoCoin[]; lastUpdated: string }> {
  const res = await fetch('/api/crypto/prices');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Live market data temporarily unavailable.');
  }
  return await res.json();
}

export async function fetchChartData(coinId: string, days = '7'): Promise<ChartDataResponse> {
  const res = await fetch(`/api/crypto/chart/${coinId}?days=${days}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Live market data temporarily unavailable.');
  }
  return await res.json();
}

export async function sendGeminiPrompt(prompt: string, history: ChatMessage[] = []): Promise<string> {
  const res = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'AI Assistant unavailable.');
  }
  const data = await res.json();
  return data.reply;
}

// User-Authenticated Database APIs
export async function getWalletsApi(token: string): Promise<TrackedWallet[]> {
  const res = await fetch('/api/user/wallets', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch wallets');
  return await res.json();
}

export async function addWalletApi(token: string, payload: { walletAddress: string; chain: string; label: string; notes?: string }): Promise<TrackedWallet> {
  const res = await fetch('/api/user/wallets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save wallet');
  return await res.json();
}

export async function deleteWalletApi(token: string, id: number): Promise<void> {
  const res = await fetch(`/api/user/wallets/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete wallet');
}

export async function getAlertsApi(token: string): Promise<PriceAlert[]> {
  const res = await fetch('/api/user/alerts', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return await res.json();
}

export async function addAlertApi(token: string, payload: { coinId: string; symbol: string; targetPriceInr: string; condition: string }): Promise<PriceAlert> {
  const res = await fetch('/api/user/alerts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save alert');
  return await res.json();
}

export async function deleteAlertApi(token: string, id: number): Promise<void> {
  const res = await fetch(`/api/user/alerts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete alert');
}

export async function getPortfolioApi(token: string): Promise<PortfolioHolding[]> {
  const res = await fetch('/api/user/portfolio', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch portfolio');
  return await res.json();
}

export async function addPortfolioApi(token: string, payload: { coinId: string; symbol: string; name: string; amount: string; buyPriceInr: string; buyDate?: string }): Promise<PortfolioHolding> {
  const res = await fetch('/api/user/portfolio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save portfolio holding');
  return await res.json();
}

export async function deletePortfolioApi(token: string, id: number): Promise<void> {
  const res = await fetch(`/api/user/portfolio/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete portfolio holding');
}

export async function getChatHistoryApi(token: string): Promise<ChatMessage[]> {
  const res = await fetch('/api/user/chat-history', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch chat history');
  return await res.json();
}

export async function saveChatMessageApi(token: string, role: string, content: string): Promise<void> {
  await fetch('/api/user/chat-history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role, content, timestamp: new Date().toISOString() }),
  });
}

export async function clearChatHistoryApi(token: string): Promise<void> {
  await fetch('/api/user/chat-history', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
