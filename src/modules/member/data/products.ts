import { 
  Activity, 
  Briefcase, 
  PiggyBank, 
  Wallet, 
  ShieldCheck, 
  TrendingUp, 
  HeartPulse, 
  Car, 
  Umbrella, 
  Info, 
  CreditCard, 
  MonitorSmartphone, 
  Globe2, 
  Smartphone, 
  Settings, 
  Percent, 
  FileText, 
  Lock,
  Landmark,
  User,
  GraduationCap,
  Gem,
  HandCoins,
  Calendar,
  Zap,
  BadgePercent,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCheck
} from 'lucide-react';

export type Product = {
  id: string;
  category: 'Investments' | 'Loans' | 'Deposits' | 'Insurance' | 'Cards' | 'Services';
  title: string;
  icon: any;
  slug: string;
  desc: string;
  theme: string;
  accent: string;
  benefits: string[];
  eligibility: string[];
  cta: string;
  ctaPath: string;
};

export const products: Record<string, Product> = {
  // INVESTMENTS
  'mutual-funds': {
    id: 'inv-1',
    category: 'Investments',
    title: 'Mutual Funds',
    icon: Activity,
    slug: 'mutual-funds',
    desc: 'Grow your wealth with diversified portfolios managed by experts.',
    theme: 'bg-purple-600',
    accent: 'text-purple-600',
    benefits: [
      'Expert fund management',
      'SIP starting at ₹500',
      'Tax-saving ELSS options available',
      'Instant redemption for liquid funds'
    ],
    eligibility: ['Min. Age: 18 years', 'Valid PAN & KYC documents', 'Active Net-Banking account'],
    cta: 'Explore Funds',
    ctaPath: '/investments'
  },
  'nps': {
    id: 'inv-2',
    category: 'Investments',
    title: 'NPS',
    icon: PiggyBank,
    slug: 'nps',
    desc: 'Secure your retirement with the National Pension System.',
    theme: 'bg-amber-600',
    accent: 'text-amber-600',
    benefits: [
      'Additional tax benefit under 80CCD',
      'Choice of equity and debt allocation',
      'Low cost investment structure',
      'Market-linked long term returns'
    ],
    eligibility: ['Age: 18-70 years', 'Indian Citizen', 'KYC Compliance'],
    cta: 'Open NPS Account',
    ctaPath: '/investments'
  },
  'ppf': {
    id: 'inv-3',
    category: 'Investments',
    title: 'PPF',
    icon: Wallet,
    slug: 'ppf',
    desc: 'Public Provident Fund - Safe, long-term tax-free savings.',
    theme: 'bg-emerald-600',
    accent: 'text-emerald-600',
    benefits: [
      'Tax-free interest (EEE status)',
      'Sovereign guarantee on capital',
      '15-year maturity with extension',
      'Partial withdrawal after 7 years'
    ],
    eligibility: ['Indian Resident', 'One account per individual', 'Minor accounts allowed'],
    cta: 'Apply for PPF',
    ctaPath: '/investments'
  },
  'demat': {
    id: 'inv-4',
    category: 'Investments',
    title: 'Demat & Securities',
    icon: Briefcase,
    slug: 'demat',
    desc: 'Trade equities, bonds, and ETFs with our secure Demat platform.',
    theme: 'bg-blue-600',
    accent: 'text-blue-600',
    benefits: [
      'Zero account opening fee',
      'Integrated 3-in-1 account',
      'Real-time market analysis',
      'Low brokerage charges'
    ],
    eligibility: ['Valid PAN & Aadhaar', 'Bank account link', 'KYC Verified'],
    cta: 'Open Demat',
    ctaPath: '/investments'
  },

  // LOANS
  'personal-loan': {
    id: 'loan-1',
    category: 'Loans',
    title: 'Personal Loan',
    icon: User,
    slug: 'personal-loan',
    desc: 'Instant funds for your personal needs with minimal documentation.',
    theme: 'bg-[#1a1f36]',
    accent: 'text-[#1a1f36]',
    benefits: [
      'Instant approval up to ₹25 Lakhs',
      'Flexible tenure up to 60 months',
      'Competitive interest rates',
      'No collateral required'
    ],
    eligibility: ['Min. Salary: ₹25,000', 'Stability: 1 year in job', 'CIBIL Score: 750+'],
    cta: 'Apply Now',
    ctaPath: '/loan-apply'
  },
  'unsecured-loan': {
    id: 'loan-5',
    category: 'Loans',
    title: 'Unsecured Loan',
    icon: User,
    slug: 'unsecured-loan',
    desc: 'Instant personal loan matching your monthly salary slips and credit score with 2 security guarantors.',
    theme: 'bg-purple-600',
    accent: 'text-purple-600',
    benefits: [
      'Flexible tenure up to 60 months',
      'Competitive interest rates',
      'No collateral required, backed by 2 sureties',
      'Submit guarantor details manually'
    ],
    eligibility: ['Min. Salary: ₹25,000', '2 Guarantors with valid Aadhaar', 'CIBIL Score: 750+'],
    cta: 'Apply Now',
    ctaPath: '/loan-apply'
  },
  'vehicle-loan': {
    id: 'loan-6',
    category: 'Loans',
    title: 'Vehicle Loan',
    icon: Car,
    slug: 'vehicle-loan',
    desc: 'Fulfill your transit needs. Competitive rates on cars, commercial, or two-wheelers with manual uploading.',
    theme: 'bg-amber-500',
    accent: 'text-amber-500',
    benefits: [
      'Up to 90% vehicle invoice funding',
      'Flexible tenure up to 60 months',
      'Manual document uploading option',
      'Simple process with 2 security guarantors'
    ],
    eligibility: ['Min. Salary: ₹20,000', '2 Guarantors with valid Aadhaar', 'Vehicle details required'],
    cta: 'Apply Now',
    ctaPath: '/loan-apply'
  },
  'home-loan': {
    id: 'loan-3',
    category: 'Loans',
    title: 'Home Loan',
    icon: Landmark,
    slug: 'home-loan',
    desc: 'Step into your dream home with our affordable home finance.',
    theme: 'bg-indigo-600',
    accent: 'text-indigo-600',
    benefits: [
      'Tenure up to 30 years',
      'PMAY subsidy benefits',
      'Digital document processing',
      'No hidden charges'
    ],
    eligibility: ['Regular Income source', 'Age: 21-65 years', 'Property verification'],
    cta: 'Check Eligibility',
    ctaPath: '/loan-apply'
  },
  'gold-loan': {
    id: 'loan-4',
    category: 'Loans',
    title: 'Gold Loan',
    icon: Gem,
    slug: 'gold-loan',
    desc: 'Unlock the value of your gold for instant cash needs.',
    theme: 'bg-amber-500',
    accent: 'text-amber-500',
    benefits: [
      'Approval in 30 minutes',
      'Best LTV (Loan-to-Value)',
      'Overdraft facility available',
      'Safe locker storage'
    ],
    eligibility: ['Gold Purity: 18K+', 'Valid ID proof', 'Min. 10g Gold'],
    cta: 'Apply for Gold Loan',
    ctaPath: '/loan-apply'
  },

  // DEPOSITS
  'fixed-deposit': {
    id: 'dep-1',
    category: 'Deposits',
    title: 'Fixed Deposit',
    icon: ShieldCheck,
    slug: 'fixed-deposit',
    desc: 'Highest safety and guaranteed returns for your savings.',
    theme: 'bg-rose-600',
    accent: 'text-rose-600',
    benefits: [
      'High interest rates',
      'Senior Citizen benefits (+0.50%)',
      'Monthly/Quarterly payout options',
      'Loan against FD available'
    ],
    eligibility: ['Min. Deposit: ₹1,000', 'Tenure: 7 days to 10 years', 'KYC Compliance'],
    cta: 'Open FD',
    ctaPath: '/deposit-apply'
  },
  'recurring-deposit': {
    id: 'dep-2',
    category: 'Deposits',
    title: 'Recurring Deposit',
    icon: Calendar,
    slug: 'recurring-deposit',
    desc: 'Build your savings habit with regular monthly deposits.',
    theme: 'bg-violet-600',
    accent: 'text-violet-600',
    benefits: [
      'Disciplined savings',
      'Interest same as FD',
      'Instalments from ₹100',
      'Standing instruction facility'
    ],
    eligibility: ['Active Savings Account', 'Regular monthly income', 'Min. 6 months tenure'],
    cta: 'Start RD',
    ctaPath: '/deposit-apply'
  },

  // SERVICES
  'account-services': {
    id: 'ser-1',
    category: 'Services',
    title: 'Account Related',
    icon: Settings,
    slug: 'account-services',
    desc: 'Manage your primary account settings and certificates online.',
    theme: 'bg-slate-700',
    accent: 'text-slate-700',
    benefits: [
      'Download account statements',
      'Update Nominee details',
      'Order Balance certificates',
      'Manage IP Whitelisting'
    ],
    eligibility: ['Active Member ID', 'Full Individual access', 'KYC Compliance'],
    cta: 'Access Services',
    ctaPath: '/services'
  },
  'tax-services': {
    id: 'ser-2',
    category: 'Services',
    title: 'Tax Related',
    icon: Percent,
    slug: 'tax-services',
    desc: 'Hassle-free tax saving submissions and certificates.',
    theme: 'bg-rose-700',
    accent: 'text-rose-700',
    benefits: [
      'Digital Form 15G/H submission',
      'Interest Certificate download',
      'Tax computation history',
      'TDS deduction summaries'
    ],
    eligibility: ['PAN Card mandatory', 'Income slab data', 'Relevant FY details'],
    cta: 'View Tax Panel',
    ctaPath: '/services'
  },
  'cheque-services': {
    id: 'ser-3',
    category: 'Services',
    title: 'Cheque Services',
    icon: FileText,
    slug: 'cheque-services',
    desc: 'Order, track, and manage your cheque books digitally.',
    theme: 'bg-blue-600',
    accent: 'text-blue-600',
    benefits: [
      'New Cheque book request',
      'Stop payment instantly',
      'View cheque status',
      'E-cheque history'
    ],
    eligibility: ['Savings/Current Account', 'Cheque book facility enabled', 'MAB Compliance'],
    cta: 'Request Cheque',
    ctaPath: '/services'
  },
  'e-secure-lock': {
    id: 'ser-4',
    category: 'Services',
    title: 'e-Secure Lock',
    icon: Lock,
    slug: 'e-secure-lock',
    desc: 'Instantly lock/unlock your digital banking and UPI access.',
    theme: 'bg-red-700',
    accent: 'text-red-700',
    benefits: [
      'One-tap primary block',
      'Schedule unlock time',
      'Biometric authentication link',
      'Custom safe alerts'
    ],
    eligibility: ['App verified device', '2FA Enabled', 'Admin Approval (for unlock)'],
    cta: 'Configure Lock',
    ctaPath: '/services'
  }
};
