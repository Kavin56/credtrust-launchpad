import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";
import { SignupForm } from "../components/SignupForm";
import { AdminLoginForm } from "../components/AdminLoginForm";
import { motion, AnimatePresence } from "framer-motion";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<"login" | "signup" | "admin">("login");

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") setAuthMode("signup");
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white font-sans overflow-hidden flex flex-col lg:flex-row">
      {/* LEFT SECTION (Form) */}
      <div className="w-full lg:w-[40%] flex flex-col p-6 lg:px-12 lg:py-10 relative z-10 max-h-screen overflow-y-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 lg:mb-12 scale-90 origin-left shrink-0">
          <div className="w-10 h-10 bg-[#2563eb] rounded-lg flex items-center justify-center text-white font-bold text-xl">E</div>
          <span className="text-2xl font-bold text-[#1a1f36]">CredTrust</span>
        </Link>

        {/* Dynamic Form Area */}
        <div className="flex-grow flex items-start mb-8 lg:mb-10 min-h-0">
          <AnimatePresence mode="wait">
            {authMode === "login" && (
              <LoginForm 
                key="login" 
                onToggleForm={() => setAuthMode("signup")} 
                onAdminMode={() => setAuthMode("admin")}
              />
            )}
            {authMode === "signup" && (
              <SignupForm 
                key="signup" 
                onToggleForm={() => setAuthMode("login")} 
              />
            )}
            {authMode === "admin" && (
              <AdminLoginForm 
                key="admin" 
                onBack={() => setAuthMode("login")} 
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer Links */}
        <div className="flex gap-6 text-xs text-gray-400 font-medium shrink-0 mt-auto pt-6">
          <a href="#" className="hover:text-gray-600">Terms of Service</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-600">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-600">Security</a>
        </div>
      </div>

      {/* RIGHT SECTION (Visual Panel) */}
      <div className="hidden lg:flex w-[60%] bg-gray-50 p-6 items-center justify-center">
        <div className="w-full h-full bg-[#fcd34d] rounded-[48px] relative overflow-hidden flex flex-col p-12 lg:p-16 shadow-2xl">
          {/* Badge */}
          <div className="mb-6">
            <span className="bg-transparent text-[11px] font-bold px-3 py-1 rounded-full border border-black/10 uppercase tracking-widest text-black/40">
              NEW
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-5xl xl:text-6xl font-bold text-[#1a1f36] leading-[1.05] tracking-tight mb-12 max-w-xl">
            Manage your credits <br /> across your favorite <br /> platforms
          </h2>

          {/* Illustration Mockup */}
          <div className="relative mt-8 px-12">
            <div className="bg-white rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-1 border border-black/5 w-full max-w-lg mx-auto">
              {/* Browser bar */}
              <div className="flex gap-2 mb-2 p-4">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              
              {/* Content Rows */}
              <div className="space-y-6 p-6 pt-0 pb-12">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-[#edf2ff] shrink-0" />
                    <div className="flex-grow space-y-3">
                      <div className="h-3 bg-[#edf2ff] rounded-full w-full" />
                      <div className="h-3 bg-[#f1f5f9] rounded-full w-2/3 opacity-50" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hand-drawn arrow annotation */}
            <div className="absolute top-0 right-[15%] translate-y-[-110%] hidden xl:block">
              <div className="flex flex-col items-center">
                <span className="text-sm font-handwriting italic text-[#1a1f36] whitespace-nowrap mb-1">
                  and track your consistency
                </span>
                <div className="relative w-16 h-8 translate-x-2">
                  <svg className="w-full h-full text-[#1a1f36] opacity-40 -scale-x-100 rotate-[5deg]" viewBox="0 0 100 50">
                    <path 
                      d="M10,40 C40,45 60,30 85,5" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                    <path 
                      d="M75,5 L85,5 L85,15" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeJoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Background Highlight */}
          <div className="absolute -bottom-20 -right-20 w-[60%] h-[60%] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
