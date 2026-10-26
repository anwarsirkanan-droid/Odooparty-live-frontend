import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api, getStoredToken, clearStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  adjustCoins: (amount: number) => void;
  adjustDiamonds: (amount: number) => void;
  adjustPoints: (amount: number) => void;
  adjustCharm: (points: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const curToken = getStoredToken();
      // Purge any fake/demo tokens immediately
      if (curToken && (curToken.startsWith('anwar_') || curToken.startsWith('demo_') || curToken.startsWith('guest_'))) {
        clearStoredToken();
        localStorage.removeItem('meso_user_profile');
        return null;
      }
      const saved = localStorage.getItem('meso_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    const cur = getStoredToken();
    if (cur && (cur.startsWith('anwar_') || cur.startsWith('demo_') || cur.startsWith('guest_'))) {
      clearStoredToken();
      return null;
    }
    return cur;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const curToken = getStoredToken();
    if (!curToken || curToken.startsWith('anwar_') || curToken.startsWith('demo_') || curToken.startsWith('guest_')) {
      clearStoredToken();
      localStorage.removeItem('meso_user_profile');
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.auth.getMe();
      if (data && data.user) {
        // Also fetch wallet balance to ensure currency consistency
        try {
          const balance = await api.wallet.getBalance();
          if (balance) {
            data.user.coins = balance.coins ?? data.user.coins ?? 0;
            data.user.diamonds = balance.diamonds ?? data.user.diamonds ?? 0;
            data.user.totalRechargedCoins = balance.totalRechargedCoins ?? data.user.totalRechargedCoins ?? 0;
            data.user.charmPoints = balance.charmPoints ?? data.user.charmPoints ?? 0;
          }
        } catch (e) {
          // ignore
        }
        setUser(data.user);
        try {
          localStorage.setItem('meso_user_profile', JSON.stringify(data.user));
        } catch {}
      }
    } catch (err: any) {
      if (err.status === 401) {
        clearStoredToken();
        localStorage.removeItem('meso_user_profile');
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    // Listen to 401 unauthorized events dispatched by axios interceptor
    const handleUnauthorized = () => {
      clearStoredToken();
      localStorage.removeItem('meso_user_profile');
      setToken(null);
      setUser(null);
    };

    window.addEventListener('meso:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('meso:unauthorized', handleUnauthorized);
    };
  }, [refreshUser]);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(identifier, password);
      setToken(res.token);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(username, email, password);
      setToken(res.token);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (credential: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.googleLogin(credential);
      const userToken = res.token || res.accessToken;
      if (userToken) {
        setToken(userToken);
        localStorage.setItem('token', userToken);
        localStorage.setItem('meso_token', userToken);
      }
      await refreshUser();
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
    } finally {
      clearStoredToken();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('meso_user_profile');
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const adjustCoins = (amount: number) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, coins: Math.max(0, (prev.coins || 0) + amount) };
      try {
        localStorage.setItem('meso_user_profile', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const adjustDiamonds = (amount: number) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, diamonds: Math.max(0, (prev.diamonds || 0) + amount) };
      try {
        localStorage.setItem('meso_user_profile', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const adjustPoints = (amount: number) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, points: Math.max(0, (prev.points || 0) + amount) };
      try {
        localStorage.setItem('meso_user_profile', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const adjustCharm = (points: number) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, charmPoints: (prev.charmPoints || 0) + points };
      try {
        localStorage.setItem('meso_user_profile', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        googleLogin,
        logout,
        refreshUser,
        adjustCoins,
        adjustDiamonds,
        adjustPoints,
        adjustCharm,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
