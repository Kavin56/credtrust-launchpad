import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Clock, 
  XCircle, 
  Eye, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  FileText,
  UserCheck
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import api, { getApiErrorMessage, getApiBaseUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminNavbar from '@/components/AdminNavbar';

export default function MemberRegistryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // ALL, PENDING, VERIFIED, REJECTED
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['admin-members-list', search, statusFilter],
    queryFn: async () => {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.kycStatus = statusFilter;
      const { data } = await api.get('/members', { params });
      return Array.isArray(data) ? data : (data?.data || data?.items || []);
    },
  });

  const getDocUrl = (url: string | null) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = getApiBaseUrl();
    if (url.startsWith('gs://') || url.startsWith('/uploads/')) {
      return `${baseUrl}/storage/view?path=${encodeURIComponent(url)}`;
    }
    const origin = baseUrl.replace('/api/v1', '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${origin}${cleanPath}`;
  };

  const updateKycMutation = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string; status: string }) => {
      setIsUpdating(true);
      const { data } = await api.patch(`/members/${memberId}/kyc`, { kycStatus: status, status });
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Member KYC marked as ${variables.status}!`);
      setSelectedMember(null);
      queryClient.invalidateQueries({ queryKey: ['admin-members-list'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update KYC status'));
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-[#c9a84c]/30">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                <ShieldCheck className="w-4 h-4 text-[#6b21a8]" /> Admin Portal
              </div>
              <h1 className="text-3xl font-black text-[#1a1f36]">Member Registry & KYC</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Review identity documents and verify society member applications</p>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/pigmy')}
                className="h-11 rounded-xl font-bold border-gray-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by Name, Member ID, or Phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-11 rounded-xl border-gray-200 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-[#1a1f36] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Members' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1a1f36]" />
                <p className="font-bold text-sm">Loading member registry...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Users className="w-12 h-12 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600">No members found matching filter</p>
                <p className="text-xs text-slate-400">Try adjusting search query or status filter</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-6">Member Details</th>
                      <th className="py-4 px-6">Contact Number</th>
                      <th className="py-4 px-6">District / City</th>
                      <th className="py-4 px-6">KYC Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm font-medium">
                    {members.map((m: any) => {
                      const kyc = m.kycStatus || 'PENDING';
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#c9a84c] text-white flex items-center justify-center font-black text-sm">
                                {m.fullName ? m.fullName.charAt(0).toUpperCase() : 'M'}
                              </div>
                              <div>
                                <p className="font-bold text-[#1a1f36]">{m.fullName || 'Unnamed Member'}</p>
                                <p className="text-xs text-slate-400 font-mono">ID: {m.memberId || m.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 font-mono text-xs">{m.contact || 'N/A'}</td>
                          <td className="py-4 px-6 text-slate-600 text-xs">{m.district || m.address || 'Chennai'}</td>
                          <td className="py-4 px-6">
                            {kyc === 'VERIFIED' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                              </span>
                            ) : kyc === 'REJECTED' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold border border-rose-100">
                                <XCircle className="w-3.5 h-3.5" /> Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-100">
                                <Clock className="w-3.5 h-3.5" /> Pending Review
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Button
                              onClick={() => setSelectedMember(m)}
                              className="h-9 px-4 bg-[#1a1f36] text-white rounded-xl text-xs font-bold hover:bg-black"
                            >
                              Review & Verify
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Review & Verification Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={(val) => !val && setSelectedMember(null)}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1a1f36]">Member KYC Verification</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Inspect submitted identification documents and verify application
            </DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-6 pt-4">
              
              {/* Profile summary card */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1a1f36]">{selectedMember.fullName}</h3>
                  <p className="text-xs font-mono text-slate-500">Member ID: {selectedMember.memberId}</p>
                  <p className="text-xs text-slate-500 mt-1">Contact: {selectedMember.contact || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Status</p>
                  <p className="text-sm font-black text-[#6b21a8] mt-1">{selectedMember.kycStatus || 'PENDING'}</p>
                </div>
              </div>

              {/* Documents grid */}
              <div className="grid md:grid-cols-2 gap-4">
                
                {/* Aadhaar Card */}
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#1a1f36]">Aadhaar Card</h4>
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-1">
                      {selectedMember.aadhaarNumber ? `XXXX XXXX ${String(selectedMember.aadhaarNumber).slice(-4)}` : 'No Aadhaar Entered'}
                    </p>
                  </div>
                  {selectedMember.aadhaarDocUrl ? (
                    <Button
                      onClick={() => window.open(getDocUrl(selectedMember.aadhaarDocUrl), '_blank', 'noopener,noreferrer')}
                      className="w-full bg-white border border-gray-200 text-[#1a1f36] hover:bg-[#1a1f36] hover:text-white rounded-xl text-xs font-bold h-10"
                    >
                      <Eye className="w-4 h-4 mr-2" /> View Aadhaar Doc
                    </Button>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No document file attached</p>
                  )}
                </div>

                {/* PAN Card */}
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#1a1f36]">PAN Card</h4>
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-1">
                      {selectedMember.panNumber ? selectedMember.panNumber : 'No PAN Entered'}
                    </p>
                  </div>
                  {selectedMember.panDocUrl ? (
                    <Button
                      onClick={() => window.open(getDocUrl(selectedMember.panDocUrl), '_blank', 'noopener,noreferrer')}
                      className="w-full bg-white border border-gray-200 text-[#1a1f36] hover:bg-[#1a1f36] hover:text-white rounded-xl text-xs font-bold h-10"
                    >
                      <Eye className="w-4 h-4 mr-2" /> View PAN Doc
                    </Button>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No document file attached</p>
                  )}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => updateKycMutation.mutate({ memberId: selectedMember.id, status: 'REJECTED' })}
                  className="rounded-xl font-bold border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject Application'}
                </Button>

                <Button
                  disabled={isUpdating}
                  onClick={() => updateKycMutation.mutate({ memberId: selectedMember.id, status: 'VERIFIED' })}
                  className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" /> Approve & Verify Member
                    </>
                  )}
                </Button>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
