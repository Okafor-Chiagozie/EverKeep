import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/supabaseClient';
import { AuthService } from '@/lib/supabase/authService';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const authService = new AuthService(getSupabaseClient());

  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userMetadata = session.user.user_metadata;
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: userMetadata?.full_name || session.user.email!.split('@')[0],
          isVerified: userMetadata?.email_verified || false
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await authService.signIn({ email, password });
    if (error) throw error;
  };

  const signup = async (email: string, password: string, name: string) => {
    const { error } = await authService.signUp({ email, password, name });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await authService.signOut();
    if (error) throw error;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
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