import { db } from './index.ts';
import { users, userPreferences, trackedWallets, priceAlerts, userPortfolios, chatMessages } from './schema.ts';
import { eq, and, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string, photoUrl?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      const updated = await db.update(users)
        .set({
          email,
          displayName: displayName || existing[0].displayName,
          photoUrl: photoUrl || existing[0].photoUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.uid, uid))
        .returning();
      return updated[0];
    }

    const inserted = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        photoUrl: photoUrl || null,
      })
      .returning();

    // Also initialize default preferences
    await db.insert(userPreferences)
      .values({
        userUid: uid,
        currency: 'INR',
        refreshInterval: '15',
        favoriteCoins: JSON.stringify(['bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana']),
      })
      .onConflictDoNothing();

    return inserted[0];
  } catch (error) {
    console.error('Failed to get or create user:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getUserPreferences(userUid: string) {
  try {
    const prefs = await db.select().from(userPreferences).where(eq(userPreferences.userUid, userUid));
    if (prefs.length === 0) {
      const inserted = await db.insert(userPreferences)
        .values({
          userUid,
          currency: 'INR',
          refreshInterval: '15',
          favoriteCoins: JSON.stringify(['bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana']),
        })
        .returning();
      return inserted[0];
    }
    return prefs[0];
  } catch (error) {
    console.error('Failed to get user preferences:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function updateUserPreferences(userUid: string, currency?: string, refreshInterval?: string, favoriteCoins?: string[]) {
  try {
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (currency) updateData.currency = currency;
    if (refreshInterval) updateData.refreshInterval = refreshInterval;
    if (favoriteCoins) updateData.favoriteCoins = JSON.stringify(favoriteCoins);

    const updated = await db.update(userPreferences)
      .set(updateData)
      .where(eq(userPreferences.userUid, userUid))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Failed to update user preferences:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getTrackedWallets(userUid: string) {
  try {
    return await db.select().from(trackedWallets).where(eq(trackedWallets.userUid, userUid));
  } catch (error) {
    console.error('Failed to get tracked wallets:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function addTrackedWallet(userUid: string, walletAddress: string, chain: string, label: string, notes?: string) {
  try {
    const inserted = await db.insert(trackedWallets)
      .values({
        userUid,
        walletAddress,
        chain,
        label,
        notes: notes || null,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to add tracked wallet:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function deleteTrackedWallet(userUid: string, walletId: number) {
  try {
    return await db.delete(trackedWallets)
      .where(and(eq(trackedWallets.id, walletId), eq(trackedWallets.userUid, userUid)))
      .returning();
  } catch (error) {
    console.error('Failed to delete tracked wallet:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getPriceAlerts(userUid: string) {
  try {
    return await db.select().from(priceAlerts).where(eq(priceAlerts.userUid, userUid));
  } catch (error) {
    console.error('Failed to get price alerts:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function addPriceAlert(userUid: string, coinId: string, symbol: string, targetPriceInr: string, condition: string) {
  try {
    const inserted = await db.insert(priceAlerts)
      .values({
        userUid,
        coinId,
        symbol,
        targetPriceInr,
        condition,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to add price alert:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function deletePriceAlert(userUid: string, alertId: number) {
  try {
    return await db.delete(priceAlerts)
      .where(and(eq(priceAlerts.id, alertId), eq(priceAlerts.userUid, userUid)))
      .returning();
  } catch (error) {
    console.error('Failed to delete price alert:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getUserPortfolios(userUid: string) {
  try {
    return await db.select().from(userPortfolios).where(eq(userPortfolios.userUid, userUid));
  } catch (error) {
    console.error('Failed to get user portfolios:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function addPortfolioItem(userUid: string, coinId: string, symbol: string, name: string, amount: string, buyPriceInr: string, buyDate: string) {
  try {
    const inserted = await db.insert(userPortfolios)
      .values({
        userUid,
        coinId,
        symbol,
        name,
        amount,
        buyPriceInr,
        buyDate,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to add portfolio item:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function deletePortfolioItem(userUid: string, portfolioId: number) {
  try {
    return await db.delete(userPortfolios)
      .where(and(eq(userPortfolios.id, portfolioId), eq(userPortfolios.userUid, userUid)))
      .returning();
  } catch (error) {
    console.error('Failed to delete portfolio item:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function getChatMessages(userUid: string) {
  try {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.userUid, userUid))
      .orderBy(chatMessages.createdAt);
  } catch (error) {
    console.error('Failed to get chat messages:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function saveChatMessage(userUid: string, role: string, content: string, timestamp: string) {
  try {
    const inserted = await db.insert(chatMessages)
      .values({
        userUid,
        role,
        content,
        timestamp,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to save chat message:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}

export async function clearChatMessages(userUid: string) {
  try {
    return await db.delete(chatMessages).where(eq(chatMessages.userUid, userUid));
  } catch (error) {
    console.error('Failed to clear chat messages:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}
