'use client';

// Mock authentication flow for QuickExpense Freemium logic
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, name: string) => Promise<void>;
  signup: (email: string, name: string) => Promise<void>;
  logout: () => void;
  upgradeToPro: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  upgradeToPro: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qe_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore err
    } finally {
      setLoading(false);
    }
  }, []);

  const saveUser = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('qe_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('qe_user');
    }
  };

  const login = async (email: string, name: string) => {
    // Mock network delay
    await new Promise(r => setTimeout(r, 600));
    saveUser({
      id: `usr_${Date.now()}`,
      name,
      email,
      isPro: false,
    });
  };

  const signup = async (email: string, name: string) => {
    await new Promise(r => setTimeout(r, 800));
    saveUser({
      id: `usr_${Date.now()}`,
      name,
      email,
      isPro: false,
    });
  };

  const logout = () => {
    saveUser(null);
  };

  const upgradeToPro = async () => {
    await new Promise(r => setTimeout(r, 1200));
    if (user) {
      saveUser({ ...user, isPro: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, upgradeToPro }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
