import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/modules/auth/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthPage from "./modules/auth/pages/AuthPage";
import LoanApply from "./pages/LoanApply";
import MemberDashboard from "./modules/member/pages/MemberDashboard";
import AdminDashboard from "./modules/admin/pages/AdminDashboard";
import KYCForm from "./modules/member/components/KYCForm";
import ProfilePage from "./modules/member/pages/ProfilePage";
import AccountsPage from "./modules/member/pages/AccountsPage";
import MembershipPage from "./modules/member/pages/MembershipPage";
import DepositApplicationPage from "./modules/member/pages/DepositApplicationPage";
import LoanApplicationPage from "./modules/member/pages/LoanApplicationPage";
import PaymentsPage from "./modules/member/pages/PaymentsPage";
import InvestmentsPage from "./modules/member/pages/InvestmentsPage";
import InsurancePage from "./modules/member/pages/InsurancePage";
import CardsPage from "./modules/member/pages/CardsPage";
import ServicesPage from "./modules/member/pages/ServicesPage";
import ProductDetailPage from "./modules/member/pages/ProductDetailPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;
  
  // For now, any user can access member dashboard. 
  // Admin check can be added later via Supabase roles.
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/loan-apply" element={<ProtectedRoute><LoanApply /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
          <Route path="/membership" element={<ProtectedRoute><MembershipPage /></ProtectedRoute>} />
          <Route path="/deposit-apply" element={<ProtectedRoute><DepositApplicationPage /></ProtectedRoute>} />
          <Route path="/loan-apply" element={<ProtectedRoute><LoanApplicationPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
          <Route path="/investments" element={<ProtectedRoute><InvestmentsPage /></ProtectedRoute>} />
          <Route path="/insurance" element={<ProtectedRoute><InsurancePage /></ProtectedRoute>} />
          <Route path="/cards" element={<ProtectedRoute><CardsPage /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
          <Route path="/product/:category/:slug" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
          <Route path="/kyc" element={<ProtectedRoute><KYCForm /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
