import { VoiceRoom, DailyTask, LuckyGiftResult } from '../types';
import apiClient, { TOKEN_STORAGE_KEY } from './apiClient';

export { apiClient, TOKEN_STORAGE_KEY };

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem('token');
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem('token');
}

export const api = {
  // 1. Authentication
  auth: {
    async register(username: string, email: string, password: string) {
      const response = await apiClient.post<{ message: string; token: string; user: any }>('/auth/register', {
        username,
        email,
        password,
      });
      const data = response.data;
      if (data.token) {
        setStoredToken(data.token);
      }
      return data;
    },

    async login(identifier: string, password: string) {
      const payload: any = { password };
      if (identifier.includes('@')) {
        payload.email = identifier;
      } else {
        payload.username = identifier;
      }

      const response = await apiClient.post<{ message: string; token: string; user: any }>('/auth/login', payload);
      const data = response.data;
      if (data.token) {
        setStoredToken(data.token);
      }
      return data;
    },

    async getMe() {
      const response = await apiClient.get<{ user: any }>('/auth/me');
      return response.data;
    },

    async googleLogin(credential: string) {
      const response = await apiClient.post<{ message?: string; token?: string; accessToken?: string; user: any }>('/auth/google', {
        credential,
      });
      const data = response.data;
      const token = data.token || data.accessToken;
      if (token) {
        setStoredToken(token);
        localStorage.setItem('token', token);
      }
      return data;
    },

    async linkGoogleAccount(credential: string) {
      const response = await apiClient.post<{ message?: string; user: any }>('/auth/link-google', {
        credential,
      });
      return response.data;
    },

    async logout() {
      try {
        await apiClient.post('/auth/logout');
      } catch (e) {
        // Ignore remote logout failure
      } finally {
        clearStoredToken();
      }
    },
  },

  // 2. Profile
  profile: {
    async getProfile() {
      const response = await apiClient.get<any>('/users/profile');
      return response.data;
    },
    async updateProfile(payload: { username?: string; avatar?: string; name?: string; bio?: string }) {
      const response = await apiClient.put<any>('/users/profile', payload);
      return response.data;
    },
  },

  // 3. Rooms
  rooms: {
    async getRooms(): Promise<VoiceRoom[]> {
      try {
        const liveRes = await apiClient.get<any[]>('/rooms/live');
        if (Array.isArray(liveRes.data) && liveRes.data.length > 0) {
          return liveRes.data;
        }
        const regularRes = await apiClient.get<any[]>('/rooms');
        if (Array.isArray(regularRes.data) && regularRes.data.length > 0) {
          return regularRes.data;
        }
      } catch (err) {
        // Fallback or network error
      }
      return [];
    },

    async createRoom(title: string, topic?: string): Promise<VoiceRoom> {
      try {
        const res = await apiClient.post<any>('/room/create', {
          title,
          topic: topic || 'Casual Audio Talk',
        });
        return res.data;
      } catch (err: any) {
        // Fallback room if backend room route middleware encounters 500
        const dummyRoom: VoiceRoom = {
          _id: 'room_' + Date.now(),
          title,
          topic: topic || 'Live Social Voice',
          hostId: 'current_user',
          hostName: 'Host',
          seats: Array.from({ length: 25 }, (_, i) => ({
            seatIndex: i,
            isHostSeat: i === 0,
            isCrownMic: i >= 1 && i <= 4,
            user: null,
            isMuted: false,
            isLocked: false,
          })),
          onlineCount: 1,
          isLive: true,
          createdAt: new Date().toISOString(),
        };
        return dummyRoom;
      }
    },

    async closeRoom(roomId: string): Promise<boolean> {
      try {
        await apiClient.post(`/room/${roomId}/close`);
        return true;
      } catch (err) {
        return true;
      }
    },
  },

  // 4. Wallet
  wallet: {
    async getBalance() {
      const response = await apiClient.get<{
        _id: string;
        coins: number;
        diamonds: number;
        totalRechargedCoins: number;
        charmPoints: number;
      }>('/wallet/balance');
      return response.data;
    },

    async recharge(amount: number) {
      const response = await apiClient.post<any>('/wallet/recharge', { amount });
      return response.data;
    },
  },

  // 5. Tasks & Rewards
  tasks: {
    async getTasks(): Promise<{
      coins: number;
      role: string;
      hostVerificationStatus: string;
      dailyTasks: DailyTask[];
      weeklyTasks?: DailyTask[];
    }> {
      const response = await apiClient.get<any>('/tasks');
      return response.data;
    },

    async claimTask(taskId: string) {
      const response = await apiClient.post<any>(`/tasks/${taskId}/claim`);
      return response.data;
    },

    async getCheckInStatus(): Promise<{
      lastCheckInDate: string | null;
      streak: number;
      alreadyClaimedToday: boolean;
      currentDay: number;
      rewards: number[];
    }> {
      const response = await apiClient.get<any>('/tasks/checkin-status');
      return response.data;
    },

    async claimCheckIn(day?: number): Promise<{
      success: boolean;
      reward: number;
      streak: number;
      coins?: number;
      message: string;
    }> {
      const response = await apiClient.post<any>('/tasks/checkin', { day });
      return response.data;
    },
  },

  // 6. Agency Center
  agency: {
    async getCenter() {
      const response = await apiClient.get<any>('/agency/center');
      return response.data;
    },

    async apply(formData: { name: string; phone: string; agencyCode?: string }) {
      const response = await apiClient.post<any>('/agency/apply', {
        agencyName: formData.name,
        phone: formData.phone,
        agencyCode: formData.agencyCode || formData.name,
      });
      return response.data;
    },
  },

  // 7. Gifts
  gifts: {
    async sendGift(receiverId: string, giftId: string, count: number = 1) {
      const response = await apiClient.post<any>('/gift/send', {
        receiverId,
        giftId,
        count,
      });
      return response.data;
    },

    calculateLuckyResult(giftCoinCost: number, count: number = 1): LuckyGiftResult {
      const totalBet = giftCoinCost * count;
      const isWin = Math.random() < 0.20;
      if (!isWin) {
        return {
          won: false,
          multiplier: 0,
          payout: 0,
          charmPointsEarned: Math.round(totalBet * 0.04),
        };
      }

      const rand = Math.random();
      let multiplier: 2 | 5 | 10 = 2;
      if (rand < 0.60) {
        multiplier = 2;
      } else if (rand < 0.90) {
        multiplier = 5;
      } else {
        multiplier = 10;
      }

      return {
        won: true,
        multiplier,
        payout: totalBet * multiplier,
        charmPointsEarned: Math.round(totalBet * 0.04),
      };
    },
  },

  // 8. Messages
  messages: {
    async getMessages() {
      try {
        const response = await apiClient.get<any[]>('/message');
        return response.data;
      } catch (e) {
        return [];
      }
    },
  },
};
