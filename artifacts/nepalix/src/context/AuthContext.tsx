import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { ApiError, api, type AuthStore, type AuthUser } from "@/lib/api";

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  googleAuthError: boolean;
  clearGoogleAuthError: () => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  listStores: () => Promise<AuthStore[]>;
  setActiveStore: (storeId: string) => Promise<AuthUser>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [googleAuthError, setGoogleAuthError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleAuth = params.get("google_auth");
    if (googleAuth) {
      window.history.replaceState({}, "", window.location.pathname);
      if (googleAuth === "error") setGoogleAuthError(true);
    }
    api.auth
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await api.auth.login({ email, password });
    setUser(user);
    return user;
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const { user } = await api.auth.register(data);
      setUser(user);
      return user;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      // Expired or already-cleared sessions should still leave the client logged out.
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }
    }
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await api.auth.me();
      setUser(user);
      return user;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const listStores = useCallback(async () => {
    const { stores } = await api.auth.stores();
    return stores;
  }, []);

  const setActiveStore = useCallback(async (storeId: string) => {
    const { user } = await api.auth.setActiveStore(storeId);
    setUser(user);
    return user;
  }, []);

  const clearGoogleAuthError = useCallback(() => setGoogleAuthError(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        googleAuthError,
        clearGoogleAuthError,
        login,
        register,
        logout,
        refreshUser,
        listStores,
        setActiveStore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
