import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ActivationType = '24h' | '7d' | 'lifetime';

interface AuthState {
  isActivated: boolean;
  code: string | null;
  type: ActivationType | null;
  expiresAt: string | null;
  activatedAt: string | null;
}

interface AuthContextValue extends AuthState {
  activate: (code: string) => Promise<{ success: boolean; error?: string; data?: any }>;
  logout: () => void;
  isExpired: () => boolean;
  getRemainingTime: () => string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'shanjiao_perler_auth';
const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    }
    return {
      isActivated: false,
      code: null,
      type: null,
      expiresAt: null,
      activatedAt: null,
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }, [authState]);

  // Check expiration
  const isExpired = useCallback((): boolean => {
    if (!authState.isActivated || !authState.expiresAt) {
      return false;
    }
    if (authState.type === 'lifetime') {
      return false;
    }
    return new Date(authState.expiresAt) < new Date();
  }, [authState]);

  // Get remaining time string
  const getRemainingTime = useCallback((): string => {
    if (!authState.isActivated || !authState.expiresAt) {
      return '';
    }
    if (authState.type === 'lifetime') {
      return '永久有效';
    }

    const now = new Date();
    const expires = new Date(authState.expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) {
      return '已过期';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `剩余 ${days}天 ${hours}小时`;
    } else if (hours > 0) {
      return `剩余 ${hours}小时 ${minutes}分钟`;
    } else {
      return `剩余 ${minutes}分钟`;
    }
  }, [authState]);

  // Activate with code
  const activate = useCallback(async (code: string): Promise<{ success: boolean; error?: string; data?: any }> => {
    try {
      // Validate format
      const codeRegex = /^SJ-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/i;
      if (!codeRegex.test(code.toUpperCase())) {
        return { success: false, error: '激活码格式不正确，应为：SJ-XXXX-XXXX-XXXX' };
      }

      // Call API
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || '激活失败' };
      }

      // Update state
      setAuthState({
        isActivated: true,
        code: code.toUpperCase(),
        type: data.type,
        expiresAt: data.expiresAt,
        activatedAt: data.activatedAt,
      });

      return { success: true, data };
    } catch (error) {
      console.error('Activation error:', error);
      return { success: false, error: '网络错误，请检查连接后重试' };
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    setAuthState({
      isActivated: false,
      code: null,
      type: null,
      expiresAt: null,
      activatedAt: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Periodic expiry check
  useEffect(() => {
    const checkExpiry = () => {
      if (isExpired()) {
        logout();
      }
    };

    // Check immediately
    checkExpiry();

    // Then check periodically
    const interval = setInterval(checkExpiry, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isExpired, logout]);

  const value: AuthContextValue = {
    ...authState,
    activate,
    logout,
    isExpired,
    getRemainingTime,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
