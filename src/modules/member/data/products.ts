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
  'surety-loan': {
    id: 'loan-7',
    category: 'Loans',
    title: 'Surety Loan',
    icon: ShieldCheck,
    slug: 'surety-loan',
    desc: 'Affordable credit backed by trusted sureties at 13% interest rate. Requirements scale dynamically with loan amount.',
    theme: 'bg-[#1a1f36]',
    accent: 'text-[#1a1f36]',
    benefits: [
      '13% annual interest rate',
      '₹10,000 to ₹50,000: Only 1 surety required',
      'Above ₹50,000: 2 sureties required',
      'Flexible tenure from 12 to 60 months'
    ],
    eligibility: ['₹10,000 to ₹50,000: 1 surety compulsory', 'Above ₹50,000: 2 sureties (1 compulsory, other choice)', 'Active member registration'],
    cta: 'Apply Now',
    ctaPath: '/loan-apply'
  },
  'business-loan': {
    id: 'loan-8',
    category: 'Loans',
    title: 'Business Loan',
    icon: Briefcase,
    slug: 'business-loan',
    desc: 'Grow your enterprise or registered NGO with 14% interest rate and flexible repayment options.',
    theme: 'bg-purple-600',
    accent: 'text-purple-600',
    benefits: [
      '14% annual interest rate',
      'Supports NGO/Darpan registered institutions',
      'No personal collateral required',
      'Direct business bank transfer'
    ],
    eligibility: ['Valid business registration documents', 'Darpan registration number for NGO applicants', '6 months business bank statements'],
    cta: 'Apply Now',
    ctaPath: '/loan-apply'
  },
  'personal-loan': {
    id: 'loan-1',
    category: 'Loans',
    title: 'Loan on Salary / Personal Loan',
    icon: User,
    slug: 'personal-loan',
    desc: 'Instant personal loan matching your monthly salary slips and credit score at 13% interest rate.',
    theme: 'bg-[#1a1f36]',
    accent: 'text-[#1a1f36]',
    benefits: [
      '13% annual interest rate',
      'Zero physical collateral required',
      'Tenure up to 60 months',
      'Quick salary verification'
    ],
    eligibility: ['Valid credit score history', '3 months latest salary slips', 'Active bank statement copy'],
    cta: 'Apply Now',
    ctaPath: '/loan-apply'
  },
  'unsecured-loan': {
    id: 'loan-5',
    category: 'Loans',
    title: 'Unsecured Loan',
    icon: User,
    slug: 'unsecured-loan',
    desc: 'Standard personal credit at 13% interest rate backed by security guarantors.',
    theme: 'bg-purple-600',
    accent: 'text-purple-600',
    benefits: [
      '13% annual interest rate',
      'Flexible tenure up to 60 months',
      'At least 1 security guarantor compulsory, other choice',
      'Manual security verification options'
    ],
    eligibility: ['1 Guarantor compulsory, 2nd Guarantor choice', 'Valid Aadhaar for guarantors', 'Good credit standing'],
    cta: 'Apply Now',
    ctaPath: '/loan-apply'
  },
  'vehicle-loan': {
    id: 'loan-6',
    category: 'Loans',
    title: 'Vehicle Loan',
    icon: Car,
    slug: 'vehicle-loan',
    desc: 'Fulfill your transit needs at 14% interest rate. Get quick funding by submitting showroom documents.',
    theme: 'bg-amber-500',
    accent: 'text-amber-500',
    benefits: [
      '14% annual interest rate',
      'Funding for cars, two-wheelers, and commercial vehicles',
      'At least 1 security guarantor compulsory, other choice',
      'Fast processing on showroom documents'
    ],
    eligibility: ['Showroom vehicle quotation/invoice documents', 'At least 1 security guarantor compulsory', 'Income proof / bank statement'],
    cta: 'Apply Now',
    ctaPath: '/loan-apply'
  },
  'home-loan': {
    id: 'loan-3',
    category: 'Loans',
    title: 'Home Loan',
    icon: Landmark,
    slug: 'home-loan',
    desc: 'Affordable housing finance at 9.5% interest rate for a maximum 5 years tenure.',
    theme: 'bg-indigo-600',
    accent: 'text-indigo-600',
    benefits: [
      '9.5% annual interest rate',
      'Fixed 5 years tenure (60 months)',
      'Clear property ownership and site documentation support',
      'Flexible valuation margins'
    ],
    eligibility: ['Property site documents (Khata, Sale Deed, Tax Receipts)', 'Strict maximum tenure of 5 years', 'ITR returns or income proof'],
    cta: 'Apply Now',
    ctaPath: '/loan-apply'
  },
  'gold-loan': {
    id: 'loan-4',
    category: 'Loans',
    title: 'Gold Loan',
    icon: Gem,
    slug: 'gold-loan',
    desc: 'Unlock the value of your gold for instant cash needs at competitive rates.',
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
    desc: 'Highest safety and guaranteed returns for your savings with special rates for senior citizens.',
    theme: 'bg-rose-600',
    accent: 'text-rose-600',
    benefits: [
      'FD 6 Months: 6.2% annual interest rate',
      'FD 1 Year: 6.5% annual interest rate',
      'FD 5 Years: 7.5% annual interest rate',
      'FD for Aged (Senior Citizens): 8% annual interest rate'
    ],
    eligibility: ['Min. Deposit: ₹1,000', 'Tenure choices: 6 Months, 1 Year, 5 Years', 'KYC Compliance documents'],
    cta: 'Open FD',
    ctaPath: '/deposit-apply'
  },
  'recurring-deposit': {
    id: 'dep-2',
    category: 'Deposits',
    title: 'Recurring Deposit',
    icon: Calendar,
    slug: 'recurring-deposit',
    desc: 'Build your savings habit with systematic monthly recurring deposits.',
    theme: 'bg-violet-600',
    accent: 'text-violet-600',
    benefits: [
      'RD 1 Year: 7% annual interest rate',
      'RD 5 Years: 8% annual interest rate',
      'RD for Aged (Senior Citizens): 8% annual interest rate'
    ],
    eligibility: ['Min. Deposit: ₹500 monthly', 'Tenure choices: 1 Year or 5 Years', 'Active savings account link'],
    cta: 'Start RD',
    ctaPath: '/deposit-apply'
  },
  'pigmy-deposit': {
    id: 'dep-3',
    category: 'Deposits',
    title: 'Pigmy Savings Scheme',
    icon: HandCoins,
    slug: 'pigmy-deposit',
    desc: 'Micro-savings plan offering 3% interest rate. Save daily or monthly with doorstep collection agent access.',
    theme: 'bg-emerald-600',
    accent: 'text-emerald-600',
    benefits: [
      '3% guaranteed interest rate',
      'Min tenure 6 Months, Max tenure 5 Years',
      'Minimum deposit of ₹100',
      'Doorstep agent collection network'
    ],
    eligibility: ['Tenure between 6 Months and 5 Years', 'Daily/monthly small savings target', 'Aadhaar Card copy'],
    cta: 'Start Pigmy',
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
