"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type UserData = {
  id: number;
  email: string;
  role: 'MANAGER' | 'INSPECTOR';
  mustChangePassword?: boolean;
};

interface AuthContextType {
  user: UserData | null;
  login: (token: string, user: UserData) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // In a real app, you'd validate the token with the /auth/me endpoint.
    // For now, we'll try to extract the user details from the JWT payload 
    // or rely on localstorage if stored manually (demo purposes).
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Final check on initial load - if they still must change password, push them back
        if (parsedUser.mustChangePassword && window.location.pathname !== '/change-password') {
          router.push('/change-password');
        }
      } catch (e) {}
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: UserData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // Check for mandatory password change first
    if (userData.mustChangePassword) {
      router.push('/change-password');
      return;
    }

    // Redirect based on role
    if (userData.role === 'MANAGER') {
      router.push('/manager/dashboard');
    } else {
      router.push('/inspector/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
