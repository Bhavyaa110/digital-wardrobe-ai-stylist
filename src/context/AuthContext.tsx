'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const savedUser = localStorage.getItem('fitzy_user');
      const savedToken = localStorage.getItem('fitzy_token');
      if (savedUser && savedToken) return JSON.parse(savedUser);
    } catch (err) {
      localStorage.removeItem('fitzy_user');
      localStorage.removeItem('fitzy_token');
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('fitzy_user');
      const savedToken = localStorage.getItem('fitzy_token');
      if (savedUser && savedToken) setUser(JSON.parse(savedUser));
    } catch (err) {
      localStorage.removeItem('fitzy_user');
      localStorage.removeItem('fitzy_token');
    } finally {
      setHasHydrated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try API login first
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('fitzy_user', JSON.stringify(data.user));
        localStorage.setItem('fitzy_token', data.token || 'dummy-token');
        localStorage.setItem('fitzy_login_time', new Date().toISOString());
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.log('API login failed, using local authentication');
    }

    // Fallback: Local authentication
    const savedUsers = JSON.parse(localStorage.getItem('fitzy_users') || '[]');
    const existingUser = savedUsers.find((u: any) => u.email === email && u.password === password);

    if (existingUser) {
      const user = {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
      };

      // On success (API or local), persist:
      setUser(user);
      localStorage.setItem('fitzy_user', JSON.stringify(user));
      localStorage.setItem('fitzy_token', 'local-token-' + Date.now());
      localStorage.setItem('fitzy_login_time', new Date().toISOString());
    } else {
      throw new Error('Invalid email or password');
    }
    setIsLoading(false);
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try API signup first
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('fitzy_user', JSON.stringify(data.user));
          localStorage.setItem('fitzy_token', data.token || 'dummy-token');
          localStorage.setItem('fitzy_login_time', new Date().toISOString());
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.log('API signup failed, using local authentication');
    }

    // Fallback: Local authentication
    const savedUsers = JSON.parse(localStorage.getItem('fitzy_users') || '[]');

    // Check if user already exists
    if (savedUsers.some((u: any) => u.email === email)) {
      throw new Error('User with this email already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In production, this should be hashed
    };

    savedUsers.push(newUser);
    localStorage.setItem('fitzy_users', JSON.stringify(savedUsers));

    const user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };

    // On success (API or local), persist:
    setUser(user);
    localStorage.setItem('fitzy_user', JSON.stringify(user));
    localStorage.setItem('fitzy_token', 'local-token-' + Date.now());
    localStorage.setItem('fitzy_login_time', new Date().toISOString());
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fitzy_user');
    localStorage.removeItem('fitzy_token');
    localStorage.removeItem('fitzy_login_time');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, hasHydrated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}