import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  ChevronRight, 
  Home, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Info, 
  Calculator,
  ShieldCheck,
  Zap,
  Star,
  Users,
  Upload,
  FileText,
  BadgeCheck,
  Lock,
  Car,
  Briefcase,
  FileCheck
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

const loanTypes = [
  { 
    id: 'surety', 
    name: 'Surety Loan', 
    rate: 13, 
    max: 500000, 
    desc: 'Affordable credit backed by trusted sureties. Dynamic verification depending on amount.',
    icon: ShieldCheck,
    color: 'border-blue-200 bg-blue-50/30 text-blue-600',
    eligibility: '₹5,000 – ₹20,000: One Surety Required. Above ₹20,000: Additional Surety Verification Required.'
  },
  { 
    id: 'unsecured', 
    name: 'Unsecured Loan', 
    rate: 13, 
    max: 1000000, 
    desc: 'No collateral required. Standard personal credit backed by two security guarantors.',
    icon: Landmark,
    color: 'border-purple-200 bg-purple-50/30 text-purple-600',
    eligibility: 'Requires two security persons detail submission and manual document uploads.'
  },
  { 
    id: 'business', 
    name: 'Business Loan', 
    rate: 14, 
    max: 2000000, 
    desc: 'Fuel your enterprise growth. Supports NGO/Darpan registered institutions.',
    icon: Briefcase,
    color: 'border-purple-200 bg-purple-50/30 text-purple-600',
    eligibility: 'Valid Business Registration & Darpan registration verification required.'
  },
  { 
    id: 'salary', 
    name: 'Salary Loan / Personal Loan', 
    rate: 13, 
    max: 1000000, 
    desc: 'Instant personal loan matching your monthly salary slips and credit score.',
    icon: Landmark,
    color: 'border-emerald-200 bg-emerald-50/30 text-emerald-600',
    eligibility: 'Salaried individuals with 3+ months corporate track record.'
  },
  { 
    id: 'vehicle', 
    name: 'Vehicle Loan', 
    rate: 14, 
    max: 1500000, 
    desc: 'Fulfill your transit needs. Competitive rates on cars, commercial, or two-wheelers with manual uploading.',
    icon: Car,
    color: 'border-amber-200 bg-amber-50/30 text-amber-600',
    eligibility: 'Minimum 10% down payment on total invoice required. Vehicle details and manual uploads needed.'
  },
  { 
    id: 'home', 
    name: 'Home Loan', 
    rate: 9.5, 
    max: 5000000, 
    desc: 'Build your dream home with low interest rates. Flexible property valuations.',
    icon: Home,
    color: 'border-rose-200 bg-rose-50/30 text-rose-600',
    eligibility: 'Tenure up to 5 Years maximum. Clear property ownership title required.'
  }
];

const employmentDocsMap: Record<string, { id: string, name: string, optional?: boolean }[]> = {
  "Government Employee": [
    { id: 'empIdCard', name: 'Employee ID Card' },
    { id: 'salarySlips3m', name: 'Latest 3 Months Salary Slips' },
    { id: 'employmentOrder', name: 'Appointment/Employment Order' }
  ],
  "Private Sector Employee": [
    { id: 'companyIdCard', name: 'Company ID Card' },
    { id: 'salarySlips3m', name: 'Latest 3 Months Salary Slips' },
    { id: 'bankStatement6m', name: 'Bank Statement (Last 6 Months)' }
  ],
  "Business Owner / Self-Employed": [
    { id: 'businessCert', name: 'Business Registration Certificate' },
    { id: 'gstReg', name: 'GST Registration (if applicable)', optional: true },
    { id: 'tradeLicense', name: 'Trade License / Udyam Registration' },
    { id: 'itReturns2y', name: 'Last 2 Years Income Tax Returns' },
    { id: 'bankStatement12m', name: 'Bank Statement (Last 12 Months)' }
  ],
  "Daily Wage Worker": [
    { id: 'incomeDeclaration', name: 'Income Declaration Form' },
    { id: 'employerRef', name: 'Employer/Contractor Reference (Optional)', optional: true },
    { id: 'bankStatement6m', name: 'Bank Statement (Last 6 Months)' }
  ],
  "Agricultural / Farming": [
    { id: 'landDocs', name: 'Land Ownership Documents / Lease Agreement' },
    { id: 'cropDetails', name: 'Crop Details' },
    { id: 'agriIncomeCert', name: 'Agricultural Income Certificate' },
    { id: 'bankStatement6m', name: 'Bank Statement (Last 6 Months)' }
  ],
  "Retired / Pension Holder": [
    { id: 'pensionCert', name: 'Pension Certificate' },
    { id: 'pensionBankStatement', name: 'Pension Credit Bank Statement' }
  ],
  "Freelancer / Consultant": [
    { id: 'clientContracts', name: 'Client Contracts or Work Agreements' },
    { id: 'bankStatement6m', name: 'Last 6 Months Bank Statement' }
  ],
  "Other": [
    { id: 'supportIncomeProof', name: 'Supporting Income Proof Documents' },
    { id: 'bankStatement', name: 'Bank Statement' }
  ]
};

const itrDocsList = [
  { id: 'itrAck', name: 'Upload Latest ITR Acknowledgement' },
  { id: 'form16', name: 'Upload Form 16 (if applicable)', optional: true },
  { id: 'taxReceipt', name: 'Upload Tax Payment Receipt (if applicable)', optional: true }
];

