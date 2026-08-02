import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  QrCode, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export interface UPIPaymentQRCodeProps {
  amount: number;
  payeeVpa?: string;
  payeeName?: string;
  transactionNote?: string;
  applicationNo?: string;
  registeredId?: string;
  customerName?: string;
  productType?: string;
  paymentStatus?: string;
  onPaymentConfirmed?: (referenceId: string) => Promise<void> | void;
  isSubmittingConfirmation?: boolean;
}

export const UPIPaymentQRCode: React.FC<UPIPaymentQRCodeProps> = ({
  amount,
  payeeVpa = 'SRIROJASHABARISHGURUJI@KBL',
  payeeName = 'Sri Roja Shabarish Guruji',
  transactionNote = 'Deposit Payment',
  applicationNo = 'DEP-REF-001',
  registeredId = 'ROJA-MEMBER',
  customerName = 'Member Applicant',
  productType = 'Fixed Deposit',
  paymentStatus = 'PENDING',
  onPaymentConfirmed,
  isSubmittingConfirmation = false,
}) => {
  const [referenceId, setReferenceId] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrKey, setQrKey] = useState(1);
  const [hasError, setHasError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes timer

  // Build clean UPI string
  const cleanAmount = Number(amount || 0).toFixed(2);
  const encodedPayeeName = encodeURIComponent(payeeName);
  const encodedNote = encodeURIComponent(`${transactionNote} - ${applicationNo}`);
  const upiUrl = `upi://pay?pa=${payeeVpa}&pn=${encodedPayeeName}&am=${cleanAmount}&cu=INR&tn=${encodedNote}`;

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(payeeVpa);
    setCopiedVpa(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiUrl);
    setCopiedLink(true);
    toast.success('UPI Payment Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRegenerate = () => {
    setHasError(false);
    setQrKey((prev) => prev + 1);
    setTimeLeft(900);
    toast.info('QR Code regenerated!');
  };

  const handleConfirm = () => {
    if (onPaymentConfirmed) {
      onPaymentConfirmed(referenceId.trim());
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl p-8 max-w-xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Top Details Summary Header */}
      <div className="bg-gradient-to-br from-slate-900 to-[#1a1f36] text-white rounded-2xl p-6 space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-white/10 text-[#c9a84c] rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
            {productType}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Expires in: <span className="font-mono text-amber-400 font-black">{formatTimer(timeLeft)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Application No</p>
            <p className="text-sm font-extrabold text-white mt-0.5">{applicationNo}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered ID</p>
            <p className="text-sm font-extrabold text-[#c9a84c] mt-0.5">{registeredId}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Name</p>
            <p className="text-sm font-bold text-slate-200 mt-0.5">{customerName}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Amount</p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">₹{Number(amount).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Main QR Display Section */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-5">
        <div className="relative p-5 bg-white border-2 border-purple-100 rounded-3xl shadow-lg flex flex-col items-center justify-center min-w-[220px] min-h-[220px]">
          {!hasError ? (
            <QRCodeSVG
              key={qrKey}
              value={upiUrl}
              size={200}
              level="H"
              includeMargin={false}
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 text-center py-6">
              <AlertCircle className="w-12 h-12 text-rose-500 animate-bounce" />
              <p className="text-xs font-bold text-slate-700">Failed to render vector QR code.</p>
              <Button
                type="button"
                size="sm"
                onClick={handleRegenerate}
                className="bg-[#6b21a8] text-white text-xs font-bold rounded-xl"
              >
                Retry Generation
              </Button>
            </div>
          )}
        </div>

        <div className="text-center space-y-1">
          <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
            <QrCode className="w-4 h-4 text-[#6b21a8]" />
            Scan using any UPI App (GPay, PhonePe, Paytm, BHIM)
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Pay exact amount of <span className="font-black text-[#1a1f36]">₹{Number(amount).toLocaleString('en-IN')}</span> to complete application.
          </p>
        </div>

        {/* UPI Details & Copy Helpers */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between">
            <div className="truncate">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payee UPI ID</p>
              <p className="text-xs font-bold text-slate-800 truncate">{payeeVpa}</p>
            </div>
            <button
              type="button"
              onClick={handleCopyVpa}
              className="p-2 text-slate-500 hover:text-[#6b21a8] hover:bg-slate-50 rounded-lg transition-colors"
              title="Copy UPI ID"
            >
              {copiedVpa ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleRegenerate}
            className="h-11 px-4 text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh QR
          </Button>
        </div>
      </div>

      {/* Confirmation & Reference Input Section */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500 tracking-wider">
            UPI Reference / UTR Number (Optional)
          </Label>
          <Input
            placeholder="e.g. 312345678901 or Txn Ref No"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            className="h-12 rounded-xl bg-slate-50 border-slate-200 font-semibold text-sm"
          />
        </div>

        <Button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmittingConfirmation}
          className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all"
        >
          {isSubmittingConfirmation ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Verifying Payment...
            </>
          ) : (
            <>
              I Have Completed Payment
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>

        <p className="text-[10px] text-center text-slate-400 font-medium flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Encrypted 256-bit UPI Transaction Verification
        </p>
      </div>
    </div>
  );
};

export default UPIPaymentQRCode;
