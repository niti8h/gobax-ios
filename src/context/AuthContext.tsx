import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

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
  securityCheckUrl: string;
  securityCheckOrigin: string;
  sessionAccount: string;
  sessionPassword: string;
  user: UserProfile | null;
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
  login: (identifier: string, password: string) => Promise<void>;
  register: (type: 'mobile' | 'email', value: string, password: string, inviteCode?: string) => Promise<void>;
  requestPasswordReset: (account: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  completeSecurityCheck: (token?: string) => Promise<void>;
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

export const SECURITY_CHECK_ORIGIN = 'https://gobax.010111902.workers.dev';
const SECURITY_CHECK_FALLBACK_URL = `${SECURITY_CHECK_ORIGIN}/security-check`;

type PendingAuth = {
  account: string;
  password: string;
  challengeToken?: string;
  response: unknown;
} & (
  | { mode: 'login' }
  | { mode: 'register'; type: 'mobile' | 'email'; inviteCode?: string }
);

interface SecurityChallenge {
  url: string;
  token?: string;
}

const tokenFromUrl = (url: string) => {
  const match = /[?&](?:t|token|key)=([^&#]+)/.exec(url);
  return match ? decodeURIComponent(match[1]) : undefined;
};

// The backend signals a step-up check either with a security_check object or
// with code 2. Field names are read leniently so a small backend change does
// not lock users out of logging in.
const getSecurityChallenge = (payload: unknown): SecurityChallenge | null => {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, any>;
  const raw = data.security_check ?? data.securityCheck
    ?? data.data?.security_check ?? data.data?.securityCheck;

  if (!raw && data.code !== 2) return null;
  if (raw && (raw.required === false || raw.require === false)) return null;

  const url = typeof raw?.url === 'string' && raw.url.trim()
    ? raw.url.trim()
    : SECURITY_CHECK_FALLBACK_URL;

  // Only talk to our own security-check host.
  if (!url.startsWith(`${SECURITY_CHECK_ORIGIN}/`)) return null;

  const token = [raw?.token, raw?.key, raw?.challenge, data.security_token]
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0);

  return { url, token: token?.trim() ?? tokenFromUrl(url) };
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
  // A step-up challenge is an expected outcome, not an error.
  if (response.ok && getSecurityChallenge(payload)) {
    return payload;
  }

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
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessionAccount, setSessionAccount] = useState('');
  const [sessionPassword, setSessionPassword] = useState('');
  const [pendingAuth, setPendingAuth] = useState<PendingAuth | null>(null);
  const [securityCheckUrl, setSecurityCheckUrl] = useState('');

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);
        if (!stored) return;

        const session = JSON.parse(stored) as StoredSession;
        if (!session.account || !session.password || !session.user) return;

        setUser(session.user);
        setSessionAccount(session.account);
        setSessionPassword(session.password);

        // Re-check with the backend on every launch, so an account the
        // backend flags meets the security check again rather than walking
        // straight in on a stored session.
        try {
          const response = await postForm('api_check_login', {
            account: session.account,
            password: session.password,
          });

          const challenge = getSecurityChallenge(response);
          if (challenge) {
            openSecurityCheck(challenge, {
              mode: 'login',
              account: session.account,
              password: session.password,
              response,
            });
            return;
          }

          setIsAuthenticated(true);
        } catch {
          // Offline or the backend is unreachable. Fall back to the stored
          // session rather than locking someone out of content they already
          // have; the check runs again on the next launch that has network.
          setIsAuthenticated(true);
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

  const buildProfile = (
    response: unknown,
    account: string,
    fallbackName: string,
    email: string | undefined,
    phone: string | undefined,
  ): UserProfile => ({
    id: getUserId(response, account),
    name: getProfileText(response, 'name') ?? fallbackName,
    email: getProfileText(response, 'email') ?? email,
    phone: getProfileText(response, 'phone') ?? phone,
    gobxPoints: getProfileNumber(response, 'gobxPoints'),
    learningStreak: getProfileNumber(response, 'learningStreak'),
    quizzesCompleted: getProfileNumber(response, 'quizzesCompleted'),
    articlesRead: getProfileNumber(response, 'articlesRead'),
  });

  const startSession = async (account: string, password: string, profile: UserProfile) => {
    setUser(profile);
    setSessionAccount(account);
    setSessionPassword(password);
    await persistSession(account, password, profile);
    setIsAuthenticated(true);
  };

  const loginProfile = (response: unknown, account: string) => {
    const isEmail = account.includes('@');
    return buildProfile(
      response,
      account,
      account.split('@')[0] || 'Member',
      isEmail ? account : undefined,
      isEmail ? undefined : account,
    );
  };

  const registerProfile = (response: unknown, account: string, type: 'mobile' | 'email') =>
    buildProfile(
      response,
      account,
      type === 'email' ? account.split('@')[0] || 'Member' : 'Member',
      type === 'email' ? account : undefined,
      type === 'mobile' ? account : undefined,
    );

  const openSecurityCheck = (challenge: SecurityChallenge, next: PendingAuth) => {
    setPendingAuth({ ...next, challengeToken: challenge.token });
    setSecurityCheckUrl(challenge.url);
  };

  const login = async (identifier: string, password: string) => {
    const account = identifier.trim();
    const response = await postForm('api_check_login', { account, password });

    const challenge = getSecurityChallenge(response);
    if (challenge) {
      openSecurityCheck(challenge, { mode: 'login', account, password, response });
      return;
    }

    await startSession(account, password, loginProfile(response, account));
  };

  const register = async (type: 'mobile' | 'email', value: string, password: string, inviteCode?: string) => {
    const account = value.trim();
    const values: Record<string, string> = { account, password };
    const code = inviteCode?.trim();
    if (code) values.invit = code;

    const response = await postForm('api_register', values);

    const challenge = getSecurityChallenge(response);
    if (challenge) {
      openSecurityCheck(challenge, { mode: 'register', account, password, type, inviteCode: code, response });
      return;
    }

    await startSession(account, password, registerProfile(response, account, type));
  };

  // Two shapes are supported. When the backend issues a challenge token, we
  // re-post it and let the server decide whether to release the session. When
  // it only raises a boolean flag, there is nothing for the server to verify,
  // so we complete from the original response rather than re-posting - the
  // backend returns the same flag every time and would otherwise loop.
  const completeSecurityCheck = async (token?: string) => {
    const pending = pendingAuth;
    if (!pending) {
      throw new Error('Security verification expired. Please return to login and try again.');
    }

    const securityToken = token ?? pending.challengeToken;
    let response: unknown = pending.response;

    if (securityToken) {
      const values: Record<string, string> = {
        account: pending.account,
        password: pending.password,
        security_token: securityToken,
      };
      if (pending.mode === 'register' && pending.inviteCode) values.invit = pending.inviteCode;

      const endpoint = pending.mode === 'login' ? 'api_check_login' : 'api_register';
      response = await postForm(endpoint, values);

      if (getSecurityChallenge(response)) {
        throw new Error('The security check did not complete. Please try again.');
      }
    }

    const profile = pending.mode === 'login'
      ? loginProfile(response, pending.account)
      : registerProfile(response, pending.account, pending.type);

    setPendingAuth(null);
    setSecurityCheckUrl('');
    await startSession(pending.account, pending.password, profile);
  };

  const cancelSecurityCheck = () => {
    setPendingAuth(null);
    setSecurityCheckUrl('');
  };

  const requestPasswordReset = async (account: string) => {
    await postForm('api_check_login?reset_password=1', { account: account.trim() });
  };

  // Deletion must use the same password form as login. Sending md5 here made
  // the backend answer "wrong password", and the old catch-all then logged the
  // user out anyway, so the app reported success for a deletion that never
  // happened. Failures now surface instead.
  const deleteAccount = async () => {
    if (!sessionAccount || !sessionPassword) {
      throw new Error('Please sign in again before deleting your account.');
    }

    await postForm('api_check_login?delete_account=1', {
      account: sessionAccount,
      password: sessionPassword,
    });

    logout();
  };

  const logout = () => {
    SecureStore.deleteItemAsync(SESSION_STORAGE_KEY).catch(() => undefined);
    setUser(null);
    setIsAuthenticated(false);
    setSessionAccount('');
    setSessionPassword('');
    setPendingAuth(null);
    setSecurityCheckUrl('');
  };

  const updateGobxPoints = (points: number) => {
    setUser(prev => prev ? { ...prev, gobxPoints: prev.gobxPoints + points } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isRestoringSession,
        isSecurityCheckVisible: Boolean(securityCheckUrl),
        securityCheckUrl,
        securityCheckOrigin: SECURITY_CHECK_ORIGIN,
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
        sessionAccount,
        sessionPassword,
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
