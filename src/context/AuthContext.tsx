import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { md5 } from '../utils/md5';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gobxPoints: number;
  learningStreak: number;
  quizzesCompleted: number;
  articlesRead: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isRestoringSession: boolean;
  isSecurityCheckVisible: boolean;
  securityCheckAccount: string;
  securityCheckPassword: string;
  user: UserProfile | null;
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
  login: (identifier: string, password: string) => Promise<void>;
  register: (type: 'mobile' | 'email', value: string, password: string, inviteCode?: string) => Promise<void>;
  requestPasswordReset: (account: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  completeSecurityCheck: () => void;
  logout: () => void;
  updateGobxPoints: (points: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL = 'https://gobax.010111902.workers.dev/Login';
const SESSION_STORAGE_KEY = 'gobax-auth-session';

interface StoredSession {
  account: string;
  password: string;
  user: UserProfile;
}

const getResponseMessage = (payload: unknown, fallback: string) => {
  if (typeof payload === 'string' && payload.trim()) return payload.trim();
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    const message = data.message ?? data.msg ?? data.error ?? data.info;
    if (typeof message === 'string' && message.trim()) return message.trim();
  }
  return fallback;
};

const postForm = async (endpoint: string, values: Record<string, string>) => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/x-www-form-urlencoded',
        Origin: 'https://gobax.010111902.workers.dev',
        Referer: 'https://gobax.010111902.workers.dev/',
        'User-Agent': 'Mozilla/5.0',
      },
      body: new URLSearchParams(values).toString(),
    });
  } catch {
    throw new Error('Network connection was lost. Check your internet connection and try again.');
  }

  const text = await response.text();
  let payload: unknown = text;

  try {
    payload = JSON.parse(text);
  } catch {
  }

  const data = payload && typeof payload === 'object'
    ? payload as Record<string, unknown>
    : null;
  const explicitlyFailed = (
    typeof data?.code === 'number' && data.code !== 1
  ) || data?.success === false || data?.status === false || data?.error;
  if (!response.ok || explicitlyFailed) {
    throw new Error(getResponseMessage(payload, 'The server rejected the request.'));
  }

  return payload;
};

const getUserId = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, any>;
    return String(data.user_id ?? data.id ?? data.data?.user_id ?? data.data?.id ?? fallback);
  }
  return fallback;
};

const getProfileNumber = (payload: unknown, key: string) => {
  if (!payload || typeof payload !== 'object') return 0;
  const data = payload as Record<string, any>;
  const value = data[key] ?? data.data?.[key] ?? 0;
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
};

const getProfileText = (payload: unknown, key: string) => {
  if (!payload || typeof payload !== 'object') return undefined;
  const data = payload as Record<string, any>;
  const value = data[key] ?? data.data?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [isSecurityCheckVisible, setIsSecurityCheckVisible] = useState(false);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [securityCheckAccount, setSecurityCheckAccount] = useState('');
  const [securityCheckPassword, setSecurityCheckPassword] = useState('');

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);
        if (stored) {
          const session = JSON.parse(stored) as StoredSession;
          if (session.account && session.password && session.user) {
            setUser(session.user);
            setSecurityCheckAccount(session.account);
            setSecurityCheckPassword(session.password);
            setIsSecurityCheckVisible(true);
          }
        }
      } catch {
        await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY).catch(() => undefined);
      } finally {
        setIsRestoringSession(false);
      }
    };

    restoreSession();
  }, []);

  const persistSession = async (account: string, password: string, profile: UserProfile) => {
    await SecureStore.setItemAsync(
      SESSION_STORAGE_KEY,
      JSON.stringify({ account, password, user: profile } satisfies StoredSession),
    );
  };

  const login = async (identifier: string, password: string) => {
    const response = await postForm('api_check_login', {
      account: identifier.trim(),
      password,
    });
    const isEmail = identifier.includes('@');
    const profile: UserProfile = {
      id: getUserId(response, identifier.trim()),
      name: getProfileText(response, 'name') ?? identifier.split('@')[0] ?? 'Member',
      email: getProfileText(response, 'email') ?? (isEmail ? identifier.trim() : undefined),
      phone: getProfileText(response, 'phone') ?? (!isEmail ? identifier.trim() : undefined),
      gobxPoints: getProfileNumber(response, 'gobxPoints'),
      learningStreak: getProfileNumber(response, 'learningStreak'),
      quizzesCompleted: getProfileNumber(response, 'quizzesCompleted'),
      articlesRead: getProfileNumber(response, 'articlesRead'),
    };
    setUser(profile);
    await persistSession(identifier.trim(), password, profile);
    setSecurityCheckAccount(identifier.trim());
    setSecurityCheckPassword(password);
    setIsSecurityCheckVisible(true);
  };

  const register = async (type: 'mobile' | 'email', value: string, password: string, inviteCode?: string) => {
    const values: Record<string, string> = {
      account: value.trim(),
      password,
    };
    if (inviteCode?.trim()) {
      values.invit = inviteCode.trim();
    }
    const response = await postForm('api_register', values);
    const profile: UserProfile = {
      id: getUserId(response, value.trim()),
      name: getProfileText(response, 'name') ?? (type === 'email' ? value.split('@')[0] : 'Member'),
      email: getProfileText(response, 'email') ?? (type === 'email' ? value.trim() : undefined),
      phone: getProfileText(response, 'phone') ?? (type === 'mobile' ? value.trim() : undefined),
      gobxPoints: getProfileNumber(response, 'gobxPoints'),
      learningStreak: getProfileNumber(response, 'learningStreak'),
      quizzesCompleted: getProfileNumber(response, 'quizzesCompleted'),
      articlesRead: getProfileNumber(response, 'articlesRead'),
    };
    setUser(profile);
    await persistSession(value.trim(), password, profile);
    setSecurityCheckAccount(value.trim());
    setSecurityCheckPassword(password);
    setIsSecurityCheckVisible(true);
  };

  const requestPasswordReset = async (account: string) => {
    await postForm('api_check_login?reset_password=1', { account: account.trim() });
  };

  const deleteAccount = async () => {
    try {
      if (securityCheckAccount && securityCheckPassword) {
        await postForm('api_check_login?delete_account=1', {
          account: securityCheckAccount,
          password: md5(securityCheckPassword),
        });
      }
    } catch {
    } finally {
      logout();
    }
  };

  const completeSecurityCheck = () => {
    setIsSecurityCheckVisible(false);
    setIsAuthenticated(true);
  };

  const logout = () => {
    SecureStore.deleteItemAsync(SESSION_STORAGE_KEY).catch(() => undefined);
    setUser(null);
    setIsAuthenticated(false);
    setIsSecurityCheckVisible(false);
    setSecurityCheckAccount('');
    setSecurityCheckPassword('');
  };

  const updateGobxPoints = (points: number) => {
    setUser(prev => prev ? { ...prev, gobxPoints: prev.gobxPoints + points } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isRestoringSession,
        isSecurityCheckVisible,
        user,
        language,
        setLanguage,
        login,
        register,
        requestPasswordReset,
        deleteAccount,
        completeSecurityCheck,
        logout,
        updateGobxPoints,
        securityCheckAccount,
        securityCheckPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
