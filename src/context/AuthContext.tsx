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
  completeSecurityCheck: () => Promise<void>;
  cancelSecurityCheck: () => void;
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

type SecurityCheckAction = 'login' | 'register' | 'restore' | null;

const getResponseMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    const message = data.message ?? data.msg ?? data.error ?? data.info;
    if (typeof message === 'string' && message.trim()) return message.trim();
  }
  return fallback;
};

const getHttpErrorMessage = (status: number) => {
  if (status === 401) return 'Your user ID or password is incorrect.';
  if (status === 403 || status === 404 || status >= 500) {
    return 'The login service is temporarily unavailable. Please try again later.';
  }
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
  return 'Unable to complete your request. Please try again.';
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

  const responseText = await response.text();
  const isJson = response.headers.get('content-type')?.includes('application/json');
  let payload: unknown = null;

  if (isJson && responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      // Authentication responses must be JSON. Do not render raw server HTML.
    }
  }

  const data = payload && typeof payload === 'object'
    ? payload as Record<string, unknown>
    : null;
  const explicitlyFailed = (
    typeof data?.code === 'number' && data.code !== 1
  ) || data?.success === false || data?.status === false || data?.error;
  if (!response.ok || explicitlyFailed) {
    throw new Error(
      getResponseMessage(payload, response.ok
        ? 'Unable to complete your request. Please try again.'
        : getHttpErrorMessage(response.status))
    );
  }

  if (!isJson || !data) {
    throw new Error('The login service returned an invalid response. Please try again later.');
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
  const [securityCheckAction, setSecurityCheckAction] = useState<SecurityCheckAction>(null);
  const [pendingRegistration, setPendingRegistration] = useState<{
    type: 'mobile' | 'email';
    inviteCode?: string;
  } | null>(null);

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
            setSecurityCheckAction('restore');
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
    setSecurityCheckAccount(identifier.trim());
    setSecurityCheckPassword(password);
    setSecurityCheckAction('login');
    setPendingRegistration(null);
    setIsSecurityCheckVisible(true);
  };

  const register = async (type: 'mobile' | 'email', value: string, password: string, inviteCode?: string) => {
    setSecurityCheckAccount(value.trim());
    setSecurityCheckPassword(password);
    setSecurityCheckAction('register');
    setPendingRegistration({ type, inviteCode: inviteCode?.trim() || undefined });
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

  const completeSecurityCheck = async () => {
    if (securityCheckAction === 'restore') {
      setSecurityCheckAction(null);
      setIsSecurityCheckVisible(false);
      setIsAuthenticated(true);
      return;
    }

    if (!securityCheckAccount || !securityCheckPassword || !securityCheckAction) {
      throw new Error('Security verification expired. Please return to login and try again.');
    }

    let response: unknown;
    let profile: UserProfile;

    if (securityCheckAction === 'login') {
      response = await postForm('api_check_login', {
        account: securityCheckAccount,
        password: securityCheckPassword,
      });
      const isEmail = securityCheckAccount.includes('@');
      profile = {
        id: getUserId(response, securityCheckAccount),
        name: getProfileText(response, 'name') ?? securityCheckAccount.split('@')[0] ?? 'Member',
        email: getProfileText(response, 'email') ?? (isEmail ? securityCheckAccount : undefined),
        phone: getProfileText(response, 'phone') ?? (!isEmail ? securityCheckAccount : undefined),
        gobxPoints: getProfileNumber(response, 'gobxPoints'),
        learningStreak: getProfileNumber(response, 'learningStreak'),
        quizzesCompleted: getProfileNumber(response, 'quizzesCompleted'),
        articlesRead: getProfileNumber(response, 'articlesRead'),
      };
    } else {
      const registration = pendingRegistration;
      if (!registration) {
        throw new Error('Registration details expired. Please return to registration and try again.');
      }
      const values: Record<string, string> = {
        account: securityCheckAccount,
        password: securityCheckPassword,
      };
      if (registration.inviteCode) values.invit = registration.inviteCode;
      response = await postForm('api_register', values);
      profile = {
        id: getUserId(response, securityCheckAccount),
        name: getProfileText(response, 'name') ?? (registration.type === 'email' ? securityCheckAccount.split('@')[0] : 'Member'),
        email: getProfileText(response, 'email') ?? (registration.type === 'email' ? securityCheckAccount : undefined),
        phone: getProfileText(response, 'phone') ?? (registration.type === 'mobile' ? securityCheckAccount : undefined),
        gobxPoints: getProfileNumber(response, 'gobxPoints'),
        learningStreak: getProfileNumber(response, 'learningStreak'),
        quizzesCompleted: getProfileNumber(response, 'quizzesCompleted'),
        articlesRead: getProfileNumber(response, 'articlesRead'),
      };
    }

    setUser(profile);
    await persistSession(securityCheckAccount, securityCheckPassword, profile);
    setPendingRegistration(null);
    setSecurityCheckAction(null);
    setIsSecurityCheckVisible(false);
    setIsAuthenticated(true);
  };

  const cancelSecurityCheck = () => {
    setSecurityCheckAccount('');
    setSecurityCheckPassword('');
    setSecurityCheckAction(null);
    setPendingRegistration(null);
    setIsSecurityCheckVisible(false);
  };

  const logout = () => {
    SecureStore.deleteItemAsync(SESSION_STORAGE_KEY).catch(() => undefined);
    setUser(null);
    setIsAuthenticated(false);
    setIsSecurityCheckVisible(false);
    setSecurityCheckAction(null);
    setPendingRegistration(null);
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
        cancelSecurityCheck,
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
