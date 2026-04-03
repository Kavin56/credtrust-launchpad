import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

type AuthUser = {
  id: string;
  email: string;
  role: string;
};

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const provider = import.meta.env.VITE_AUTH_PROVIDER || "api"; // 'api' | 'firebase'

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (provider === "firebase") {
      // fast path: restore cached user/token to avoid refetch on refresh
      const cachedUser = localStorage.getItem("fb_user");
      const cachedToken = localStorage.getItem("fb_id_token");
      if (cachedUser && cachedToken) {
        try {
          const u = JSON.parse(cachedUser);
          setUser({ id: u.id, email: u.email, role: "MEMBER" });
          api.defaults.headers.common.Authorization = `Bearer ${cachedToken}`;
          setLoading(false);
        } catch {
          // ignore parse errors
        }
      }

      const unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser?.email) {
          const token = await fbUser.getIdToken(false);
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          localStorage.setItem("fb_user", JSON.stringify({ id: fbUser.uid, email: fbUser.email }));
          localStorage.setItem("fb_id_token", token);
          localStorage.setItem("accessToken", token); // for existing axios interceptor compatibility
          localStorage.setItem("role", "MEMBER");
          setUser({ id: fbUser.uid, email: fbUser.email, role: "MEMBER" });
        } else {
          setUser(null);
          localStorage.removeItem("fb_user");
          localStorage.removeItem("fb_id_token");
          localStorage.removeItem("accessToken");
        }
        setLoading(false);
      });

      // keep token fresh in background without blocking UI
      const unsubToken = onIdTokenChanged(auth, async (fbUser) => {
        if (fbUser) {
          const token = await fbUser.getIdToken(false);
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          localStorage.setItem("fb_id_token", token);
          localStorage.setItem("accessToken", token);
        }
      });

      return () => {
        unsub();
        unsubToken();
      };
    } else {
      const token = localStorage.getItem("accessToken");
      const email = localStorage.getItem("email");
      const role = localStorage.getItem("role");
      const userId = localStorage.getItem("userId");
      if (token && email && role && userId) {
        setUser({ id: userId, email, role });
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (provider === "firebase") {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken(false);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem("fb_user", JSON.stringify({ id: cred.user.uid, email }));
      localStorage.setItem("fb_id_token", token);
      localStorage.setItem("accessToken", token);
      localStorage.setItem("role", "MEMBER");
      return;
    }
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("email", email);
    localStorage.setItem("role", data.role);
    const payload = JSON.parse(atob(data.accessToken.split(".")[1] || "{}"));
    localStorage.setItem("userId", payload.sub);
    setUser({ id: payload.sub, email, role: data.role });
  };

  const loginWithGoogle = async () => {
    const googleProvider = new GoogleAuthProvider();
    await signInWithPopup(auth, googleProvider);
  };

  const logout = () => {
    if (provider === "firebase") {
      signOut(auth);
    }
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
