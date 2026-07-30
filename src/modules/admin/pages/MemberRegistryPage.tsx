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

  // Seal & Signature States
  const [isApplyingSeal, setIsApplyingSeal] = useState(false);
  const [adminSignatureFile, setAdminSignatureFile] = useState<File | null>(null);
  const [officeSealFile, setOfficeSealFile] = useState<File | null>(null);
  const [adminSignaturePreview, setAdminSignaturePreview] = useState<string | null>(null);
  const [officeSealPreview, setOfficeSealPreview] = useState<string | null>(null);

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
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    const baseUrl = getApiBaseUrl();
    if (url.startsWith('gs://') || url.startsWith('/uploads/') || url.startsWith('profile/') || url.startsWith('signatures/') || url.startsWith('office/')) {
      return `${baseUrl}/storage/view?path=${encodeURIComponent(url)}`;
    }
    const origin = baseUrl.replace('/api/v1', '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${origin}${cleanPath}`;
  };

  const handleSealSubmit = async () => {
    if (!adminSignatureFile && !officeSealFile) {
      toast.error("Please select at least one file (Signature or Seal)");
      return;
    }
    setIsUpdating(true);
    try {
      const formData = new FormData();
      if (adminSignatureFile) formData.append('adminSignature', adminSignatureFile);
      if (officeSealFile) formData.append('officeSeal', officeSealFile);

      await api.post(`/members/${selectedMember.id}/seal-signature`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Office Seal & Signature applied successfully!");
      setIsApplyingSeal(false);
      setSelectedMember(null);
      queryClient.invalidateQueries({ queryKey: ['admin-members-list'] });
    } catch (err: any) {
      toast.error("Failed to apply Seal & Signature");
    } finally {
      setIsUpdating(false);
    }
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
                                {m.rojaId && <p className="text-xs text-amber-600 font-black mt-0.5">ROJA ID: {m.rojaId}</p>}
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
                              onClick={() => {
                                setSelectedMember(m);
                                setIsApplyingSeal(false);
                                setAdminSignatureFile(null);
                                setOfficeSealFile(null);
                                setAdminSignaturePreview(null);
                                setOfficeSealPreview(null);
                              }}
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
        <DialogContent className="max-w-3xl bg-white rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1a1f36]">
              {isApplyingSeal ? "Generate & Sign Digital ID Card" : "Member Verification & Management"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {isApplyingSeal ? "Apply signature, office seal and preview membership credentials" : "Review member attributes, credentials, and actions"}
            </DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-6 pt-4">
              
              {/* Profile summary card */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1a1f36]">{selectedMember.fullName}</h3>
                  <p className="text-xs font-mono text-slate-500">Member ID: {selectedMember.memberId}</p>
                  {selectedMember.rojaId && <p className="text-xs text-amber-600 font-bold mt-0.5">ROJA ID: {selectedMember.rojaId}</p>}
                  <p className="text-xs text-slate-500 mt-1">Contact: {selectedMember.contact || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">KYC Status</p>
                  <p className="text-sm font-black text-[#6b21a8] mt-1">{selectedMember.kycStatus || 'PENDING'}</p>
                </div>
              </div>

              {isApplyingSeal ? (
                // Seal & Signature Application Workflow
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column: Uploaders */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-400 block">Admin Signature</label>
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAdminSignatureFile(file);
                            setAdminSignaturePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-400 block">Official Office Seal</label>
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setOfficeSealFile(file);
                            setOfficeSealPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsApplyingSeal(false)}
                        className="rounded-xl font-bold"
                      >
                        Back to Review
                      </Button>
                      <Button
                        onClick={handleSealSubmit}
                        disabled={isUpdating}
                        className="flex-1 bg-[#1a1f36] hover:bg-black text-white rounded-xl font-bold"
                      >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save & Generate Card"}
                      </Button>
                    </div>
                  </div>

                  {/* Right Column: Card Preview */}
                  <div className="border border-slate-200 rounded-[30px] p-6 bg-slate-900 text-white relative overflow-hidden shadow-2xl min-h-[350px] flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xs font-black tracking-widest text-[#c9a84c] uppercase">SHARANAM SOCIETY</h4>
                        <p className="text-[8px] text-white/50">OFFICIAL MEMBERSHIP IDENTITY</p>
                      </div>
                      {officeSealPreview ? (
                        <img src={officeSealPreview} className="w-12 h-12 object-contain" alt="Seal" />
                      ) : selectedMember.officeSealUrl ? (
                        <img src={getDocUrl(selectedMember.officeSealUrl)} className="w-12 h-12 object-contain" alt="Seal" />
                      ) : (
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-[8px] text-white/40">Seal</div>
                      )}
                    </div>

                    <div className="flex gap-4 items-center my-4">
                      {selectedMember.photoUrl ? (
                        <img src={getDocUrl(selectedMember.photoUrl)} className="w-20 h-20 rounded-2xl object-cover border-2 border-[#c9a84c]" alt="Member Photo" />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-2xl">M</div>
                      )}
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-sm text-[#c9a84c]">{selectedMember.fullName}</p>
                        <p className="text-[10px] text-white/60">ID: {selectedMember.memberId}</p>
                        <p className="text-[10px] text-white/60">ROJA ID: {selectedMember.rojaId || "Not verified"}</p>
                        <p className="text-[10px] text-white/60">Date: {selectedMember.membershipDate ? new Date(selectedMember.membershipDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/10 pt-4">
                      <div className="space-y-1 text-center">
                        <p className="text-[7px] text-white/40 uppercase font-black">Member Signature</p>
                        {selectedMember.approvedSignatureUrl ? (
                          <img src={getDocUrl(selectedMember.approvedSignatureUrl)} className="h-6 object-contain" alt="User Signature" />
                        ) : (
                          <p className="text-[8px] text-white/20 italic">No Signature</p>
                        )}
                      </div>

                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${selectedMember.memberId}`} className="w-12 h-12 bg-white p-1 rounded" alt="QR" />

                      <div className="space-y-1 text-center">
                        <p className="text-[7px] text-white/40 uppercase font-black">Authorized Signatory</p>
                        {adminSignaturePreview ? (
                          <img src={adminSignaturePreview} className="h-6 object-contain bg-white/20 rounded p-0.5" alt="Admin Signature" />
                        ) : selectedMember.adminSignatureUrl ? (
                          <img src={getDocUrl(selectedMember.adminSignatureUrl)} className="h-6 object-contain" alt="Admin Signature" />
                        ) : (
                          <div className="h-6 w-16 border border-dashed border-white/20 rounded flex items-center justify-center text-[7px] text-white/30">Pending</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Standard Review & Action Panel
                <div className="space-y-6">

                  {/* Pending ID Card Download Request */}
                  {selectedMember.downloadRequestStatus === 'PENDING' && (
                    <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-800">
                        <FileText className="w-4 h-4 text-purple-600 animate-bounce" /> Digital ID Card Download Request
                      </div>
                      <p className="text-xs text-purple-600 font-medium">This member has requested download approval for their digital ID Card.</p>
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={async () => {
                            const reason = prompt('Enter rejection reason:') || 'Requirements not met';
                            try {
                              await api.patch(`/members/${selectedMember.id}/reject-card-download`, { remarks: reason });
                              toast.success('Download request rejected');
                              setSelectedMember(null);
                              queryClient.invalidateQueries({ queryKey: ['admin-members-list'] });
                            } catch (e) { toast.error('Failed to reject request'); }
                          }}
                          className="border-purple-200 text-purple-600 hover:bg-purple-100 font-bold text-xs h-9 rounded-xl"
                          variant="outline"
                        >
                          Reject Request
                        </Button>
                        <Button
                          onClick={async () => {
                            try {
                              await api.patch(`/members/${selectedMember.id}/approve-card-download`);
                              toast.success('Download request approved!');
                              setSelectedMember(null);
                              queryClient.invalidateQueries({ queryKey: ['admin-members-list'] });
                            } catch (e) { toast.error('Failed to approve request'); }
                          }}
                          className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs h-9 rounded-xl"
                        >
                          Approve Download
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Profile Changes Panel */}
                  {selectedMember.pendingProfileChanges && (() => {
                     let changes: any = {};
                     try { changes = JSON.parse(selectedMember.pendingProfileChanges); } catch(e) {}
                     return (
                       <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-4">
                         <h4 className="font-black text-xs uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                           <Clock className="w-4 h-4" /> Pending Profile Changes Request
                         </h4>
                         <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse text-xs">
                             <thead>
                               <tr className="border-b border-amber-200 text-slate-400 font-bold">
                                 <th className="pb-2">Field</th>
                                 <th className="pb-2">Previous Value</th>
                                 <th className="pb-2">Updated Value</th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-amber-100 font-medium">
                               {Object.entries(changes).map(([field, newVal]: [string, any]) => {
                                  let prevVal = selectedMember[field];
                                  if (field === 'dob' && prevVal) prevVal = new Date(prevVal).toLocaleDateString('en-IN');
                                  let formattedNewVal = newVal;
                                  if (field === 'dob' && newVal) formattedNewVal = new Date(newVal).toLocaleDateString('en-IN');
                                  return (
                                    <tr key={field} className="text-slate-700">
                                      <td className="py-2 font-bold uppercase text-[9px]">{field.replace(/([A-Z])/g, ' $1')}</td>
                                      <td className="py-2 line-through text-slate-400">{prevVal || '—'}</td>
                                      <td className="py-2 text-amber-700 font-black">{formattedNewVal || '—'}</td>
                                    </tr>
                                  );
                               })}
                             </tbody>
                           </table>
                         </div>
                         <div className="flex gap-2 justify-end pt-2">
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={async () => {
                               try {
                                 await api.patch(`/members/${selectedMember.id}/reject-profile-changes`);
                                 toast.success('Profile changes rejected!');
                                 setSelectedMember(null);
                                 queryClient.invalidateQueries({ queryKey: ['admin-members-list'] });
                               } catch (err: any) {
                                 toast.error('Failed to reject profile changes');
                               }
                             }}
                             className="border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 h-9 font-bold text-xs rounded-xl"
                           >
                             Reject Changes
                           </Button>
                           <Button
                             size="sm"
                             onClick={async () => {
                               try {
                                 await api.patch(`/members/${selectedMember.id}/approve-profile-changes`);
                                 toast.success('Profile changes approved!');
                                 setSelectedMember(null);
                                 queryClient.invalidateQueries({ queryKey: ['admin-members-list'] });
                               } catch (err: any) {
                                 toast.error('Failed to approve profile changes');
                               }
                             }}
                             className="bg-emerald-600 text-white hover:bg-emerald-700 h-9 font-bold text-xs rounded-xl"
                           >
                             Approve Changes
                           </Button>
                         </div>
                       </div>
                     );
                  })()}

                  {/* Photo & Signature Approval Grids */}
                  {(selectedMember.pendingPhotoUrl || selectedMember.pendingSignatureUrl) && (
                    <div className="grid md:grid-cols-2 gap-4">
                       {selectedMember.pendingPhotoUrl && (
                         <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                           <h4 className="font-bold text-xs text-amber-800">New Profile Photo Uploaded</h4>
                           <img src={getDocUrl(selectedMember.pendingPhotoUrl)} className="w-20 h-20 object-cover rounded-xl border border-amber-200" alt="Pending Photo" />
                           <div className="flex gap-2">
                             <Button
                               size="xs"
                               onClick={async () => {
                                 try {
                                   await api.patch(`/members/${selectedMember.id}/approve-profile-changes`);
                                   toast.success('Photo approved!');
                                   setSelectedMember(null);
                                   queryClient.invalidateQueries({ queryKey: ['admin-members-list'] });
                                 } catch (e) { toast.error('Failed to approve photo'); }
                               }}
                               className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] h-8 font-bold rounded-lg px-3"
                             >
                               Approve
                             </Button>
                             <Button
                               size="xs"
                               variant="outline"
                               onClick={async () => {
                                 try {
                                   await api.patch(`/members/${selectedMember.id}/reject-profile-changes`);
                                   toast.success('Photo rejected!');
                                   setSelectedMember(null);
                                   queryClient.invalidateQueries({ queryKey: ['admin-members-list'] });
                                 } catch (e) { toast.error('Failed to reject photo'); }
                               }}
                               className="border-rose-200 text-rose-600 text-[10px] h-8 font-bold rounded-lg px-3"
                             >
                               Reject
                             </Button>
                           </div>
                         </div>
                       )}
                       {selectedMember.pendingSignatureUrl && (
                         <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                           <h4 className="font-bold text-xs text-amber-800">New Digital Signature Uploaded</h4>
                           <img src={getDocUrl(selectedMember.pendingSignatureUrl)} className="h-12 object-contain rounded border border-amber-200 bg-white p-1" alt="Pending Signature" />
                           <div className="flex gap-2">
                             <Button
                               size="xs"
                               onClick={async () => {
                                 try {
                                   await api.patch(`/members/${selectedMember.id}/approve-profile-changes`);
                                   toast.success('Signature approved!');
                                   setSelectedMember(null);
                                   queryClient.invalidateQueries({ queryKey: ['admin-members-list'] });
                                 } catch (e) { toast.error('Failed to approve signature'); }
                               }}
                               className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] h-8 font-bold rounded-lg px-3"
                             >
                               Approve
                             </Button>
                             <Button
                               size="xs"
                               variant="outline"
                               onClick={async () => {
                                 try {
                                   await api.patch(`/members/${selectedMember.id}/reject-profile-changes`);
                                   toast.success('Signature rejected!');
                                   setSelectedMember(null);
                                   queryClient.invalidateQueries({ queryKey: ['admin-members-list'] });
                                 } catch (e) { toast.error('Failed to reject signature'); }
                               }}
                               className="border-rose-200 text-rose-600 text-[10px] h-8 font-bold rounded-lg px-3"
                             >
                               Reject
                             </Button>
                           </div>
                         </div>
                       )}
                    </div>
                  )}

                  {/* Documents Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
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

                  {/* Actions Bar */}
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
                      onClick={() => setIsApplyingSeal(true)}
                      className="rounded-xl font-bold bg-[#c9a84c] hover:bg-[#b0903b] text-white px-6"
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" /> Seal & Signature
                    </Button>

                    {selectedMember.kycStatus !== 'VERIFIED' && (
                      <Button
                        disabled={isUpdating}
                        onClick={async () => {
                          setIsUpdating(true);
                          try {
                            await api.patch(`/members/${selectedMember.id}/verify-roja`);
                            toast.success("Registered ID approved & member verified successfully!");
                            setSelectedMember(null);
                            queryClient.invalidateQueries({ queryKey: ['admin-members-list'] });
                          } catch (err: any) {
                            toast.error(err?.response?.data?.message || 'Failed to verify Registered ID');
                          } finally {
                            setIsUpdating(false);
                          }
                        }}
                        className="rounded-xl font-bold bg-[#1a1f36] hover:bg-black text-white px-6"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-2" /> Approve Registered ID
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
