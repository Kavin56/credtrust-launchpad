import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Building2,
  RefreshCw,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import api, { getApiErrorMessage, getApiBaseUrl } from '@/lib/api';

interface DownloadPaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  defaultMemberId?: string;
  defaultRegisteredId?: string;
  defaultProductType?: 'ALL' | 'LOAN' | 'DEPOSIT' | 'PIGMY';
}

export const DownloadPaymentHistoryModal: React.FC<DownloadPaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  isAdmin = false,
  defaultMemberId,
  defaultRegisteredId,
  defaultProductType = 'ALL',
}) => {
  const [productType, setProductType] = useState<'ALL' | 'LOAN' | 'DEPOSIT' | 'PIGMY'>(defaultProductType);
  const [status, setStatus] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [registeredId, setRegisteredId] = useState<string>(defaultRegisteredId || '');
  const [customerName, setCustomerName] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

  const [previewData, setPreviewData] = useState<{
    summary: { totalCount: number; totalAmountPaid: number; totalPendingAmount: number };
    recordsCount: number;
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Sync state when props change
  useEffect(() => {
    if (defaultProductType) setProductType(defaultProductType);
    if (defaultRegisteredId) setRegisteredId(defaultRegisteredId);
  }, [defaultProductType, defaultRegisteredId]);

  // Fetch summary preview when filters change
  useEffect(() => {
    if (!isOpen) return;

    const fetchPreview = async () => {
      setIsLoadingPreview(true);
      try {
        const params: Record<string, any> = {
          productType,
          status,
        };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (isAdmin) {
          if (registeredId) params.registeredId = registeredId;
          if (customerName) params.customerName = customerName;
          if (defaultMemberId) params.memberId = defaultMemberId;
        }

        const { data } = await api.get('/reports/payment-history', { params });
        setPreviewData({
          summary: data.summary,
          recordsCount: data.records?.length || 0,
        });
      } catch (err) {
        console.error('Failed to load preview:', err);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    const timer = setTimeout(fetchPreview, 300);
    return () => clearTimeout(timer);
  }, [isOpen, productType, status, startDate, endDate, registeredId, customerName, isAdmin, defaultMemberId]);

  const handleApplyPreset = (preset: '30days' | 'thisMonth' | 'thisYear' | 'all') => {
    const today = new Date();
    if (preset === '30days') {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else if (preset === 'thisYear') {
      const firstJan = new Date(today.getFullYear(), 0, 1);
      setStartDate(firstJan.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const params: Record<string, any> = {
        format: exportFormat,
        productType,
        status,
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (isAdmin) {
        if (registeredId) params.registeredId = registeredId;
        if (customerName) params.customerName = customerName;
        if (defaultMemberId) params.memberId = defaultMemberId;
      }

      const queryString = new URLSearchParams(params).toString();
      const token = localStorage.getItem('accessToken');

      // Fetch blob via api client so Bearer token is attached
      const response = await api.get(`/reports/payment-history/export?${queryString}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type:
          exportFormat === 'pdf'
            ? 'application/pdf'
            : exportFormat === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Payment_History_${exportFormat.toUpperCase()}_${timestamp}.${
        exportFormat === 'excel' ? 'xlsx' : exportFormat
      }`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Payment history exported successfully in ${exportFormat.toUpperCase()} format!`);
      onClose();
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, 'Failed to download payment history.'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white rounded-[32px] p-8 border border-slate-100 shadow-2xl overflow-hidden">
        <DialogHeader className="space-y-2 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6b21a8]/10 text-[#6b21a8] flex items-center justify-center font-bold">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-[#1a1f36]">
                Download Payment History Statement
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                Export structured statement records in PDF, Excel, or CSV formats with custom filters.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[68vh] overflow-y-auto pr-1">
          
          {/* Quick Date Presets */}
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Date Range Presets</Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'all', label: 'All Time' },
                { id: '30days', label: 'Last 30 Days' },
                { id: 'thisMonth', label: 'This Month' },
                { id: 'thisYear', label: 'This Year' },
              ].map((p) => (
                <Button
                  key={p.id}
                  type="button"
                  variant="outline"
                  onClick={() => handleApplyPreset(p.id as any)}
                  className="h-10 text-xs font-bold rounded-xl border-slate-200 hover:bg-[#6b21a8]/5 hover:text-[#6b21a8] hover:border-[#6b21a8]/30 transition-all"
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#c9a84c]" /> From Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 border-slate-200 font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#c9a84c]" /> To Date
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 border-slate-200 font-semibold"
              />
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Financial Product Filter */}
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Financial Product</Label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as any)}
                className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-3 font-bold text-sm text-[#1a1f36] outline-none focus:ring-2 focus:ring-[#6b21a8]/20"
              >
                <option value="ALL">All Products (Loans, Deposits, Pigmy)</option>
                <option value="LOAN">Loans Only</option>
                <option value="DEPOSIT">Deposits Only</option>
                <option value="PIGMY">Pigmy Collections Only</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Payment Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-3 font-bold text-sm text-[#1a1f36] outline-none focus:ring-2 focus:ring-[#6b21a8]/20"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed / Paid</option>
                <option value="PENDING">Pending / Initiated</option>
              </select>
            </div>
          </div>

          {/* Admin Filters */}
          {isAdmin && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-600" /> Filter by Registered ID
                </Label>
                <Input
                  placeholder="e.g. ROJA-1001"
                  value={registeredId}
                  onChange={(e) => setRegisteredId(e.target.value)}
                  className="h-11 rounded-xl bg-white border-amber-200 text-sm font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-600" /> Filter by Customer Name
                </Label>
                <Input
                  placeholder="e.g. Ramesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-11 rounded-xl bg-white border-amber-200 text-sm font-semibold"
                />
              </div>
            </div>
          )}

          {/* Live Summary Preview Box */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                {isLoadingPreview ? <RefreshCw className="w-3 h-3 animate-spin text-[#c9a84c]" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                Live Query Preview
              </span>
              <span className="text-xs font-bold text-[#c9a84c]">
                {previewData ? `${previewData.recordsCount} Records Found` : 'Calculating...'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase">Total Paid</p>
                <p className="text-lg font-black text-emerald-400 mt-0.5">
                  ₹{previewData?.summary?.totalAmountPaid?.toLocaleString('en-IN') || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase">Pending Payments</p>
                <p className="text-lg font-black text-amber-400 mt-0.5">
                  ₹{previewData?.summary?.totalPendingAmount?.toLocaleString('en-IN') || '0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Select Export Format</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'pdf', title: 'PDF Statement', icon: FileText, desc: 'Print-ready PDF with letterhead', bg: 'hover:border-rose-300' },
                { id: 'excel', title: 'Excel (.xlsx)', icon: FileSpreadsheet, desc: 'Native spreadsheet workbook', bg: 'hover:border-emerald-300' },
                { id: 'csv', title: 'CSV File', icon: Download, desc: 'Raw comma-separated data', bg: 'hover:border-blue-300' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setExportFormat(fmt.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    exportFormat === fmt.id
                      ? 'border-[#6b21a8] bg-[#6b21a8]/[0.03] ring-2 ring-[#6b21a8]/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <fmt.icon className={`w-6 h-6 mb-2 ${
                    fmt.id === 'pdf' ? 'text-rose-500' : fmt.id === 'excel' ? 'text-emerald-600' : 'text-blue-600'
                  }`} />
                  <p className="font-bold text-xs text-[#1a1f36]">{fmt.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{fmt.desc}</p>
                  {exportFormat === fmt.id && (
                    <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#6b21a8] text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>

        <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isDownloading}
            className="rounded-xl font-bold text-slate-500 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading || (previewData?.recordsCount === 0)}
            className="h-12 px-8 bg-[#6b21a8] hover:bg-[#581c87] text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 flex items-center gap-2 transition-all"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating {exportFormat.toUpperCase()}...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export {exportFormat.toUpperCase()} Statement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadPaymentHistoryModal;
