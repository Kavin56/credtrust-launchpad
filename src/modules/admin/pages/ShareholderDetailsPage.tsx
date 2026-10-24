import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Filter, 
  Download, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminNavbar from '@/components/AdminNavbar';
import Footer from '@/components/Footer';

export default function ShareholderDetailsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [casteFilter, setCasteFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    slNo: '',
    memberName: '',
    relation: '',
    address: '',
    phone: '',
    age: '',
    casteClass: '',
    category: '',
    membershipReceiptNo: '',
    receiptDate: '',
    dateRemittedToDccBank: '',
    entranceFee: 50,
    valueOfOneShare: 500,
    noOfShares: 1,
    totalShareAmount: 500,
    shareFee: 100,
    grandTotal: 650,
    relationBasis: ''
  });

  // Query: Fetch shareholders
  const { data: shareholders = [], isLoading } = useQuery({
    queryKey: ['admin-shareholders', search, categoryFilter, casteFilter],
    queryFn: async () => {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (casteFilter !== 'ALL') params.casteClass = casteFilter;
      const { data } = await api.get('/shareholders', { params });
      return Array.isArray(data) ? data : [];
    }
  });

  // Query: Stats
  const { data: stats } = useQuery({
    queryKey: ['admin-shareholders-stats'],
    queryFn: async () => {
      const { data } = await api.get('/shareholders/stats');
      return data;
    }
  });

  // Extract unique categories & castes for dynamic filters
  const categories = Array.from(new Set(shareholders.map((s: any) => s.category).filter(Boolean))).sort();
  const castes = Array.from(new Set(shareholders.map((s: any) => s.casteClass).filter(Boolean))).sort();

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing && data.id) {
        return api.put(`/shareholders/${data.id}`, data);
      }
      return api.post('/shareholders', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shareholders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-shareholders-stats'] });
      toast.success(isEditing ? 'Shareholder updated successfully' : 'Shareholder registered successfully');
      setIsDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save shareholder details');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/shareholders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shareholders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-shareholders-stats'] });
      toast.success('Shareholder record deleted');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete record');
    }
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    const nextSl = (shareholders.length > 0) 
      ? Math.max(...shareholders.map((s: any) => Number(s.slNo) || 0)) + 1 
      : 1;

    setFormData({
      slNo: nextSl,
      memberName: '',
      relation: '',
      address: '',
      phone: '',
      age: '',
      casteClass: 'Gowda',
      category: '3A',
      membershipReceiptNo: String(nextSl).padStart(3, '0'),
      receiptDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      dateRemittedToDccBank: '',
      entranceFee: 50,
      valueOfOneShare: 500,
      noOfShares: 1,
      totalShareAmount: 500,
      shareFee: 100,
      grandTotal: 650,
      relationBasis: 'Stated in source'
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setIsEditing(true);
    setFormData({ ...item });
    setIsDialogOpen(true);
  };

  const handleSharesChange = (shares: number) => {
    const s = Math.max(1, shares);
    const val = Number(formData.valueOfOneShare) || 500;
    const totShare = s * val;
    const entFee = Number(formData.entranceFee) || 50;
    const sFee = Number(formData.shareFee) || 100;
    const grand = entFee + totShare + sFee;

    setFormData({
      ...formData,
      noOfShares: s,
      totalShareAmount: totShare,
      grandTotal: grand
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberName.trim()) {
      toast.error('Member name is required');
      return;
    }
    saveMutation.mutate(formData);
  };

  // Pagination calculation
  const totalPages = Math.ceil(shareholders.length / pageSize) || 1;
  const paginatedList = shareholders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // CSV Export
  const handleExportCSV = () => {
    if (shareholders.length === 0) return;
    const headers = [
      'Sl No', 'Member Name', 'Relation', 'Address', 'Phone', 'Age', 
      'Caste Class', 'Category', 'Receipt No', 'Receipt Date', 
      'DCC Bank Date', 'Entrance Fee', 'Value Per Share', 'No Of Shares', 
      'Total Share Amount', 'Share Fee', 'Grand Total', 'Relation Basis'
    ];
    const rows = shareholders.map((s: any) => [
      s.slNo,
      `"${s.memberName || ''}"`,
      `"${s.relation || ''}"`,
      `"${s.address || ''}"`,
      `"${s.phone || ''}"`,
      s.age || '',
      `"${s.casteClass || ''}"`,
      `"${s.category || ''}"`,
      `"${s.membershipReceiptNo || ''}"`,
      `"${s.receiptDate || ''}"`,
      `"${s.dateRemittedToDccBank || ''}"`,
      s.entranceFee || 0,
      s.valueOfOneShare || 500,
      s.noOfShares || 1,
      s.totalShareAmount || 500,
      s.shareFee || 100,
      s.grandTotal || 650,
      `"${s.relationBasis || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SRS_Shareholder_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Shareholder register exported to CSV');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans">
      <AdminNavbar />

      <main className="flex-1 pb-20 px-4 max-w-7xl mx-auto w-full pt-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] text-[10px] font-black uppercase tracking-widest border border-[#c9a84c]/20">
                Institutional Records
              </span>
              <span className="text-slate-400 text-xs font-semibold">• 230 Registered Members</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Shareholder Details & Register
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Official share capital ledger, member shareholdings, entrance fee records, and receipts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-700 font-bold gap-2 text-xs h-11 px-5"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Export Register
            </Button>

            <Button
              onClick={handleOpenAdd}
              className="rounded-2xl bg-[#1a1f36] hover:bg-black text-white font-bold gap-2 text-xs h-11 px-6 shadow-lg shadow-slate-900/10"
            >
              <Plus className="w-4 h-4 text-[#c9a84c]" />
              Add Shareholder
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">
              Total Shareholders
            </span>
            <div className="text-2xl font-black text-slate-900">
              {stats?.totalShareholders || shareholders.length}
            </div>
            <span className="text-slate-400 text-[11px] font-medium">Registered members</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">
              Total Shares Issued
            </span>
            <div className="text-2xl font-black text-blue-600">
              {stats?.totalShares || 230}
            </div>
            <span className="text-slate-400 text-[11px] font-medium">₹500 / share base</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">
              Total Share Capital
            </span>
            <div className="text-2xl font-black text-[#c9a84c]">
              ₹{Number(stats?.totalShareCapital || 115000).toLocaleString()}
            </div>
            <span className="text-slate-400 text-[11px] font-medium">Paid-up capital</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">
              Total Collected
            </span>
            <div className="text-2xl font-black text-emerald-600">
              ₹{Number(stats?.totalCollected || 149500).toLocaleString()}
            </div>
            <span className="text-slate-400 text-[11px] font-medium">Incl. entrance & share fees</span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, phone, address, receipt no..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-11 pr-4 h-11 bg-slate-50 border-none rounded-2xl text-xs placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#c9a84c]"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Category Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-bold text-[11px] mr-1">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-semibold outline-none focus:border-[#c9a84c]"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c: any) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Caste / Class Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-bold text-[11px] mr-1">Caste:</span>
              <select
                value={casteFilter}
                onChange={(e) => {
                  setCasteFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-semibold outline-none focus:border-[#c9a84c]"
              >
                <option value="ALL">All Castes</option>
                {castes.map((c: any) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {(search || categoryFilter !== 'ALL' || casteFilter !== 'ALL') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('ALL');
                  setCasteFilter('ALL');
                  setCurrentPage(1);
                }}
                className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-9 px-3 rounded-xl font-bold"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-5">Sl No</th>
                  <th className="py-4 px-5">Member Name</th>
                  <th className="py-4 px-5">Relation</th>
                  <th className="py-4 px-5">Address</th>
                  <th className="py-4 px-5">Phone</th>
                  <th className="py-4 px-5">Age</th>
                  <th className="py-4 px-5">Caste</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Receipt No</th>
                  <th className="py-4 px-5">Receipt Date</th>
                  <th className="py-4 px-5">DCC Date</th>
                  <th className="py-4 px-5 text-right">Shares</th>
                  <th className="py-4 px-5 text-right">Share Capital</th>
                  <th className="py-4 px-5 text-right">Grand Total</th>
                  <th className="py-4 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={15} className="py-16 text-center text-slate-400">
                      Loading shareholder records...
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="py-16 text-center text-slate-400">
                      No shareholder records match your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-bold text-slate-400">
                        #{item.slNo}
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900 whitespace-nowrap">
                        {item.memberName}
                      </td>
                      <td className="py-4 px-5 text-slate-500 whitespace-nowrap">
                        {item.relation || '—'}
                      </td>
                      <td className="py-4 px-5 text-slate-500 max-w-xs truncate" title={item.address}>
                        {item.address || '—'}
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-600 whitespace-nowrap">
                        {item.phone || '—'}
                      </td>
                      <td className="py-4 px-5 text-slate-600">
                        {item.age || '—'}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {item.casteClass || '—'}
                        </span>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[10px]">
                          {item.category || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-600 whitespace-nowrap">
                        {item.membershipReceiptNo || '—'}
                      </td>
                      <td className="py-4 px-5 text-slate-500 whitespace-nowrap">
                        {item.receiptDate || '—'}
                      </td>
                      <td className="py-4 px-5 text-slate-500 whitespace-nowrap">
                        {item.dateRemittedToDccBank || '—'}
                      </td>
                      <td className="py-4 px-5 text-right font-black text-blue-600">
                        {item.noOfShares || 1}
                      </td>
                      <td className="py-4 px-5 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹{Number(item.totalShareAmount || 500).toLocaleString()}
                      </td>
                      <td className="py-4 px-5 text-right font-black text-emerald-600 whitespace-nowrap">
                        ₹{Number(item.grandTotal || 650).toLocaleString()}
                      </td>
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Record"
                            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#c9a84c] transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove ${item.memberName}?`)) {
                                deleteMutation.mutate(item.id);
                              }
                            }}
                            title="Delete Record"
                            className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
            <div>
              Showing {shareholders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, shareholders.length)} of {shareholders.length} shareholders
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="h-8 rounded-xl px-3 text-xs"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="px-3 py-1 font-bold text-slate-900">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="h-8 rounded-xl px-3 text-xs"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 font-sans">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              {isEditing ? 'Edit Shareholder Record' : 'Register New Shareholder'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sl No.</label>
                <Input
                  type="number"
                  value={formData.slNo}
                  onChange={(e) => setFormData({ ...formData, slNo: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Member Name *</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Rajesh V."
                  value={formData.memberName}
                  onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Relation (S/o, W/o, D/o)</label>
                <Input
                  type="text"
                  placeholder="e.g. S/o Late Venkatesh"
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address</label>
                <Input
                  type="text"
                  placeholder="e.g. Kadekallu Village, Shivamogga"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone / Mobile</label>
                <Input
                  type="text"
                  placeholder="e.g. 9481441621"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Age</label>
                <Input
                  type="number"
                  placeholder="e.g. 35"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Caste / Class</label>
                <Input
                  type="text"
                  placeholder="e.g. Gowda"
                  value={formData.casteClass}
                  onChange={(e) => setFormData({ ...formData, casteClass: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category (3A, 2A, General)</label>
                <Input
                  type="text"
                  placeholder="e.g. 3A"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Membership Receipt No.</label>
                <Input
                  type="text"
                  placeholder="e.g. 001"
                  value={formData.membershipReceiptNo}
                  onChange={(e) => setFormData({ ...formData, membershipReceiptNo: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Receipt Date</label>
                <Input
                  type="text"
                  placeholder="DD-MM-YYYY"
                  value={formData.receiptDate}
                  onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date Remitted to DCC Bank</label>
                <Input
                  type="text"
                  placeholder="DD-MM-YYYY"
                  value={formData.dateRemittedToDccBank}
                  onChange={(e) => setFormData({ ...formData, dateRemittedToDccBank: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Relation Basis</label>
                <Input
                  type="text"
                  placeholder="e.g. Stated in source"
                  value={formData.relationBasis}
                  onChange={(e) => setFormData({ ...formData, relationBasis: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">No. of Shares</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.noOfShares}
                  onChange={(e) => handleSharesChange(Number(e.target.value))}
                  className="rounded-xl h-10 text-xs font-bold text-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Grand Total (₹)</label>
                <Input
                  type="number"
                  value={formData.grandTotal}
                  onChange={(e) => setFormData({ ...formData, grandTotal: Number(e.target.value) })}
                  className="rounded-xl h-10 text-xs font-black text-emerald-600"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl text-xs h-10 px-5 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="rounded-xl bg-[#1a1f36] hover:bg-black text-white text-xs h-10 px-6 font-bold"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Record'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
