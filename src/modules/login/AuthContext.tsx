import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  onIdTokenChanged,
  User,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";

type AuthUser = {
  id: string;
  email: string;
  role: string;
};

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, devRole?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAdminWithGoogle: (secretKey: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    contact: string;
    address: string;
    dob: string;
  }) => Promise<void>;
  logout: () => void;
}

const provider = import.meta.env.VITE_AUTH_PROVIDER || "api"; // 'api' | 'firebase'

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  loginAdminWithGoogle: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pauseFirebaseSyncRef = useRef(false);

  useEffect(() => {
    // Prevent "mixed-mode" sessions when switching providers.
    // If we previously ran with mock tokens, wipe them so API auth can work.
    const token = localStorage.getItem("accessToken");
    const isMockToken = !!token && token.startsWith("mock-token-");
    const looksLikeJwt = !!token && token.split(".").length === 3;
    if (provider !== "mock" && (isMockToken || (token && !looksLikeJwt))) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
    }

    if (provider === "firebase") {
      const syncFirebaseSession = async (fbUser: User) => {
        const token = await fbUser.getIdToken(false);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        localStorage.setItem(
          "fb_user",
          JSON.stringify({ id: fbUser.uid, email: fbUser.email }),
        );
        localStorage.setItem("fb_id_token", token);
        localStorage.setItem("accessToken", token);

        const { data: session } = await api.post("/auth/firebase/session");
        localStorage.setItem("email", session.email);
        localStorage.setItem("role", session.role);
        localStorage.setItem("userId", session.userId);
        setUser({ id: session.userId, email: session.email, role: session.role });
      };

      const clearFirebaseSession = () => {
        setUser(null);
        delete api.defaults.headers.common.Authorization;
        localStorage.removeItem("fb_user");
        localStorage.removeItem("fb_id_token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
      };

      const unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (pauseFirebaseSyncRef.current) {
          return;
        }
        try {
          if (fbUser?.email) {
            await syncFirebaseSession(fbUser);
          } else {
            clearFirebaseSession();
          }
        } catch (error) {
          console.error("Failed to sync Firebase session:", error);
          clearFirebaseSession();
        } finally {
          setLoading(false);
        }
      });

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

  const login = async (email: string, password: string, devRole?: string) => {
    if (provider === "firebase") {
      pauseFirebaseSyncRef.current = true;
      setLoading(true);
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const token = await cred.user.getIdToken(false);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        const { data: session } = await api.post("/auth/firebase/session");
        localStorage.setItem(
          "fb_user",
          JSON.stringify({ id: cred.user.uid, email: cred.user.email }),
        );
        localStorage.setItem("fb_id_token", token);
        localStorage.setItem("accessToken", token);
        localStorage.setItem("email", session.email);
        localStorage.setItem("role", session.role);
        localStorage.setItem("userId", session.userId);
        setUser({ id: session.userId, email: session.email, role: session.role });
        return;
      } finally {
        pauseFirebaseSyncRef.current = false;
        setLoading(false);
      }
    }
    const { data } = await api.post("/auth/login", { email, password, secretKey: devRole });
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
    if (provider === "firebase") {
      pauseFirebaseSyncRef.current = true;
      setLoading(true);
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        const token = await cred.user.getIdToken(false);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        const { data: session } = await api.post("/auth/firebase/session");
        localStorage.setItem(
          "fb_user",
          JSON.stringify({ id: cred.user.uid, email: cred.user.email }),
        );
        localStorage.setItem("fb_id_token", token);
        localStorage.setItem("accessToken", token);
        localStorage.setItem("email", session.email);
        localStorage.setItem("role", session.role);
        localStorage.setItem("userId", session.userId);
        setUser({ id: session.userId, email: session.email, role: session.role });
      } finally {
        pauseFirebaseSyncRef.current = false;
        setLoading(false);
      }
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  const loginAdminWithGoogle = async (secretKey: string) => {
    const googleProvider = new GoogleAuthProvider();
    if (provider !== "firebase") {
      throw new Error("Admin Google sign-in requires Firebase auth mode.");
    }

    pauseFirebaseSyncRef.current = true;
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const token = await cred.user.getIdToken(false);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      await api.post("/auth/firebase/admin-access", { secretKey });
      const { data: session } = await api.post("/auth/firebase/session");
      localStorage.setItem(
        "fb_user",
        JSON.stringify({ id: cred.user.uid, email: cred.user.email }),
      );
      localStorage.setItem("fb_id_token", token);
      localStorage.setItem("accessToken", token);
      localStorage.setItem("email", session.email);
      localStorage.setItem("role", session.role);
      localStorage.setItem("userId", session.userId);
      setUser({ id: session.userId, email: session.email, role: session.role });
    } catch (error) {
      await signOut(auth).catch(() => undefined);
      throw error;
    } finally {
      pauseFirebaseSyncRef.current = false;
      setLoading(false);
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    fullName: string;
    contact: string;
    address: string;
    dob: string;
  }) => {
    if (provider === "firebase") {
      pauseFirebaseSyncRef.current = true;
      setLoading(true);
      try {
        const cred = await createUserWithEmailAndPassword(
          auth,
          payload.email,
          payload.password,
        );
        const token = await cred.user.getIdToken(false);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        await api.post("/auth/firebase/register", {
          fullName: payload.fullName,
          contact: payload.contact,
          address: payload.address,
          dob: payload.dob,
          role: "MEMBER",
        });
        const { data: session } = await api.post("/auth/firebase/session");
        localStorage.setItem(
          "fb_user",
          JSON.stringify({ id: cred.user.uid, email: cred.user.email }),
        );
        localStorage.setItem("fb_id_token", token);
        localStorage.setItem("accessToken", token);
        localStorage.setItem("email", session.email);
        localStorage.setItem("role", session.role);
        localStorage.setItem("userId", session.userId);
        setUser({ id: session.userId, email: session.email, role: session.role });
        return;
      } finally {
        pauseFirebaseSyncRef.current = false;
        setLoading(false);
      }
    }

    await api.post("/auth/register", {
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName,
      contact: payload.contact,
      address: payload.address,
      dob: payload.dob,
      role: "MEMBER",
    });
  };

  const logout = () => {
    if (provider === "firebase") {
      signOut(auth);
    }
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        loginAdminWithGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
