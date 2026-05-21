import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/modules/login/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import LoginPage from "./modules/login/pages/LoginPage";
import LoanApply from "./pages/LoanApply";
import MemberDashboard from "./modules/member/pages/MemberDashboard";
import AdminDashboard from "./modules/admin/pages/AdminDashboard";
import AdminIndex from "./pages/AdminIndex";
import AdminLoginPage from "./modules/admin/pages/AdminLoginPage";
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
import LoanRequestsPage from "./modules/admin/pages/LoanRequestsPage";
import PigmyDashboard from "./modules/pigmy/pages/PigmyDashboard";
import AgentPigmyDashboard from "./modules/pigmy/pages/AgentPigmyDashboard";
import CustomerPigmyDashboard from "./modules/pigmy/pages/CustomerPigmyDashboard";
import PigmyHome from "./modules/pigmy/pages/PigmyHome";
import AddCustomer from "./modules/pigmy/pages/AddCustomer";
import MaturityProcess from "./modules/pigmy/pages/MaturityProcess";
import SignUpFlowPage from "./modules/member/pages/SignUpFlowPage";
import AgentLoginPage from "./modules/pigmy/pages/AgentLoginPage";
import RoleRoute from "./components/RoleRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes cache to avoid repeat fetches
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) {
    return <Navigate to={requireAdmin ? "/admin/login" : "/login"} />;
  }

  if (requireAdmin && !["ADMIN", "CEO"].includes(user.role)) {
    return <Navigate to={user.role === "AGENT" ? "/agent" : "/dashboard"} />;
  }

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
          <Route path="/admin" element={<AdminIndex />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/loans" element={<ProtectedRoute requireAdmin><LoanRequestsPage /></ProtectedRoute>} />
          <Route path="/admin/pigmy" element={<ProtectedRoute requireAdmin><PigmyDashboard /></ProtectedRoute>} />
          <Route path="/admin/pigmy/add-customer" element={<ProtectedRoute requireAdmin><AddCustomer /></ProtectedRoute>} />
          <Route path="/admin/pigmy/maturity" element={<ProtectedRoute requireAdmin><MaturityProcess /></ProtectedRoute>} />
          <Route path="/agent/login" element={<AgentLoginPage />} />
          <Route path="/agent" element={<RoleRoute roles={["AGENT"]} loginPath="/agent/login" fallbackPath="/pigmy"><AgentPigmyDashboard /></RoleRoute>} />
          <Route path="/agent/pigmy" element={<Navigate to="/agent" replace />} />
          <Route path="/dashboard/pigmy" element={<ProtectedRoute><CustomerPigmyDashboard /></ProtectedRoute>} />
          <Route path="/pigmy" element={<PigmyHome />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="/signup-flow" element={<ProtectedRoute><SignUpFlowPage /></ProtectedRoute>} />
          <Route path="/forgot-password" element={<LoginPage />} />
          <Route path="/loan-apply" element={<ProtectedRoute><LoanApply /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
          <Route path="/membership" element={<ProtectedRoute><MembershipPage /></ProtectedRoute>} />
          <Route path="/deposit-apply" element={<ProtectedRoute><DepositApplicationPage /></ProtectedRoute>} />
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
