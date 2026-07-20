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
  sendPasswordResetEmail,
} from "firebase/auth";

type AuthUser = {
  id: string;
  email: string;
  role: string;
  hasMemberProfile: boolean;
};

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAdminWithGoogle: (secretKey: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
  }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
  refreshProfileStatus: () => Promise<void>;
  loginPortalAdmin: (email: string, password: string, adminKey: string) => Promise<void>;
  loginAgent: (username: string, password: string) => Promise<void>;
}

const provider = import.meta.env.VITE_AUTH_PROVIDER || "api"; // 'api' | 'firebase'

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  loginAdminWithGoogle: async () => {},
  register: async () => {},
  resetPassword: async () => {},
  logout: () => {},
  refreshProfileStatus: async () => {},
  loginPortalAdmin: async () => {},
  loginAgent: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pauseFirebaseSyncRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const isMockToken = !!token && token.startsWith("mock-token-");
    const looksLikeJwt = !!token && token.split(".").length === 3;
    if (provider !== "mock" && (isMockToken || (token && !looksLikeJwt))) {
      localStorage.clear();
    }

    if (provider === "firebase") {
      const getFirebaseSession = async (fbUser: User) => {
        try {
          const { data } = await api.post("/auth/firebase/session");
          return data;
        } catch (error) {
          return {
            email: fbUser.email,
            role: "MEMBER",
            userId: fbUser.uid,
            hasMemberProfile: false
          };
        }
      };

      const syncFirebaseSession = async (fbUser: User) => {
        const firebaseToken = await fbUser.getIdToken(false);
        api.defaults.headers.common.Authorization = `Bearer ${firebaseToken}`;
        const session = await getFirebaseSession(fbUser);
        
        if (session.pendingRegistration) {
          // User exists in Firebase but has NOT completed registration (no KYC).
          // Store the Firebase token temporarily so the signup flow can use it.
          // Do NOT store it as the app accessToken (that's reserved for JWT).
          localStorage.setItem("firebaseIdToken", firebaseToken);
          localStorage.setItem("email", session.email || fbUser.email || "");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userId");
          localStorage.setItem("hasMemberProfile", "false");
          localStorage.setItem("role", "MEMBER");
          setUser({
            id: "",
            email: session.email || fbUser.email || "",
            role: "MEMBER",
            hasMemberProfile: false,
          });
        } else {
          // Fully registered user - apply the JWT session returned by backend.
          localStorage.removeItem("firebaseIdToken");
          localStorage.setItem("accessToken", session.accessToken || firebaseToken);
          if (session.refreshToken) localStorage.setItem("refreshToken", session.refreshToken);
          localStorage.setItem("email", session.email);
          localStorage.setItem("role", session.role || "MEMBER");
          localStorage.setItem("userId", session.userId || "");
          localStorage.setItem("hasMemberProfile", String(session.hasMemberProfile));
          // Use the JWT as the Authorization header
          if (session.accessToken) {
            api.defaults.headers.common.Authorization = `Bearer ${session.accessToken}`;
          }
          setUser({
            id: session.userId || "",
            email: session.email,
            role: session.role || "MEMBER",
            hasMemberProfile: session.hasMemberProfile,
          });
        }
      };

      const unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (pauseFirebaseSyncRef.current) return;
        try {
          if (fbUser?.email) {
            await syncFirebaseSession(fbUser);
          } else {
            setUser(null);
            localStorage.clear();
          }
        } catch (error) {
          setUser(null);
          localStorage.clear();
        } finally {
          setLoading(false);
        }
      });

      const unsubToken = onIdTokenChanged(auth, async (fbUser) => {
        if (fbUser) {
          const token = await fbUser.getIdToken(false);
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
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
      const hasProfile = localStorage.getItem("hasMemberProfile") === "true";
      if (token && email && role && userId) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        setUser({ id: userId, email, role, hasMemberProfile: hasProfile });
      }
      setLoading(false);
    }
  }, []);

  const refreshProfileStatus = async () => {
    try {
      const { data } = await api.post("/auth/status");
      localStorage.setItem("hasMemberProfile", String(data.hasMemberProfile));
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("email", data.email);
      
      setUser({ 
        id: data.userId, 
        email: data.email, 
        role: data.role, 
        hasMemberProfile: data.hasMemberProfile 
      });
    } catch (e) {
      console.error("Failed to refresh profile status", e);
    }
  };

  const login = async (email: string, password: string) => {
    if (provider === "firebase") {
      pauseFirebaseSyncRef.current = true;
      setLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        await refreshProfileStatus();
      } finally {
        pauseFirebaseSyncRef.current = false;
        setLoading(false);
      }
      return;
    }
    const { data } = await api.post("/auth/login", { email, password });
    const payload = JSON.parse(atob(data.accessToken.split(".")[1] || "{}"));
    applySession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      role: data.role,
      email,
      userId: payload.sub,
      hasMemberProfile: !!data.hasMemberProfile,
    });
  };

  const applySession = (data: {
    accessToken: string;
    refreshToken?: string;
    role: string;
    email: string;
    userId?: string;
    hasMemberProfile?: boolean;
  }) => {
    localStorage.setItem("accessToken", data.accessToken);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("email", data.email);
    localStorage.setItem("role", data.role);
    localStorage.setItem("hasMemberProfile", String(data.hasMemberProfile ?? false));
    const payload = JSON.parse(atob(data.accessToken.split(".")[1] || "{}"));
    const id = data.userId || payload.sub;
    localStorage.setItem("userId", id);
    api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
    setUser({
      id,
      email: data.email,
      role: data.role,
      hasMemberProfile: data.hasMemberProfile ?? false,
    });
  };

  const loginPortalAdmin = async (email: string, password: string, adminKey: string) => {
    const { data } = await api.post("/auth/admin/login", { email, password, adminKey });
    applySession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      role: data.role,
      email: data.email,
      userId: data.userId,
      hasMemberProfile: false,
    });
  };

  const loginAgent = async (username: string, password: string) => {
    const { data } = await api.post("/auth/agent/login", { username, password });
    applySession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      role: data.role,
      email: data.email || username,
      userId: data.userId,
      hasMemberProfile: false,
    });
  };

  const loginWithGoogle = async () => {
    if (provider === "firebase") {
      const googleProvider = new GoogleAuthProvider();
      await signInWithPopup(auth, googleProvider);
      await refreshProfileStatus();
    }
  };

  const loginAdminWithGoogle = async (secretKey: string) => {
    if (provider === "firebase") {
      const googleProvider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken(false);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem("accessToken", token);
      
      const { data } = await api.post("/auth/firebase/admin-access", { secretKey });
      
      localStorage.setItem("hasMemberProfile", String(data.hasMemberProfile));
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("email", data.email);
      
      setUser({ 
        id: data.userId, 
        email: data.email, 
        role: data.role, 
        hasMemberProfile: data.hasMemberProfile 
      });
    }
  };

  const register = async (payload: { email: string; password: string }) => {
    if (provider === "firebase") {
      try {
        await createUserWithEmailAndPassword(auth, payload.email, payload.password);
      } catch (err: any) {
        if (err?.code === 'auth/email-already-in-use') {
          try {
            await signInWithEmailAndPassword(auth, payload.email, payload.password);
          } catch (signInErr: any) {
            throw new Error('This email is already registered in Firebase. Please click "Log in" with your password or sign in with Google.');
          }
        } else {
          throw err;
        }
      }
    }
  };

  const resetPassword = async (email: string) => {
    if (provider === "firebase") {
      await sendPasswordResetEmail(auth, email);
    }
  };

  const logout = () => {
    if (provider === "firebase") signOut(auth);
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
        resetPassword,
        logout,
        refreshProfileStatus,
        loginPortalAdmin,
        loginAgent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
