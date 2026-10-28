import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft,
  Users,
  PiggyBank,
  HandCoins,
  CreditCard,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Receipt,
  Download,
  Info,
  Car,
  Home,
  Briefcase,
  X
} from 'lucide-react';
import api, { getDocUrl } from '@/lib/api';
import AdminNavbar from '@/components/AdminNavbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Loan Types Definition
const loanTypes = [
  { 
    id: 'surety', 
    name: 'Surety Loan', 
    rate: 13, 
    max: 23000, 
    desc: 'Affordable credit backed by trusted sureties. Verification depending on amount.',
    icon: ShieldCheck,
    color: 'border-blue-200 bg-blue-50/30 text-blue-600',
  },
  { 
    id: 'unsecured', 
    name: 'Unsecured Loan', 
    rate: 13, 
    max: 23000, 
    desc: 'No collateral required. Standard personal credit backed by two security guarantors.',
    icon: CreditCard,
    color: 'border-emerald-200 bg-emerald-50/30 text-emerald-600',
  },
  { 
    id: 'business', 
    name: 'Business Loan', 
    rate: 14, 
    max: 23000, 
    desc: 'Empower small businesses and entrepreneurs with capital support.',
    icon: Briefcase,
    color: 'border-amber-200 bg-amber-50/30 text-amber-600',
  },
  { 
    id: 'salary', 
    name: 'Salary Loan', 
    rate: 12.5, 
    max: 23000, 
    desc: 'Instant financial relief for salaried employees with transparent terms.',
    icon: TrendingUp,
    color: 'border-indigo-200 bg-indigo-50/30 text-indigo-600',
  },
  { 
    id: 'vehicle', 
    name: 'Vehicle Loan', 
    rate: 11.5, 
    max: 23000, 
    desc: 'Competitive rates and flexible EMIs for 2-wheeler and commercial vehicle purchases.',
    icon: Car,
    color: 'border-purple-200 bg-purple-50/30 text-purple-600',
  },
  { 
    id: 'home', 
    name: 'Home Loan', 
    rate: 9.5, 
    max: 23000, 
    desc: 'Low-interest financing for your dream home renovation or purchase.',
    icon: Home,
    color: 'border-rose-200 bg-rose-50/30 text-rose-600',
  }
];

// Deposit Schemes Definition
const depositSchemes = [
  { 
    id: 'fd-6m', 
    name: 'Fixed Deposit (6 Months)', 
    short: 'FD',
    rate: 6.2, 
    min: 1000, 
    max: 10000000,
    type: 'Fixed',
    tenure: 6,
    desc: 'Short-term secure deposit with guaranteed 6.2% p.a. returns.',
    color: 'border-purple-200 bg-purple-50/30 text-purple-600'
  },
  { 
    id: 'fd-1y', 
    name: 'Fixed Deposit (1 Year)', 
    short: 'FD',
    rate: 7.5, 
    min: 1000, 
    max: 10000000,
    type: 'Fixed',
    tenure: 12,
    desc: 'Popular annual fixed deposit compounding higher savings yields.',
    color: 'border-blue-200 bg-blue-50/30 text-blue-600'
  },
  { 
    id: 'fd-5y', 
    name: 'Fixed Deposit (5 Years)', 
    short: 'FD',
    rate: 8.5, 
    min: 5000, 
    max: 10000000,
    type: 'Fixed',
    tenure: 60,
    desc: 'Long-term wealth creator offering an optimal 8.5% interest return.',
    color: 'border-emerald-200 bg-emerald-50/30 text-emerald-600'
  },
  { 
    id: 'rd-1y', 
    name: 'Recurring Deposit (1 Year)', 
    short: 'RD',
    rate: 7.0, 
    min: 500, 
    max: 100000,
    type: 'Recurring',
    tenure: 12,
    desc: 'Systematic monthly saving plan with assured interest accumulation.',
    color: 'border-amber-200 bg-amber-50/30 text-amber-600'
  },
  { 
    id: 'sb-gen', 
    name: 'Cooperative Savings Account', 
    short: 'SAVINGS',
    rate: 4.0, 
    min: 500, 
    max: 5000000,
    type: 'Savings',
    tenure: 0,
    desc: 'Flexible liquidity savings with continuous cooperative interest credit.',
    color: 'border-teal-200 bg-teal-50/30 text-teal-600'
  }
];

