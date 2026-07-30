import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import AdminNavbar from '@/components/AdminNavbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  PlusCircle, Edit, Trash2, X, Download, Filter, 
  TrendingUp, TrendingDown, Landmark, RefreshCw, FileText
} from 'lucide-react';

const OfficeExpensePage = () => {
  const queryClient = useQueryClient();
  
  // Form State
  const [formData, setFormData] = useState({
    id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'EXPENSE', // EXPENSE or INCOME
    description: '',
    amount: '',
    modeOfTransaction: 'CASH', // CASH, BANK_TRANSFER, UPI, CHEQUE, OTHER
    remarks: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [filterType, setFilterType] = useState('ALL'); // ALL, EXPENSE, INCOME
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filterPreset, setFilterPreset] = useState('ALL'); // ALL, MONTHLY, YEARLY

  // Fetch Office Expenses Summary & Balances
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['office-expenses-summary'],
    queryFn: async () => {
      const res = await api.get('/office-expenses/summary');
      return res.data;
    }
  });

  // Fetch Office Expenses List
  const { data: expenses, isLoading: isListLoading } = useQuery({
    queryKey: ['office-expenses-list', filterType, filterDateRange, filterPreset],
    queryFn: async () => {
      let url = '/office-expenses?';
      if (filterType !== 'ALL') {
        url += `type=${filterType}&`;
      }
      
      let start = filterDateRange.startDate;
      let end = filterDateRange.endDate;

      if (filterPreset === 'MONTHLY') {
        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth();
        start = new Date(y, m, 1).toISOString().split('T')[0];
        end = new Date(y, m + 1, 0).toISOString().split('T')[0];
      } else if (filterPreset === 'YEARLY') {
        const today = new Date();
        const y = today.getFullYear();
        start = `${y}-01-01`;
        end = `${y}-12-31`;
      }

      if (start) url += `startDate=${start}&`;
      if (end) url += `endDate=${end}&`;

      const res = await api.get(url);
      return res.data;
    }
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (dto: any) => {
      const res = await api.post('/office-expenses', dto);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-expenses-summary'] });
      queryClient.invalidateQueries({ queryKey: ['office-expenses-list'] });
      toast.success("Transaction recorded successfully");
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to record transaction");
    }
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, dto }: { id: string, dto: any }) => {
      const res = await api.put(`/office-expenses/${id}`, dto);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-expenses-summary'] });
      queryClient.invalidateQueries({ queryKey: ['office-expenses-list'] });
      toast.success("Transaction updated successfully");
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update transaction");
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/office-expenses/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-expenses-summary'] });
      queryClient.invalidateQueries({ queryKey: ['office-expenses-list'] });
      toast.success("Transaction deleted successfully");
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete transaction");
    }
  });

  const resetForm = () => {
    setFormData({
      id: '',
      date: new Date().toISOString().split('T')[0],
      type: 'EXPENSE',
      description: '',
      amount: '',
      modeOfTransaction: 'CASH',
      remarks: ''
    });
    setIsEditing(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter description");
      return;
    }

    if (isEditing) {
      updateMutation.mutate({ id: formData.id, dto: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEditClick = (exp: any) => {
    setFormData({
      id: exp.id,
      date: new Date(exp.date).toISOString().split('T')[0],
      type: exp.type,
      description: exp.description,
      amount: exp.amount.toString(),
      modeOfTransaction: exp.modeOfTransaction,
      remarks: exp.remarks || ''
    });
    setIsEditing(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction? This will adjust the running balance instantly.")) {
      deleteMutation.mutate(id);
    }
  };

  // Export to Excel / CSV
  const exportToExcel = () => {
    if (!expenses || expenses.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const headers = "S.No.,Date,Type,Description,Amount,Transaction Mode,Added By,Running Balance,Remarks\n";
    const csvContent = expenses.map((e: any, idx: number) => {
      return `${expenses.length - idx},"${new Date(e.date).toLocaleDateString('en-IN')}",${e.type},"${e.description.replace(/"/g, '""')}",${e.amount},${e.modeOfTransaction},"${e.addedBy}",${e.runningBalance || ''},"${(e.remarks || '').replace(/"/g, '""')}"`;
    }).join("\n");

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Office_Expense_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel/CSV Report downloaded successfully");
  };

  // Export to PDF (Print friendly styled layout)
  const exportToPDF = () => {
    window.print();
  };

  const totals = expenses?.reduce((acc: any, curr: any) => {
    if (curr.type === 'INCOME') {
      acc.income += curr.amount;
    } else {
      acc.expense += curr.amount;
    }
    return acc;
  }, { income: 0, expense: 0 }) || { income: 0, expense: 0 };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans print:bg-white">
      <div className="print:hidden">
        <AdminNavbar />
      </div>

      <main className="flex-1 pb-20 px-4 sm:px-6 max-w-7xl mx-auto w-full pt-10">
        
        {/* Title / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 print:hidden">
          <div>
            <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Landmark className="h-8 w-8 text-[#c9a84c]" />
              Office Expenses & Income Ledger
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
              Centralized administrative ledger directly linked to the Total Principal Amount.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToPDF} variant="outline" className="gap-2 border-slate-200">
              <FileText className="h-4 w-4" /> Export PDF
            </Button>
            <Button onClick={exportToExcel} className="gap-2 bg-[#c9a84c] text-[#1a1f36] hover:bg-[#b59640]">
              <Download className="h-4 w-4" /> Export Excel
            </Button>
          </div>
        </div>

        {/* Print header */}
        <div className="hidden print:block text-center space-y-2 mb-8 border-b pb-4">
          <h1 className="text-2xl font-black uppercase">Sri Roja Shabarish Guruji Society</h1>
          <h2 className="text-sm font-bold text-slate-500 uppercase">Office Income & Expense Audit Report</h2>
          <p className="text-xs">Generated Date: {new Date().toLocaleString()}</p>
        </div>

        {/* 1. Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Base Principal</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900">
                {isSummaryLoading ? <RefreshCw className="h-4 w-4 animate-spin text-slate-300" /> : `₹${Number(summary?.principalAmount || 0).toLocaleString()}`}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-emerald-50/50 border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <span className="text-[10px] uppercase font-black text-emerald-600 tracking-wider flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> Total Income
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-emerald-700">
                ₹{totals.income.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-rose-50/50 border-l-4 border-l-rose-500">
            <CardHeader className="pb-2">
              <span className="text-[10px] uppercase font-black text-rose-600 tracking-wider flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5" /> Total Expenses
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-rose-700">
                ₹{totals.expense.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-[#1a1f36] text-white">
            <CardHeader className="pb-2">
              <span className="text-[10px] uppercase font-black text-white/50 tracking-wider">Current Available Balance</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-[#c9a84c]">
                {isSummaryLoading ? <RefreshCw className="h-4 w-4 animate-spin text-white/20" /> : `₹${Number(summary?.currentAvailableBalance || 0).toLocaleString()}`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. Main Workstation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Entry Form */}
          <div className="lg:col-span-1 print:hidden">
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-[#c9a84c]" />
                  {isEditing ? "Edit Entry" : "Add Ledger Entry"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSave} className="space-y-4">
                  
                  <div className="space-y-2">
                    <Label>Transaction Date</Label>
                    <Input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Transaction Type</Label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-white text-sm outline-none"
                    >
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Input 
                      placeholder="e.g. Office rent, Electricity bill"
                      required
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Amount (₹) *</Label>
                    <Input 
                      type="number"
                      required
                      min="1"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mode of Transaction</Label>
                    <select
                      value={formData.modeOfTransaction}
                      onChange={e => setFormData({...formData, modeOfTransaction: e.target.value})}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-white text-sm outline-none"
                    >
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Remarks (Optional)</Label>
                    <Textarea 
                      placeholder="Additional audit details..."
                      value={formData.remarks}
                      onChange={e => setFormData({...formData, remarks: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-[#1a1f36] hover:bg-black text-white"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {isEditing ? "Update" : "Save"}
                    </Button>
                    
                    {isEditing && (
                      <Button 
                        type="button" 
                        variant="destructive"
                        onClick={() => handleDeleteClick(formData.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    )}

                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                      className="border-slate-200"
                    >
                      Cancel
                    </Button>
                  </div>

                </form>
              </CardContent>
            </Card>
          </div>

          {/* History Ledger List */}
          <div className="lg:col-span-2 space-y-6 print:col-span-3">
            <Card className="border-none shadow-sm print:shadow-none">
              <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between flex-wrap gap-4 print:hidden">
                <CardTitle className="text-lg">Ledger Log</CardTitle>
                
                {/* Filtering controls */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="h-8 border border-slate-200 rounded-lg px-2 text-xs bg-white outline-none"
                  >
                    <option value="ALL">All Types</option>
                    <option value="EXPENSE">Expense Only</option>
                    <option value="INCOME">Income Only</option>
                  </select>

                  <select
                    value={filterPreset}
                    onChange={e => setFilterPreset(e.target.value)}
                    className="h-8 border border-slate-200 rounded-lg px-2 text-xs bg-white outline-none"
                  >
                    <option value="ALL">All Time</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                  
                  {filterPreset === 'ALL' && (
                    <div className="flex items-center gap-1.5">
                      <Input 
                        type="date"
                        value={filterDateRange.startDate}
                        onChange={e => setFilterDateRange({...filterDateRange, startDate: e.target.value})}
                        className="h-8 text-xs max-w-[120px] rounded-lg"
                      />
                      <span className="text-slate-400">•</span>
                      <Input 
                        type="date"
                        value={filterDateRange.endDate}
                        onChange={e => setFilterDateRange({...filterDateRange, endDate: e.target.value})}
                        className="h-8 text-xs max-w-[120px] rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 px-0 md:px-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-4">S.No</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Mode</th>
                        <th className="p-4">Added By</th>
                        <th className="p-4">Running Balance</th>
                        <th className="p-4 text-right print:hidden">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-[#1a1f36]">
                      {isListLoading ? (
                        <tr>
                          <td colSpan={9} className="p-10 text-center text-slate-400">
                            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                            Loading Ledger...
                          </td>
                        </tr>
                      ) : !expenses || expenses.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-10 text-center text-slate-400">
                            No ledger transactions found matching filters.
                          </td>
                        </tr>
                      ) : (
                        expenses.map((exp: any, idx: number) => (
                          <tr key={exp.id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-mono">{expenses.length - idx}</td>
                            <td className="p-4">
                              {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-[6px] text-[9px] font-black uppercase tracking-wider ${
                                exp.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {exp.type}
                              </span>
                            </td>
                            <td className="p-4 font-bold max-w-[150px] truncate" title={exp.description}>
                              {exp.description}
                            </td>
                            <td className={`p-4 font-black ${exp.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                              {exp.type === 'INCOME' ? '+' : '-'} ₹{exp.amount.toLocaleString()}
                            </td>
                            <td className="p-4 text-slate-500 uppercase tracking-wider text-[10px]">
                              {exp.modeOfTransaction.replace(/_/g, ' ')}
                            </td>
                            <td className="p-4 text-slate-500">{exp.addedBy}</td>
                            <td className="p-4 font-black text-slate-800">
                              ₹{exp.runningBalance ? exp.runningBalance.toLocaleString() : '—'}
                            </td>
                            <td className="p-4 text-right print:hidden space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                                onClick={() => handleEditClick(exp)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                onClick={() => handleDeleteClick(exp.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default OfficeExpensePage;