const LoanApplicationPage = () => {
  const location = useLocation();
  const routerState = location.state as { loanType?: string } | null;

  const [step, setStep] = useState(1);
  const [selectedLoan, setSelectedLoan] = useState(() => {
    if (routerState?.loanType) {
      const found = loanTypes.find(l => l.name.toLowerCase().includes(routerState.loanType!.toLowerCase()) || routerState.loanType!.toLowerCase().includes(l.id));
      if (found) return found;
    }
    return loanTypes[0];
  });
  const [amount, setAmount] = useState(50000);
  const [tenure, setTenure] = useState(12);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();

  // Dynamic forms values state
  const [formData, setFormData] = useState<Record<string, string>>({
    employmentType: "",
    // Surety Loan
    applicantName: "",
    applicantAadhaar: "",
    applicantPhone: "",
    applicantAddress: "",
    suretyName: "",
    suretyAadhaar: "",
    suretyPhone: "",
    suretyAddress: "",
    surety2Name: "",
    surety2Aadhaar: "",
    surety2Phone: "",
    surety2Address: "",
    // Unsecured Loan Security Persons details
    unsecuredSecurity1Name: "",
    unsecuredSecurity1Phone: "",
    unsecuredSecurity1Email: "",
    unsecuredSecurity1Aadhaar: "",
    unsecuredSecurity2Name: "",
    unsecuredSecurity2Phone: "",
    unsecuredSecurity2Email: "",
    unsecuredSecurity2Aadhaar: "",
    securityAuthorityOption: "No",
    securityAuthorityName: "",
    securityAuthorityPhone: "",
    securityAuthorityEmail: "",
    // Business Loan
    businessName: "",
    businessType: "Proprietorship",
    businessAddress: "",
    darpanNumber: "",
    // Salary Loan
    employerName: "",
    designation: "",
    monthlySalary: "",
    // Vehicle Loan Custom Details
    vehicleName: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleType: "Car",
    vehicleBrand: "",
    vehicleCost: "",
    // Home Loan
    propertyType: "Plot",
    siteAddress: "",
    propertyValue: "",
    // General / Common
    purposeOfLoan: ""
  });

  // Dynamic files state
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedLoan.id === 'home') {
      setTenure(60); // Max 5 Years
      setAmount(100000);
    } else if (selectedLoan.id === 'surety') {
      setTenure(12);
      setAmount(5000);
    } else {
      setTenure(12);
      setAmount(50000);
    }
    setUploadedFiles({});
    setUploadProgress({});
    setErrors({});
  }, [selectedLoan]);

  const calculateEMI = () => {
    const rateVal = selectedLoan.rate;
    const termVal = tenure;
    const amountVal = amount;
    
    if (amountVal <= 0 || termVal <= 0) return 0;
    const r = rateVal / (12 * 100);
    const n = termVal;
    const p = amountVal;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const getRequiredFields = () => {
    const baseFields = [

      { name: 'startDate', label: 'Start Date', type: 'date', placeholder: 'Select Start Date' },
      { name: 'endDate', label: 'End Date', type: 'date', placeholder: 'Select End Date' },
      { name: 'monthlyPaymentDate', label: 'Monthly Payment Date', type: 'select', options: Array.from({ length: 31 }, (_, i) => (i + 1).toString()) },
      { name: 'employmentType', label: 'Employment Type', type: 'select', options: [
        'Government Employee',
        'Private Sector Employee',
        'Business Owner / Self-Employed',
        'Daily Wage Worker',
        'Agricultural / Farming',
        'Retired / Pension Holder',
        'Freelancer / Consultant',
        'Other'
      ]}
    ];

    let specificFields: any[] = [];
    switch (selectedLoan.id) {
      case 'surety':
        specificFields = [
          { name: 'applicantName', label: 'Applicant Full Name', type: 'text', placeholder: 'As on Aadhaar Card' },
          { name: 'applicantAadhaar', label: 'Applicant Aadhaar Number', type: 'text', placeholder: '12-digit Number' },
          { name: 'applicantPhone', label: 'Applicant Mobile Number', type: 'text', placeholder: '10-digit Number' },
          { name: 'applicantAddress', label: 'Applicant Complete Address', type: 'text', placeholder: 'Residential Address' },
          { name: 'suretyName', label: 'Surety 1: Full Name', type: 'text', placeholder: 'First Guarantor Full Name' },
          { name: 'suretyAadhaar', label: 'Surety 1: Aadhaar Number', type: 'text', placeholder: 'First Guarantor 12-digit Aadhaar' },
          { name: 'suretyPhone', label: 'Surety 1: Mobile Number', type: 'text', placeholder: 'First Guarantor Mobile Number' },
          { name: 'suretyAddress', label: 'Surety 1: Complete Address', type: 'text', placeholder: 'First Guarantor Residential Address' }
        ];
        if (amount > 20000) {
          specificFields.push(
            { name: 'surety2Name', label: 'Surety 2: Full Name', type: 'text', placeholder: 'Second Guarantor Full Name' },
            { name: 'surety2Aadhaar', label: 'Surety 2: Aadhaar Number', type: 'text', placeholder: 'Second Guarantor 12-digit Aadhaar' },
            { name: 'surety2Phone', label: 'Surety 2: Mobile Number', type: 'text', placeholder: 'Second Guarantor Mobile Number' },
            { name: 'surety2Address', label: 'Surety 2: Complete Address', type: 'text', placeholder: 'Second Guarantor Residential Address' }
          );
        }
        break;
      case 'unsecured':
        specificFields = [
          { name: 'applicantName', label: 'Applicant Full Name', type: 'text', placeholder: 'As on Aadhaar Card' },
          { name: 'applicantAadhaar', label: 'Applicant Aadhaar Number', type: 'text', placeholder: '12-digit Number' },
          { name: 'unsecuredSecurity1Name', label: 'Security Person 1: Name', type: 'text', placeholder: 'First Guarantor Name' },
          { name: 'unsecuredSecurity1Phone', label: 'Security Person 1: Phone', type: 'text', placeholder: 'First Guarantor Mobile' },
          { name: 'unsecuredSecurity1Email', label: 'Security Person 1: Email', type: 'text', placeholder: 'First Guarantor Email' },
          { name: 'unsecuredSecurity1Aadhaar', label: 'Security Person 1: Aadhaar', type: 'text', placeholder: 'First Guarantor Aadhaar' },
          { name: 'unsecuredSecurity2Name', label: 'Security Person 2: Name', type: 'text', placeholder: 'Second Guarantor Name', optional: true },
          { name: 'unsecuredSecurity2Phone', label: 'Security Person 2: Phone', type: 'text', placeholder: 'Second Guarantor Mobile', optional: true },
          { name: 'unsecuredSecurity2Email', label: 'Security Person 2: Email', type: 'text', placeholder: 'Second Guarantor Email', optional: true },
          { name: 'unsecuredSecurity2Aadhaar', label: 'Security Person 2: Aadhaar', type: 'text', placeholder: 'Second Guarantor Aadhaar', optional: true },
          { name: 'securityAuthorityOption', label: 'Add Security Authority?', type: 'select', options: ['No', 'Yes'] }
        ];
        if (formData.securityAuthorityOption === 'Yes') {
          specificFields.push(
            { name: 'securityAuthorityName', label: 'Security Authority: Name', type: 'text', placeholder: 'Security Authority Full Name' },
            { name: 'securityAuthorityPhone', label: 'Security Authority: Phone', type: 'text', placeholder: '10-digit Phone Number' },
            { name: 'securityAuthorityEmail', label: 'Security Authority: Email', type: 'text', placeholder: 'Security Authority Email' }
          );
        }
        break;
      case 'business':
        specificFields = [
          { name: 'businessName', label: 'Business Name', type: 'text', placeholder: 'Company Legal Name' },
          { name: 'businessType', label: 'Business Type', type: 'select', options: ['Proprietorship', 'Partnership', 'Pvt Ltd', 'LLP', 'NGO/Society'] },
          { name: 'businessAddress', label: 'Business Address', type: 'text', placeholder: 'Registered Office Address' },
          { name: 'darpanNumber', label: 'Darpan Registration Number', type: 'text', placeholder: 'NGO Darpan ID (if applicable)' }
        ];
        break;
      case 'salary':
        specificFields = [
          { name: 'employerName', label: 'Employer / Company Name', type: 'text', placeholder: 'Name of the Employer Organization' },
          { name: 'designation', label: 'Designation / Job Role', type: 'text', placeholder: 'Your current job title' },
          { name: 'monthlySalary', label: 'Monthly Net Salary (₹)', type: 'number', placeholder: 'Take home salary amount' }
        ];
        break;
      case 'vehicle':
        specificFields = [
          { name: 'vehicleName', label: 'Vehicle Name', type: 'text', placeholder: 'e.g. Swift' },
          { name: 'vehicleModel', label: 'Vehicle Model & Variant', type: 'text', placeholder: 'e.g. VXI' },
          { name: 'vehicleYear', label: 'Vehicle Year', type: 'text', placeholder: 'e.g. 2024' },
          { name: 'vehicleType', label: 'Vehicle Type', type: 'select', options: ['Two-Wheeler', 'Car', 'Commercial Vehicle'] },
          { name: 'vehicleBrand', label: 'Vehicle Brand', type: 'text', placeholder: 'e.g. Maruti Suzuki' },
          { name: 'vehicleCost', label: 'On-Road Vehicle Cost (₹)', type: 'number', placeholder: 'Estimated total on-road price' },
          { name: 'applicantName', label: 'Applicant Full Name', type: 'text', placeholder: 'As on Aadhaar Card' },
          { name: 'applicantAadhaar', label: 'Applicant Aadhaar Number', type: 'text', placeholder: '12-digit Number' },
          { name: 'unsecuredSecurity1Name', label: 'Security Person 1: Name', type: 'text', placeholder: 'First Guarantor Name' },
          { name: 'unsecuredSecurity1Phone', label: 'Security Person 1: Phone', type: 'text', placeholder: 'First Guarantor Mobile' },
          { name: 'unsecuredSecurity1Email', label: 'Security Person 1: Email', type: 'text', placeholder: 'First Guarantor Email' },
          { name: 'unsecuredSecurity1Aadhaar', label: 'Security Person 1: Aadhaar', type: 'text', placeholder: 'First Guarantor Aadhaar' },
          { name: 'unsecuredSecurity2Name', label: 'Security Person 2: Name', type: 'text', placeholder: 'Second Guarantor Name', optional: true },
          { name: 'unsecuredSecurity2Phone', label: 'Security Person 2: Phone', type: 'text', placeholder: 'Second Guarantor Mobile', optional: true },
          { name: 'unsecuredSecurity2Email', label: 'Security Person 2: Email', type: 'text', placeholder: 'Second Guarantor Email', optional: true },
          { name: 'unsecuredSecurity2Aadhaar', label: 'Security Person 2: Aadhaar', type: 'text', placeholder: 'Second Guarantor Aadhaar', optional: true }
        ];
        break;
      case 'home':
        specificFields = [
          { name: 'propertyType', label: 'Property Type', type: 'select', options: ['Plot / Site', 'Apartment', 'Independent House', 'Renovation'] },
          { name: 'siteAddress', label: 'Site / Property Address', type: 'text', placeholder: 'Complete address of property site' },
          { name: 'propertyValue', label: 'Estimated Property Value (₹)', type: 'number', placeholder: 'Current valuation rate' }
        ];
        break;
    }
    return [...baseFields, ...specificFields];
  };

  const getRequiredDocuments = () => {
    let baseDocs: { id: string, name: string }[] = [];
    switch (selectedLoan.id) {
      case 'surety':
        baseDocs = [
          { id: 'applicantAadhaar', name: 'Applicant Aadhaar Card' },
          { id: 'suretyAadhaar', name: 'Surety 1 Aadhaar Card' },
          { id: 'addressProof', name: 'Address Proof' },
          { id: 'applicantPhoto', name: 'Applicant Photograph' },
          { id: 'suretyPhoto', name: 'Surety 1 Photograph' }
        ];
        if (amount > 20000) {
          baseDocs.push(
            { id: 'surety2AadhaarDoc', name: 'Surety 2 Aadhaar Card' },
            { id: 'surety2Photo', name: 'Surety 2 Photograph' }
          );
        }
        break;
      case 'unsecured':
        baseDocs = [
          { id: 'applicantAadhaar', name: 'Applicant Aadhaar Card' },
          { id: 'unsecuredSecurity1AadhaarDoc', name: 'Security Person 1 Aadhaar Card' },
          { id: 'unsecuredSecurity2AadhaarDoc', name: 'Security Person 2 Aadhaar Card', optional: true },
          { id: 'applicantPhoto', name: 'Applicant Photograph' }
        ];
        if (formData.securityAuthorityOption === 'Yes') {
          baseDocs.push({ id: 'securityAuthorityDoc', name: 'Security Authority Document (ID/Address Proof)' });
        }
        break;
      case 'business':
        baseDocs = [
          { id: 'businessReg', name: 'Business Registration Certificate' },
          { id: 'darpanReg', name: 'Darpan Registration Certificate' },
          { id: 'businessAddressProof', name: 'Business Address Proof' },
          { id: 'bankStatement', name: '6 Months Bank Statement' }
        ];
        break;
      case 'salary':
        baseDocs = [
          { id: 'salarySlips', name: 'Salary Slips (3 Months)' },
          { id: 'bankStatement', name: 'Bank Statement (3 Months)' },
          { id: 'aadhaarCard', name: 'Aadhaar Card' },
          { id: 'panCard', name: 'PAN Card' }
        ];
        break;
      case 'vehicle':
        baseDocs = [
          { id: 'vehicleQuotation', name: 'Vehicle Quotation/Invoice' },
          { id: 'vehicleRegistrationDoc', name: 'Vehicle Booking/Registration Document' },
          { id: 'aadhaarCard', name: 'Aadhaar Card' },
          { id: 'unsecuredSecurity1AadhaarDoc', name: 'Security Person 1 Aadhaar Card' },
          { id: 'unsecuredSecurity2AadhaarDoc', name: 'Security Person 2 Aadhaar Card', optional: true },
          { id: 'panCard', name: 'PAN Card' },
          { id: 'addressProof', name: 'Address Proof' }
        ];
        break;
      case 'home':
        baseDocs = [
          { id: 'siteDocuments', name: 'Site Documents / Khata' },
          { id: 'saleDeed', name: 'Sale Deed Copy' },
          { id: 'ownershipDocs', name: 'Property Ownership Documents' },
          { id: 'taxReceipt', name: 'Property Tax Paid Receipt' },
          { id: 'aadhaarCard', name: 'Aadhaar Card' },
          { id: 'panCard', name: 'PAN Card' },
          { id: 'incomeProof', name: 'Income Proof / ITR' }
        ];
        break;
    }

    // Add dynamic Employment specific document upload fields
    const empType = formData.employmentType;
    const empDocs = empType ? (employmentDocsMap[empType] || []) : [];

    // Add Income Tax Return specific fields
    const taxDocs = itrDocsList;

    return [...baseDocs, ...empDocs, ...taxDocs];
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 2) {
      const fields = getRequiredFields();
      fields.forEach(f => {
        const val = formData[f.name];
        if (!f.optional && (!val || !val.toString().trim())) {
          newErrors[f.name] = `${f.label} is required`;
        }
      });
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (end < start) {
          newErrors.endDate = "End Date cannot be earlier than Start Date";
        }
      }
      if (selectedLoan.id === 'surety') {
        const phoneRegex = /^\d{10}$/;
        if (formData.applicantPhone && !phoneRegex.test(formData.applicantPhone)) {
          newErrors.applicantPhone = "Phone must be a valid 10-digit number";
        }
        if (formData.suretyPhone && !phoneRegex.test(formData.suretyPhone)) {
          newErrors.suretyPhone = "Surety phone must be a valid 10-digit number";
        }
        const aadhaarRegex = /^\d{12}$/;
        if (formData.applicantAadhaar && !aadhaarRegex.test(formData.applicantAadhaar)) {
          newErrors.applicantAadhaar = "Aadhaar must be a valid 12-digit number";
        }
        if (formData.suretyAadhaar && !aadhaarRegex.test(formData.suretyAadhaar)) {
          newErrors.suretyAadhaar = "Surety Aadhaar must be a valid 12-digit number";
        }
        if (amount > 20000) {
          if (formData.surety2Phone && !phoneRegex.test(formData.surety2Phone)) {
            newErrors.surety2Phone = "Surety 2 phone must be a valid 10-digit number";
          }
          if (formData.surety2Aadhaar && !aadhaarRegex.test(formData.surety2Aadhaar)) {
            newErrors.surety2Aadhaar = "Surety 2 Aadhaar must be a valid 12-digit number";
          }
        }
      } else if (selectedLoan.id === 'unsecured' || selectedLoan.id === 'vehicle') {
        const phoneRegex = /^\d{10}$/;
        const aadhaarRegex = /^\d{12}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (formData.applicantAadhaar && !aadhaarRegex.test(formData.applicantAadhaar)) {
          newErrors.applicantAadhaar = "Applicant Aadhaar must be a valid 12-digit number";
        }
        if (formData.unsecuredSecurity1Phone && !phoneRegex.test(formData.unsecuredSecurity1Phone)) {
          newErrors.unsecuredSecurity1Phone = "Security 1 phone must be a valid 10-digit number";
        }
        if (formData.unsecuredSecurity1Aadhaar && !aadhaarRegex.test(formData.unsecuredSecurity1Aadhaar)) {
          newErrors.unsecuredSecurity1Aadhaar = "Security 1 Aadhaar must be a valid 12-digit number";
        }
        if (formData.unsecuredSecurity1Email && !emailRegex.test(formData.unsecuredSecurity1Email)) {
          newErrors.unsecuredSecurity1Email = "Security 1 email must be a valid email address";
        }
        if (formData.unsecuredSecurity2Phone && !phoneRegex.test(formData.unsecuredSecurity2Phone)) {
          newErrors.unsecuredSecurity2Phone = "Security 2 phone must be a valid 10-digit number";
        }
        if (formData.unsecuredSecurity2Aadhaar && !aadhaarRegex.test(formData.unsecuredSecurity2Aadhaar)) {
          newErrors.unsecuredSecurity2Aadhaar = "Security 2 Aadhaar must be a valid 12-digit number";
        }
        if (formData.unsecuredSecurity2Email && !emailRegex.test(formData.unsecuredSecurity2Email)) {
          newErrors.unsecuredSecurity2Email = "Security 2 email must be a valid email address";
        }
        if (formData.securityAuthorityOption === 'Yes') {
          if (formData.securityAuthorityPhone && !phoneRegex.test(formData.securityAuthorityPhone)) {
            newErrors.securityAuthorityPhone = "Security Authority phone must be a valid 10-digit number";
          }
          if (formData.securityAuthorityEmail && !emailRegex.test(formData.securityAuthorityEmail)) {
            newErrors.securityAuthorityEmail = "Security Authority email must be a valid email address";
          }
        }
      }
    }

    if (currentStep === 3) {
      // Validate all required documents
      const docs = getRequiredDocuments();
      docs.forEach(doc => {
        if (!doc.optional && !uploadedFiles[doc.id]) {
          newErrors[doc.id] = `${doc.name} is mandatory.`;
        }
      });

      // Special Tax Return requirements for Government, Private, Business, Freelancer
      const taxObligatory = ['Government Employee', 'Private Sector Employee', 'Business Owner / Self-Employed', 'Freelancer / Consultant'].includes(formData.employmentType);
      if (taxObligatory) {
        const hasItr = uploadedFiles['itrAck'] || uploadedFiles['form16'] || uploadedFiles['taxReceipt'];
        if (!hasItr) {
          newErrors['itrAck'] = "Tax Return document upload is mandatory for this employment type. Please upload at least one tax proof.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const simulateFileUpload = (docId: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [docId]: file }));
    setUploadProgress(prev => ({ ...prev, [docId]: 10 }));

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const curr = prev[docId] || 0;
        if (curr >= 100) {
          clearInterval(interval);
          toast.success(`${file.name} uploaded successfully!`);
          return prev;
        }
        return { ...prev, [docId]: curr + 30 };
      });
    }, 200);

    setErrors(prev => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
  };

  const handleFileChange = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      toast.error("Format invalid! Please upload PDF, JPG, JPEG, or PNG files only.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB limit.");
      return;
    }

    simulateFileUpload(docId, file);
  };

  const handleNext = async () => {
    if (!validateStep(step)) {
      toast.error("Please fill all required fields/uploads to continue.");
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const appID = `SRS-${selectedLoan.id.substring(0,2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const payload = new FormData();
      payload.append('type', selectedLoan.name);
      payload.append('amount', amount.toString());
      payload.append('interestRate', selectedLoan.rate.toString());
      payload.append('termMonths', tenure.toString());
      payload.append('purpose', formData.purposeOfLoan || `Apply for ${selectedLoan.name}`);
      payload.append('employmentStatus', formData.employmentType || "Self-Declared");
      payload.append('monthlyIncome', formData.monthlySalary || "0");
      payload.append('status', 'PENDING');

      payload.append('startDate', formData.startDate || '');
      payload.append('endDate', formData.endDate || '');
      payload.append('monthlyPaymentDate', formData.monthlyPaymentDate || '');

      const details = {
        applicationId: appID,
        formData,
        timestamp: new Date().toISOString()
      };
      payload.append('additionalDetails', JSON.stringify(details));

      Object.entries(uploadedFiles).forEach(([key, file]) => {
        if (file) {
          payload.append(key, file);
        }
      });

      await api.post("/loans/apply", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success(`Application submitted successfully! Application ID: ${appID}`);
      navigate("/accounts?tab=loans");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to submit loan request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#c9a84c]/30">
      <Header />
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-2 text-[13px] text-gray-500 font-medium">
          <Link to="/dashboard" className="hover:text-[#6b21a8] flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/accounts" className="hover:text-[#6b21a8]">Accounts</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#1a1f36] font-bold">Apply for Loan</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Stepper progress */}
        <div className="flex justify-between items-center mb-12 px-6">
           {[1, 2, 3, 4].map((i) => (
             <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-2 relative z-10">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                      step >= i ? "bg-[#1a1f36] text-white scale-110 shadow-lg shadow-black/10" : "bg-gray-200 text-gray-400"
                   }`}>
                      {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                   </div>
                   <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= i ? "text-[#1a1f36]" : "text-gray-300"}`}>
                      {i === 1 ? "Product" : i === 2 ? "Information" : i === 3 ? "Documents" : "Review"}
                   </span>
                </div>
                {i < 4 && (
                   <div className="flex-grow h-0.5 bg-gray-100 mx-4 -mt-6">
                      <div className="h-full bg-[#1a1f36] transition-all duration-700" style={{ width: step > i ? '100%' : '0%' }} />
                   </div>
                )}
             </React.Fragment>
           ))}
        </div>

        <section className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
           <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                   key="step1" 
                   initial={{ opacity: 0, x: 20 }} 
                   animate={{ opacity: 1, x: 0 }} 
                   exit={{ opacity: 0, x: -20 }}
                   className="p-10 space-y-8"
                >
                   <div className="text-center space-y-2">
                       <h2 className="text-2xl font-bold text-[#1a1f36]">Select Credit Facility</h2>
                       <p className="text-gray-500 text-sm">Choose from our tailored institutional credit schemes</p>
                   </div>
                   
                   <div className="grid md:grid-cols-2 gap-6">
                      {loanTypes.map((l) => (
                        <button 
                           key={l.id}
                           onClick={() => setSelectedLoan(l)}
                           className={`p-6 rounded-[32px] border-2 text-left transition-all relative overflow-hidden group ${
                              selectedLoan.id === l.id ? "border-[#1a1f36] shadow-xl scale-[1.02]" : "border-gray-100 hover:border-gray-200"
                           } ${l.color}`}
                        >
                           <div className="relative z-10 space-y-4">
                              <div className="flex justify-between items-start">
                                 <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                    <l.icon className="w-5 h-5" />
                                 </div>
                                 <span className="text-[18px] font-black text-[#1a1f36]">{l.rate}% p.a.</span>
                              </div>
                              <h3 className="font-bold text-[16px] text-[#1a1f36]">{l.name}</h3>
                              <p className="text-[11px] text-gray-500 leading-relaxed">{l.desc}</p>
                              <div className="p-3 bg-white/70 border border-white rounded-xl text-[10px] text-slate-600 font-bold leading-normal">
                                 {l.eligibility}
                              </div>
                           </div>
                        </button>
                      ))}
                   </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                   key="step2" 
                   initial={{ opacity: 0, x: 20 }} 
                   animate={{ opacity: 1, x: 0 }} 
                   exit={{ opacity: 0, x: -20 }}
                   className="p-10 space-y-8"
                >
                   <div className="text-center space-y-2">
                       <h2 className="text-2xl font-bold text-[#1a1f36]">{selectedLoan.name} Information</h2>
                       <p className="text-gray-500 text-sm">Please fill the mandatory information below marked with a red asterisk (*)</p>
                   </div>

                   <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      {getRequiredFields().map((f) => (
                        <div key={f.name} className="space-y-2">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                             {f.label} {!f.optional && <span className="text-red-500 font-black">*</span>}
                           </Label>
                           {f.type === 'select' ? (
                             <select
                               className="w-full border border-gray-100 bg-white rounded-xl h-12 px-3 text-sm focus:border-[#1a1f36] focus:ring-1 focus:ring-[#1a1f36]"
                               value={formData[f.name] || ""}
                               onChange={(e) => handleInputChange(f.name, e.target.value)}
                             >
                               <option value="">Select option</option>
                               {f.options?.map(opt => (
                                 <option key={opt} value={opt}>{opt}</option>
                               ))}
                             </select>
                           ) : (
                             <Input
                               type={f.type}
                               placeholder={f.placeholder}
                               value={formData[f.name] || ""}
                               onChange={(e) => handleInputChange(f.name, e.target.value)}
                               className="h-12 rounded-xl border-gray-100"
                             />
                           )}
                           {errors[f.name] && <p className="text-xs font-bold text-red-500 mt-1">{errors[f.name]}</p>}
                        </div>
                      ))}

                      {selectedLoan.id === 'surety' && amount > 20000 && (
                         <div className="col-span-1 md:col-span-2 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2.5">
                            <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-800 font-medium">
                               <strong>Warning:</strong> Since the requested loan amount exceeds ₹20,000, additional surety verification will be triggered automatically.
                            </p>
                         </div>
                      )}

                      <div className="space-y-2 col-span-1 md:col-span-2">
                         <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Purpose of Loan</Label>
                         <Input 
                           placeholder="Enter specific purpose of credit application"
                           value={formData.purposeOfLoan || ""}
                           onChange={(e) => handleInputChange("purposeOfLoan", e.target.value)}
                           className="h-12 rounded-xl border-gray-100"
                         />
                      </div>
                   </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                   key="step3" 
                   initial={{ opacity: 0, x: 20 }} 
                   animate={{ opacity: 1, x: 0 }} 
                   exit={{ opacity: 0, x: -20 }}
                   className="p-10 space-y-8"
                >
                   <div className="text-center space-y-2">
                       <h2 className="text-2xl font-bold text-[#1a1f36]">Upload Verification Documents</h2>
                       <p className="text-gray-500 text-sm">Please upload all mandatory files (Max size: 10MB, Supported formats: PDF, JPG, JPEG, PNG)</p>
                   </div>

                   <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      {getRequiredDocuments().map((doc) => {
                         const progress = uploadProgress[doc.id] || 0;
                         const file = uploadedFiles[doc.id];
                         return (
                            <div key={doc.id} className="p-5 border border-dashed border-gray-200 hover:border-[#1a1f36] rounded-2xl flex flex-col justify-between space-y-3 transition-colors relative bg-slate-50/50">
                               <div>
                                  <div className="flex justify-between items-start">
                                     <span className="text-xs font-bold text-[#1a1f36] capitalize pr-4">
                                       {doc.name} {!doc.optional && <span className="text-red-500 font-black">*</span>}
                                     </span>
                                     <FileText className="w-4 h-4 text-slate-400" />
                                  </div>
                                  {file && (
                                     <p className="text-[10px] text-emerald-600 font-bold truncate mt-1">{file.name}</p>
                                  )}
                                </div>
                               
                               <div className="space-y-2">
                                  {progress > 0 && progress < 100 && (
                                     <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                     </div>
                                  )}
                                  <label className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-xl text-xs font-bold text-[#1a1f36] cursor-pointer hover:bg-slate-50 transition-colors">
                                     <Upload className="w-3.5 h-3.5" />
                                     {file ? "Change File" : "Upload File"}
                                     <input 
                                       type="file" 
                                       accept=".pdf,.jpg,.jpeg,.png"
                                       className="hidden" 
                                       onChange={(e) => handleFileChange(doc.id, e)}
                                     />
                                  </label>
                               </div>
                               {errors[doc.id] && <p className="text-[10px] font-bold text-red-500">{errors[doc.id]}</p>}
                            </div>
                         );
                      })}
                   </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                   key="step4" 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   className="p-10 space-y-10"
                >
                   <div className="text-center space-y-4">
                       <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                          <Calculator className="w-10 h-10" />
                       </div>
                       <h2 className="text-2xl font-bold text-[#1a1f36]">Review and Setup Tenure</h2>
                       <p className="text-gray-500 text-sm">Fine tune your requested amount and select repayment period</p>
                   </div>

                   <div className="grid md:grid-cols-2 gap-10 max-w-3xl mx-auto">
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Request Principal Amount (₹)</Label>
                            <Input 
                               type="number"
                               value={amount}
                               onChange={(e) => setAmount(Math.min(Number(e.target.value), selectedLoan.max))}
                               className="h-14 text-xl font-black rounded-xl border-gray-100"
                            />
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                               <span>Limit scale for scheme</span>
                               <span>Max: ₹{selectedLoan.max.toLocaleString()}</span>
                            </div>
                         </div>

                         <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Repayment Period (Months)</Label>
                            <div className="grid grid-cols-4 gap-2">
                               {(selectedLoan.id === 'surety' ? [12, 24, 36] : selectedLoan.id === 'home' ? [12, 24, 36, 60] : [12, 24, 36, 48]).map((m) => (
                                  <button
                                     type="button"
                                     key={m}
                                     onClick={() => setTenure(m)}
                                     className={`py-3 rounded-xl font-bold border text-xs transition-all ${
                                        tenure === m ? "bg-[#1a1f36] text-white border-[#1a1f36]" : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                                     }`}
                                  >
                                     {m}m
                                  </button>
                               ))}
                            </div>
                            {selectedLoan.id === 'home' && (
                               <p className="text-[10px] text-amber-600 font-bold mt-1">Home Loan tenure is restricted to 5 years (60 months) maximum.</p>
                            )}
                            {selectedLoan.id === 'surety' && (
                               <p className="text-[10px] text-amber-600 font-bold mt-1">Surety Loan tenure is restricted to 3 years (36 months) maximum.</p>
                            )}
                         </div>
                      </div>
                           <div className="bg-[#1a1f36] rounded-[32px] p-8 text-white flex flex-col justify-center text-center space-y-5 shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                         <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Estimated Monthly EMI</span>
                         <h3 className="text-4xl font-black">₹{Math.round(calculateEMI()).toLocaleString()}</h3>
                         <div className="pt-4 border-t border-white/10 flex flex-col gap-3 text-[11px] font-bold text-white/60 uppercase">
                             <div className="flex justify-between">
                                <span>Rate of Interest</span>
                                <span className="text-white">{selectedLoan.rate}% p.a.</span>
                             </div>
                             <div className="flex justify-between">
                                <span>Total Tenure</span>
                                <span className="text-white">{tenure} Months</span>
                             </div>
                             <div className="flex justify-between">
                                <span>Initial Processing Fee</span>
                                <span className="text-emerald-400">₹0 (Zero Fee Offer)</span>
                             </div>
                             <div className="flex justify-between">
                                <span>Total Repayable Amount</span>
                                <span className="text-white">₹{Math.round(calculateEMI() * tenure).toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between">
                                <span>Interest Payable</span>
                                <span className="text-white">₹{Math.round(calculateEMI() * tenure - amount).toLocaleString()}</span>
                             </div>
                             {selectedLoan.id === 'surety' && (
                                <div className="flex justify-between text-left border-t border-white/5 pt-2 text-[10px] text-amber-300 font-bold normal-case">
                                   <span>Surety Required</span>
                                   <span>{amount > 20000 ? "2 Sureties (1 Compulsory, 1 Choice)" : "1 Compulsory Surety"}</span>
                                </div>
                             )}
                             {(selectedLoan.id === 'unsecured' || selectedLoan.id === 'vehicle') && (
                                <div className="flex justify-between text-left border-t border-white/5 pt-2 text-[10px] text-amber-300 font-bold normal-case">
                                   <span>Guarantor Policy</span>
                                   <span>2 Sureties (1 Compulsory, 1 Choice)</span>
                                </div>
                             )}
                          </div>
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>

           <div className="bg-gray-50/50 p-10 flex justify-between items-center border-t border-gray-100">
              {step > 1 ? (
                <Button type="button" onClick={handleBack} variant="ghost" className="h-14 px-8 font-bold text-gray-500 rounded-2xl hover:bg-[#1a1f36]/5">
                   <ArrowLeft className="w-4 h-4 mr-2" />
                   Back
                </Button>
              ) : <div />}

              {step < 4 ? (
                <Button type="button" onClick={handleNext} className="h-14 px-12 font-bold bg-[#1a1f36] text-white rounded-2xl hover:bg-[#2d3356] shadow-lg shadow-black/10">
                   Next Step
                   <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                   type="button" 
                   disabled={isSubmitting} 
                   onClick={() => setShowPaymentModal(true)} 
                   className="h-14 px-12 font-bold bg-[#c9a84c] text-white rounded-2xl hover:bg-[#d4b65c] shadow-lg shadow-amber-900/10 flex items-center gap-2"
                >
                   {isSubmitting ? "Processing..." : "Proceed to Payment"}
                   <ArrowRight className="w-4 h-4" />
                </Button>
              )}
           </div>
        </section>

        {/* Razorpay-style Payment Modal */}
        <AnimatePresence>
           {showPaymentModal && (
              <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }} 
                 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              >
                 <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full flex flex-col md:flex-row relative"
                 >
                    {/* Left side - Razorpay styling */}
                    <div className="md:w-1/3 bg-[#528FF0] p-8 text-white flex flex-col justify-between">
                       <div className="space-y-6">
                          <div className="flex items-center gap-2 mb-8">
                             <div className="w-10 h-10 bg-white rounded flex items-center justify-center overflow-hidden p-1">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                             </div>
                             <div>
                                <h3 className="font-bold text-sm leading-tight">Sri Roja Shabarish Guruji</h3>
                                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                                   <ShieldCheck className="w-3 h-3" /> Secure Payments
                                </p>
                             </div>
                          </div>
                          
                          <div className="bg-white text-black p-4 rounded-xl shadow-lg">
                             <p className="text-xs text-gray-500 font-bold mb-1">Price Summary</p>
                             <h2 className="text-3xl font-black">₹{(amount * 0.025).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                             <p className="text-[10px] text-gray-400 mt-2 font-medium">2.5% Documentation Charge</p>
                          </div>
                          
                          <div className="bg-white text-black p-3 rounded-xl shadow text-sm font-medium flex justify-between items-center">
                             <span className="flex items-center gap-2 text-xs text-gray-600">
                                <Users className="w-4 h-4 text-gray-400" />
                                {formData.applicantPhone || "Guest"}
                             </span>
                             <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                       </div>
                       
                       <div className="mt-12 text-xs text-blue-100/70 font-medium flex items-center gap-1">
                          Secured by <span className="font-bold text-white italic">CredTrust</span>
                       </div>
                    </div>

                    {/* Right side - Payment Options */}
                    <div className="md:w-2/3 bg-gray-50 p-6 md:p-8 flex flex-col">
                       <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-gray-700">Payment Options</h3>
                          <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                       </div>

                       <div className="flex gap-6 h-full">
                          {/* Sidebar options */}
                          <div className="w-1/3 border-r border-gray-200 pr-4 space-y-1">
                             <div className="p-3 bg-white border-l-4 border-blue-500 text-blue-600 font-bold text-sm shadow-sm cursor-pointer">
                                UPI QR
                             </div>
                             <div className="p-3 text-gray-500 font-medium text-sm hover:bg-gray-100 rounded cursor-not-allowed opacity-50 flex items-center gap-2">
                                Cards <div className="flex gap-1"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" className="h-2" alt="visa" /></div>
                             </div>
                             <div className="p-3 text-gray-500 font-medium text-sm hover:bg-gray-100 rounded cursor-not-allowed opacity-50">
                                Netbanking
                             </div>
                             <div className="p-3 text-gray-500 font-medium text-sm hover:bg-gray-100 rounded cursor-not-allowed opacity-50">
                                Wallet
                             </div>
                          </div>

                          {/* QR Code Area */}
                          <div className="w-2/3 pl-2 flex flex-col">
                             <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-700 text-sm">UPI QR</h4>
                                <span className="text-xs text-gray-400 flex items-center gap-1"><Zap className="w-3 h-3" /> 10:00</span>
                             </div>
                             
                             <div className="flex gap-6 items-center">
                                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                   <QRCodeSVG 
                                      value={`upi://pay?pa=SRIROJASHABARISHGURUJI@KBL&pn=CredTrust&am=${(amount * 0.025).toFixed(2)}&cu=INR&tn=Documentation%20Charge`}
                                      size={140}
                                      level="M"
                                   />
                                </div>
                                <div className="space-y-3">
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scan with any app</p>
                                   <div className="flex gap-2 flex-wrap max-w-[120px]">
                                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo.png/640px-UPI-Logo.png" alt="UPI" className="h-5 object-contain" />
                                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png" alt="GPay" className="h-5 object-contain" />
                                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/PhonePe_Logo.png/800px-PhonePe_Logo.png" alt="PhonePe" className="h-5 object-contain" />
                                   </div>
                                </div>
                             </div>

                             <div className="mt-8">
                                <p className="text-xs font-bold text-gray-500 mb-2">UPI ID / Number</p>
                                <div className="space-y-4">
                                   <Input placeholder="Enter UPI ID or Mobile Number" className="h-12 bg-white" />
                                   <Button 
                                      onClick={() => {
                                         setShowPaymentModal(false);
                                         handleSubmit();
                                      }}
                                      disabled={isSubmitting}
                                      className="w-full h-12 bg-[#1a1f36] hover:bg-[#2d3356] text-white font-bold rounded-xl shadow-lg transition-all"
                                   >
                                      {isSubmitting ? "Processing..." : "Verify and Pay"}
                                   </Button>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              </motion.div>
           )}
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-center gap-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
           <div className="flex items-center gap-2"><Star className="w-3.5 h-3.5" /> Fast Underwriting</div>
           <div className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Secure Documents</div>
           <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Licensed Cooperative</div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoanApplicationPage;