export default function ShareholderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'pigmy' | 'loans' | 'deposits'>('pigmy');

  // Modals state
  const [isPigmyModalOpen, setIsPigmyModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // Pigmy Entry Form
  const [selectedPigmySchemeId, setSelectedPigmySchemeId] = useState('');
  const [pigmyInitialDeposit, setPigmyInitialDeposit] = useState('500');
  const [pigmyStartDate, setPigmyStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [pigmyEndDate, setPigmyEndDate] = useState('');
  const [pigmyMonthlyDate, setPigmyMonthlyDate] = useState('5');
  const [pigmySubmitting, setPigmySubmitting] = useState(false);

  // Loan Entry Form
  const [selectedLoanType, setSelectedLoanType] = useState(loanTypes[0].id);
  const [loanAmount, setLoanAmount] = useState('15000');
  const [loanTenure, setLoanTenure] = useState('12');
  const [loanPurpose, setLoanPurpose] = useState('Personal / Household needs');
  const [loanStartDate, setLoanStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loanEndDate, setLoanEndDate] = useState('');
  const [loanMonthlyPaymentDate, setLoanMonthlyPaymentDate] = useState('10');
  const [loanSubmitting, setLoanSubmitting] = useState(false);

  // Deposit Entry Form
  const [selectedDepositScheme, setSelectedDepositScheme] = useState(depositSchemes[1].id);
  const [depositAmount, setDepositAmount] = useState('10000');
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('');
  const [depositSubmitting, setDepositSubmitting] = useState(false);

  // 1. Fetch Shareholder Data & Related Financial History
  const { data: shareholder, isLoading, error } = useQuery({
    queryKey: ['admin-shareholder-detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/shareholders/${id}`);
      return data;
    },
    enabled: !!id
  });

  // 2. Fetch Active Pigmy Schemes
  const { data: pigmySchemes = [] } = useQuery({
    queryKey: ['pigmy-schemes-list'],
    queryFn: async () => {
      const { data } = await api.get('/pigmy/schemes');
      return Array.isArray(data) ? data : [];
    }
  });

  // Target member/user ID
  const member = shareholder?.member;
  const targetId = member?.id || member?.userId || shareholder?.id;

  // Handle Create Pigmy Enrollment
  const handleEnrollPigmy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPigmySchemeId) {
      toast.error('Please select a Pigmy scheme');
      return;
    }
    setPigmySubmitting(true);
    try {
      await api.post('/pigmy/enroll', {
        memberId: targetId,
        schemeId: selectedPigmySchemeId,
        initialDeposit: pigmyInitialDeposit ? parseFloat(pigmyInitialDeposit) : 0,
        startDate: pigmyStartDate ? new Date(pigmyStartDate).toISOString() : new Date().toISOString(),
        endDate: pigmyEndDate ? new Date(pigmyEndDate).toISOString() : undefined,
        monthlyPaymentDate: pigmyMonthlyDate ? parseInt(pigmyMonthlyDate) : 5,
        registeredId: member?.memberId || shareholder?.membershipReceiptNo || `SH-${shareholder?.slNo || 'REC'}`
      });
      toast.success('Pigmy account enrolled & activated immediately without approval!');
      setIsPigmyModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-shareholder-detail', id] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to enroll Pigmy account');
    } finally {
      setPigmySubmitting(false);
    }
  };

  // Handle Create Loan
  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const lType = loanTypes.find(t => t.id === selectedLoanType);
    if (!loanAmount || Number(loanAmount) <= 0) {
      toast.error('Please enter a valid loan amount');
      return;
    }
    if (Number(loanAmount) > 23000) {
      toast.error('Maximum loan limit is ₹23,000');
      return;
    }

    setLoanSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('targetUserId', member?.userId || targetId);
      formData.append('targetMemberId', member?.id || targetId);
      formData.append('type', lType?.name || 'Personal Loan');
      formData.append('amount', loanAmount.toString());
      formData.append('interestRate', (lType?.rate || 13).toString());
      formData.append('termMonths', loanTenure.toString());
      formData.append('purpose', loanPurpose);
      formData.append('startDate', loanStartDate ? new Date(loanStartDate).toISOString() : new Date().toISOString());
      
      const calcEndDate = loanEndDate 
        ? new Date(loanEndDate) 
        : new Date(new Date(loanStartDate).setMonth(new Date(loanStartDate).getMonth() + parseInt(loanTenure)));
      formData.append('endDate', calcEndDate.toISOString());
      formData.append('monthlyPaymentDate', loanMonthlyPaymentDate);
      formData.append('registeredId', member?.memberId || shareholder?.membershipReceiptNo || `SH-${shareholder?.slNo || 'REC'}`);

      await api.post('/loans/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Loan created and activated instantly with full EMI schedule!');
      setIsLoanModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-shareholder-detail', id] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create loan application');
    } finally {
      setLoanSubmitting(false);
    }
  };

  // Handle Create Deposit
  const handleCreateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dScheme = depositSchemes.find(s => s.id === selectedDepositScheme);
    if (!depositAmount || Number(depositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }
    if (dScheme && Number(depositAmount) < dScheme.min) {
      toast.error(`Minimum amount for this scheme is ₹${dScheme.min.toLocaleString()}`);
      return;
    }

    setDepositSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('targetUserId', member?.userId || targetId);
      formData.append('targetMemberId', member?.id || targetId);
      formData.append('type', dScheme?.short || 'FD');
      formData.append('amount', depositAmount.toString());
      formData.append('interestRate', (dScheme?.rate || 7.5).toString());
      formData.append('termMonths', (dScheme?.tenure || 12).toString());
      formData.append('registeredId', member?.memberId || shareholder?.membershipReceiptNo || `SH-${shareholder?.slNo || 'REC'}`);
      
      const details = {
        schemeName: dScheme?.name,
        nomineeName: nomineeName || 'Not specified',
        nomineeRelation: nomineeRelation || 'Nominee',
        payoutFrequency: 'ON_MATURITY',
        depositCreatedBy: 'ADMIN'
      };
      formData.append('additionalDetails', JSON.stringify(details));

      await api.post('/deposits', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Deposit account created and opened immediately without approval!');
      setIsDepositModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-shareholder-detail', id] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to open deposit');
    } finally {
      setDepositSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <AdminNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading shareholder profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !shareholder) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <AdminNavbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Shareholder Not Found</h3>
            <p className="text-xs text-slate-500">The requested shareholder record could not be loaded or may have been deleted.</p>
            <Button onClick={() => navigate('/admin/shareholders')} className="bg-[#1a1f36] text-white rounded-xl">
              Back to Shareholders
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Related Financial Records from matched member
  const loans = member?.loans || [];
  const pigmyAccounts = member?.pigmyAccounts || [];
  const depositAccounts = member?.depositAccounts || [];
  const depositApplications = member?.depositApplications || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      <AdminNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/shareholders')}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm"
              title="Back to Shareholders list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a84c] px-2.5 py-0.5 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20">
                  Shareholder Record #{shareholder.slNo}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Receipt: {shareholder.membershipReceiptNo || 'N/A'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {shareholder.memberName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
              {shareholder.category || 'General'}
            </span>
            <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs border border-purple-100">
              Shares: {shareholder.noOfShares || 1} (₹{Number(shareholder.totalShareAmount || 500).toLocaleString()})
            </span>
          </div>
        </div>

        {/* Shareholder Profile Summary Card */}
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Relation & Age</p>
            <p className="text-sm font-bold text-slate-800">{shareholder.relation || '—'}</p>
            <p className="text-xs text-slate-500">Age: {shareholder.age || 'N/A'} • Caste: {shareholder.casteClass || 'General'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Contact & Phone</p>
            <p className="text-sm font-bold font-mono text-slate-800">{shareholder.phone || 'No phone provided'}</p>
            <p className="text-xs text-slate-500 truncate" title={shareholder.address}>{shareholder.address || '—'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">DCC Remittance</p>
            <p className="text-sm font-bold text-slate-800">{shareholder.dateRemittedToDccBank || '—'}</p>
            <p className="text-xs text-slate-500">Receipt Date: {shareholder.receiptDate || '—'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Capital Collected</p>
            <p className="text-lg font-black text-emerald-600">₹{Number(shareholder.grandTotal || 650).toLocaleString()}</p>
            <p className="text-[11px] text-slate-400">Fee: ₹{shareholder.shareFee || 100} • Entry: ₹{shareholder.entranceFee || 50}</p>
          </div>
        </div>

        {/* 3 Main Financial Options / Tabs (Pigmy, Loans, Deposits) */}
        <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-sm flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('pigmy')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'pigmy'
                ? 'bg-[#1a1f36] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <PiggyBank className="w-5 h-5 text-amber-400" />
            <span>Pigmy ({pigmyAccounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('loans')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'loans'
                ? 'bg-[#1a1f36] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <HandCoins className="w-5 h-5 text-emerald-400" />
            <span>Loans ({loans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deposits')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'deposits'
                ? 'bg-[#1a1f36] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-5 h-5 text-blue-400" />
            <span>Deposits ({depositAccounts.length + depositApplications.length})</span>
          </button>
        </div>

        {/* TAB 1: PIGMY SECTION */}
        {activeTab === 'pigmy' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Pigmy Accounts & History</h3>
                <p className="text-xs text-slate-500">Manage daily, weekly, and monthly Pigmy schemes enrolled for this shareholder.</p>
              </div>

              <Button
                onClick={() => {
                  if (pigmySchemes.length > 0 && !selectedPigmySchemeId) {
                    setSelectedPigmySchemeId(pigmySchemes[0].id);
                  }
                  setIsPigmyModalOpen(true);
                }}
                className="bg-[#c9a84c] hover:bg-[#b5953f] text-slate-900 font-bold text-xs h-10 px-5 rounded-xl shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Enroll Pigmy Scheme</span>
              </Button>
            </div>

            {/* Existing Pigmy Accounts List */}
            {pigmyAccounts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-4">
                <PiggyBank className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700">No Active Pigmy Accounts</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  This shareholder currently has no active Pigmy deposits enrolled. Click "+ Enroll Pigmy Scheme" above to enroll them.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pigmyAccounts.map((acc: any) => (
                  <div key={acc.id} className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                          <PiggyBank className="w-5 h-5" />
                        </span>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{acc.scheme?.name || 'Standard Pigmy'}</p>
                          <p className="text-[11px] font-mono text-slate-400">A/C: {acc.accountNumber}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        acc.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {acc.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Type</p>
                        <p className="font-bold text-slate-800">{acc.scheme?.type || 'DAILY'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Total Saved</p>
                        <p className="font-bold text-emerald-600">
                          ₹{(acc.collections || []).reduce((sum: number, c: any) => sum + (c.amount || 0), 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Interest</p>
                        <p className="font-bold text-blue-600">{acc.scheme?.interestRate || 3.5}%</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Recent Collections</p>
                      {(acc.collections || []).length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No deposit entries recorded yet.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                          {acc.collections.slice(0, 5).map((col: any) => (
                            <div key={col.id} className="flex justify-between items-center text-xs py-1 border-b border-slate-100">
                              <span className="text-slate-500 font-mono">
                                {col.date ? new Date(col.date).toLocaleDateString('en-IN') : 'Recent'}
                              </span>
                              <span className="font-bold text-slate-800">₹{Number(col.amount).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LOANS SECTION */}
        {activeTab === 'loans' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Loan Applications & History</h3>
                <p className="text-xs text-slate-500">Create, review, and track personal loans, surety, vehicle, and business advances.</p>
              </div>

              <Button
                onClick={() => setIsLoanModalOpen(true)}
                className="bg-[#1a1f36] hover:bg-black text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#c9a84c]" />
                <span>+ Apply / Create Loan</span>
              </Button>
            </div>

            {/* Existing Loans List */}
            {loans.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-4">
                <HandCoins className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700">No Loans on Record</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  This shareholder does not have any active or past loan applications. Click "+ Apply / Create Loan" to create one.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {loans.map((loan: any) => (
                  <div key={loan.id} className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <HandCoins className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{loan.type || 'Personal Loan'}</p>
                          <p className="text-xs text-slate-400 font-mono">App No: {loan.applicationNo || loan.id}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          loan.status === 'APPROVED' || loan.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : loan.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {loan.status}
                        </span>
                        <span className="text-lg font-black text-slate-900">
                          ₹{Number(loan.amount).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Interest Rate</p>
                        <p className="font-bold text-slate-800">{loan.interestRate}% p.a.</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Tenure</p>
                        <p className="font-bold text-slate-800">{loan.termMonths} Months</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Monthly EMI</p>
                        <p className="font-bold text-indigo-600">
                          ₹{Math.round((Number(loan.amount) + (Number(loan.amount) * (loan.interestRate / 100) * (loan.termMonths / 12))) / (loan.termMonths || 12)).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Payment Due Day</p>
                        <p className="font-bold text-slate-800">{loan.monthlyPaymentDate || 10}th of month</p>
                      </div>
                    </div>

                    {/* EMI schedule preview */}
                    {loan.emiSchedule && loan.emiSchedule.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                          EMI Schedule ({loan.emiSchedule.length} Installments)
                        </p>
                        <div className="max-h-36 overflow-y-auto space-y-1">
                          {loan.emiSchedule.slice(0, 6).map((emi: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-xs py-1 px-3 rounded-lg bg-slate-50/50">
                              <span className="font-mono text-slate-500">EMI #{emi.installmentNo || idx + 1}</span>
                              <span className="text-slate-600">Due: {emi.dueDate ? new Date(emi.dueDate).toLocaleDateString('en-IN') : 'N/A'}</span>
                              <span className="font-bold text-slate-900">₹{Number(emi.emiAmount).toLocaleString()}</span>
                              <span className={`text-[10px] font-bold uppercase ${emi.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {emi.status || 'PENDING'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DEPOSITS SECTION */}
        {activeTab === 'deposits' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Deposit Accounts & Applications</h3>
                <p className="text-xs text-slate-500">Open Fixed Deposits (FD), Recurring Deposits (RD), or Savings Accounts.</p>
              </div>

              <Button
                onClick={() => setIsDepositModalOpen(true)}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Open / Create Deposit</span>
              </Button>
            </div>

            {/* Deposits List */}
            {depositAccounts.length === 0 && depositApplications.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-4">
                <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700">No Deposits on Record</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  This shareholder has no active deposit accounts or applications. Click "+ Open / Create Deposit" to register one.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {depositAccounts.map((acc: any) => (
                  <div key={acc.id} className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                          <CreditCard className="w-5 h-5" />
                        </span>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{acc.type || 'Fixed Deposit'}</p>
                          <p className="text-[11px] font-mono text-slate-400">A/C: {acc.accountNumber}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {acc.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Deposit Amount</p>
                        <p className="font-black text-slate-900">₹{Number(acc.amount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Interest Rate</p>
                        <p className="font-bold text-purple-700">{acc.interestRate || 7.5}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Term</p>
                        <p className="font-bold text-slate-800">{acc.termMonths || 12} Months</p>
                      </div>
                    </div>
                  </div>
                ))}

                {depositApplications.map((app: any) => (
                  <div key={app.id} className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
                          <Clock className="w-5 h-5" />
                        </span>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{app.type || 'Deposit Application'}</p>
                          <p className="text-[11px] font-mono text-slate-400">App: {app.applicationNo}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Amount</p>
                        <p className="font-black text-slate-900">₹{Number(app.amount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Rate</p>
                        <p className="font-bold text-blue-700">{app.interestRate}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Tenure</p>
                        <p className="font-bold text-slate-800">{app.termMonths} Months</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODAL 1: ENROLL PIGMY SCHEME */}
      <Dialog open={isPigmyModalOpen} onOpenChange={setIsPigmyModalOpen}>
        <DialogContent className="max-w-xl bg-white rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <PiggyBank className="w-6 h-6 text-amber-500" />
              <span>Enroll Pigmy Deposit for {shareholder.memberName}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Select Pigmy scheme category, starting date, and payment intervals. Saved to shareholder's history.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEnrollPigmy} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Choose Pigmy Scheme & Subtype</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {pigmySchemes.map((scheme: any) => (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => setSelectedPigmySchemeId(scheme.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedPigmySchemeId === scheme.id
                        ? 'border-[#c9a84c] bg-[#c9a84c]/10 text-slate-900 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <p className="font-bold text-xs">{scheme.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">{scheme.type}</p>
                    <p className="text-xs font-black text-amber-600 mt-1">{scheme.interestRate}% p.a.</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Initial Deposit (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={pigmyInitialDeposit}
                  onChange={(e) => setPigmyInitialDeposit(e.target.value)}
                  className="rounded-xl text-xs font-bold"
                  placeholder="e.g. 500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Start Date</Label>
                <Input
                  type="date"
                  value={pigmyStartDate}
                  onChange={(e) => setPigmyStartDate(e.target.value)}
                  className="rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Collection Day (Monthly)</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={pigmyMonthlyDate}
                  onChange={(e) => setPigmyMonthlyDate(e.target.value)}
                  className="rounded-xl text-xs"
                  placeholder="e.g. 5"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPigmyModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={pigmySubmitting}
                className="bg-[#1a1f36] hover:bg-black text-white rounded-xl text-xs font-bold"
              >
                {pigmySubmitting ? 'Enrolling...' : 'Confirm & Save to Shareholder'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: CREATE LOAN */}
      <Dialog open={isLoanModalOpen} onOpenChange={setIsLoanModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <HandCoins className="w-6 h-6 text-emerald-500" />
              <span>Create Loan for {shareholder.memberName}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Apply a loan product with automated interest calculation, tenure, and monthly EMI schedule.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLoan} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Select Loan Subtype / Category</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {loanTypes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = selectedLoanType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedLoanType(t.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 text-slate-900 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-xs">{t.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">{t.rate}% p.a. • Max ₹23k</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Loan Amount (Max ₹23,000)</Label>
                <Input
                  type="number"
                  max="23000"
                  min="1000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Tenure (Months)</Label>
                <select
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 font-bold outline-none"
                >
                  <option value="6">6 Months</option>
                  <option value="12">12 Months (1 Year)</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months (2 Years)</option>
                  <option value="36">36 Months (3 Years)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Monthly Payment Day</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={loanMonthlyPaymentDate}
                  onChange={(e) => setLoanMonthlyPaymentDate(e.target.value)}
                  className="rounded-xl text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Disbursement / Start Date</Label>
                <Input
                  type="date"
                  value={loanStartDate}
                  onChange={(e) => setLoanStartDate(e.target.value)}
                  className="rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Loan Purpose</Label>
                <Input
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                  className="rounded-xl text-xs"
                  placeholder="e.g. Household renovation"
                />
              </div>
            </div>

            {/* Repayment Summary Box */}
            {(() => {
              const lType = loanTypes.find(t => t.id === selectedLoanType);
              const principal = Number(loanAmount) || 0;
              const rate = lType?.rate || 13;
              const months = parseInt(loanTenure) || 12;
              const interest = (principal * rate * (months / 12)) / 100;
              const totalRepay = principal + interest;
              const emi = Math.round(totalRepay / months);

              return (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-700">Estimated Monthly EMI</span>
                    <p className="text-xl font-black text-emerald-800">₹{emi.toLocaleString()}</p>
                  </div>
                  <div className="text-right text-[11px] text-emerald-700">
                    <p>Total Interest: ₹{Math.round(interest).toLocaleString()}</p>
                    <p className="font-bold">Total Repayable: ₹{Math.round(totalRepay).toLocaleString()}</p>
                  </div>
                </div>
              );
            })()}

            <DialogFooter className="pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLoanModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loanSubmitting}
                className="bg-[#1a1f36] hover:bg-black text-white rounded-xl text-xs font-bold"
              >
                {loanSubmitting ? 'Submitting...' : 'Save Loan to Shareholder History'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: CREATE DEPOSIT */}
      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-purple-600" />
              <span>Open Deposit Account for {shareholder.memberName}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Select deposit subtype (FD, RD, Savings), principal amount, and nominee details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDeposit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Select Deposit Scheme & Subtype</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {depositSchemes.map((s) => {
                  const isSelected = selectedDepositScheme === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedDepositScheme(s.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/50 text-slate-900 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <p className="font-bold text-xs text-slate-800">{s.name}</p>
                      <p className="text-[10px] text-purple-700 font-black mt-1">
                        {s.rate}% p.a. • {s.tenure > 0 ? `${s.tenure} Months` : 'Ongoing'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Min: ₹{s.min.toLocaleString()}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Deposit Amount (₹)</Label>
              <Input
                type="number"
                min="500"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="rounded-xl text-xs font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Nominee Full Name</Label>
                <Input
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  className="rounded-xl text-xs"
                  placeholder="e.g. Smt. Lakshmi"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Nominee Relationship</Label>
                <Input
                  value={nomineeRelation}
                  onChange={(e) => setNomineeRelation(e.target.value)}
                  className="rounded-xl text-xs"
                  placeholder="e.g. Spouse / Son / Daughter"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDepositModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={depositSubmitting}
                className="bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold"
              >
                {depositSubmitting ? 'Opening Deposit...' : 'Confirm & Save to Shareholder'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
