import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/auth';
import { AuthUser } from '@/types/auth';
import { getStoredToken } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'everkeep_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkUser = async () => {
      try {
        // First check localStorage for user data
        const savedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }

        // If no token, skip calling server
        const token = getStoredToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // Then verify with server
        const response = await authService.getCurrentUser();
        if (response.isSuccessful && response.data) {
          setUser(response.data);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
        } else {
          // If server says no user, clear localStorage
          localStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
        // On error, keep localStorage data but don't clear it
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const setUserWithStorage = (newUser: AuthUser | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local data
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const value = {
    user,
    setUser: setUserWithStorage,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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