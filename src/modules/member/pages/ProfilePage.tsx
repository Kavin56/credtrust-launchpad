import React, { useEffect, useMemo, useState } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  ChevronRight, 
  Home, 
  Eye, 
  Camera, 
  AlertCircle, 
  FileText, 
  Users, 
  Globe2, 
  Lock,
  Download,
  Fingerprint
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api, { getApiErrorMessage, getApiBaseUrl } from "@/lib/api";
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const ProfilePage = () => {
  const [activeView, setActiveView] = useState('personal'); // personal, kyc, nominee, security
  const [isEditing, setIsEditing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocType, setUploadDocType] = useState('aadhaarDoc');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [formState, setFormState] = useState({
    fullName: "",
    contact: "",
    address: "",
    course: "",
    seatBookingNumber: "",
    dob: "",
    designation: "",
    department: "",
    gender: "",
    bloodGroup: "",
    emergencyContact: "",
  });
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["member-profile"],
    queryFn: async () => {
      const { data } = await api.get("/members/me");
      return data;
    },
  });

  useEffect(() => {
    if (!profile) return;
    let dobString = "";
    if (profile.dob) {
      try {
        dobString = new Date(profile.dob).toISOString().split('T')[0];
      } catch (e) {}
    }
    setFormState({
      fullName: profile.fullName || "",
      contact: profile.contact || "",
      address: profile.address || "",
      course: profile.course || "",
      seatBookingNumber: profile.seatBookingNumber || "",
      dob: dobString,
      designation: profile.designation || "",
      department: profile.department || "",
      gender: profile.gender || "",
      bloodGroup: profile.bloodGroup || "",
      emergencyContact: profile.emergencyContact || "",
    });
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch("/members/me", {
        fullName: formState.fullName.trim(),
        contact: formState.contact.trim(),
        address: formState.address.trim(),
        course: formState.course.trim(),
        seatBookingNumber: formState.seatBookingNumber.trim(),
        dob: formState.dob ? new Date(formState.dob).toISOString() : undefined,
        designation: formState.designation.trim(),
        department: formState.department.trim(),
        gender: formState.gender.trim(),
        bloodGroup: formState.bloodGroup.trim(),
        emergencyContact: formState.emergencyContact.trim(),
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["member-profile"] });
      queryClient.invalidateQueries({ queryKey: ["member-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-loans"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to update profile."));
    },
  });

  const profileView = useMemo(() => {
    const joinedAt = profile?.joinedAt ? new Date(profile.joinedAt) : null;
    const dob = profile?.dob ? new Date(profile.dob) : null;

    return {
      initials: (profile?.fullName || profile?.user?.email || "M")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part[0]?.toUpperCase() || "")
        .join(""),
      fullName: profile?.fullName || "Member",
      memberId: profile?.memberId || "--",
      email: profile?.user?.email || "",
      contact: profile?.contact || "",
      address: profile?.address || "",
      course: profile?.course || "",
      seatBookingNumber: profile?.seatBookingNumber || "",
      dob: dob ? dob.toLocaleDateString("en-IN") : "",
      joined: joinedAt
        ? joinedAt.toLocaleDateString("en-IN", { month: "short", year: "numeric" })
        : "--",
      status: profile?.kycStatus || profile?.status || "PENDING",
      designation: profile?.designation || "",
      department: profile?.department || "",
      gender: profile?.gender || "",
      bloodGroup: profile?.bloodGroup || "",
      emergencyContact: profile?.emergencyContact || "",
      issueDate: profile?.issueDate ? new Date(profile.issueDate).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"),
      expiryDate: profile?.expiryDate ? new Date(profile.expiryDate).toLocaleDateString("en-IN") : "Permanent",
      photoUrl: profile?.photoUrl || null,
      kycStatus: profile?.kycStatus,
    };
  }, [profile]);

  const kycCards = useMemo(
    () => [
      {
        name: "Aadhaar Number",
        value: profile?.aadhaarNumber
          ? `XXXX XXXX ${String(profile.aadhaarNumber).slice(-4)}`
          : "Not available",
        url: profile?.aadhaarDocUrl,
      },
      {
        name: "PAN Number",
        value: profile?.panNumber
          ? `${String(profile.panNumber).slice(0, 2)}XXXX${String(profile.panNumber).slice(-2)}`
          : "Not available",
        url: profile?.panDocUrl,
      },
      { name: "KYC Status", value: profileView.status, url: null },
      { name: "Member Since", value: profileView.joined, url: null },
    ],
    [profile, profileView.joined, profileView.status],
  );

  const getDocUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseUrl = getApiBaseUrl();
    if (url.startsWith('gs://') || url.startsWith('/uploads/')) {
      return `${baseUrl}/storage/view?path=${encodeURIComponent(url)}`;
    }
    const origin = baseUrl.replace('/api/v1', '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${origin}${cleanPath}`;
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  const handleUploadDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Please select a document file to upload.");
      return;
    }
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append("docType", uploadDocType);
      formData.append("file", uploadFile);
      await api.post("/members/me/document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("KYC Document uploaded successfully!");
      setShowUploadModal(false);
      setUploadFile(null);
      queryClient.invalidateQueries({ queryKey: ["member-profile"] });
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, "Failed to upload document."));
    } finally {
      setUploadingDoc(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile picture must be under 5MB.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post("/members/me/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile photo updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["member-profile"] });
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, "Failed to upload profile photo."));
    }
  };

  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [uploadingSig, setUploadingSig] = useState(false);

  const handleSignatureUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureFile) return;
    setUploadingSig(true);
    try {
      const formData = new FormData();
      formData.append('file', signatureFile);
      await api.post('/members/me/signature', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Signature uploaded successfully! Awaiting Admin approval.");
      setSignatureFile(null);
      queryClient.invalidateQueries({ queryKey: ["member-profile"] });
    } catch (err) {
      toast.error("Failed to upload signature");
    } finally {
      setUploadingSig(false);
    }
  };

  const handleRequestDownload = async () => {
    try {
      await api.post('/members/me/request-card-download');
      toast.success("Download request submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["member-profile"] });
    } catch (err) {
      toast.error("Failed to request ID Card download");
    }
  };

  const handlePrintCard = () => {
    const printContent = document.getElementById('printable-membership-card');
    if (!printContent) return;
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = `PrintWindow_${uniqueName}`;
    const printWindow = window.open(windowUrl, windowName, 'left=50,top=50,width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Membership ID Card - ${profileView.fullName}</title>
            <style>
              body {
                font-family: system-ui, sans-serif;
                margin: 0;
                padding: 40px;
                display: flex;
                justify-content: center;
                align-items: center;
                background: #f1f5f9;
              }
              .card {
                width: 450px;
                height: 280px;
                background: #0f172a;
                color: white;
                border-radius: 20px;
                padding: 24px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
              }
              .header h2 {
                margin: 0;
                font-size: 14px;
                letter-spacing: 0.1em;
                color: #c9a84c;
              }
              .header p {
                margin: 2px 0 0 0;
                font-size: 8px;
                opacity: 0.6;
              }
              .seal {
                width: 50px;
                height: 50px;
                object-fit: contain;
              }
              .body {
                display: flex;
                gap: 16px;
                margin: 16px 0;
                align-items: center;
              }
              .photo {
                width: 80px;
                height: 80px;
                border-radius: 12px;
                object-fit: cover;
                border: 2px solid #c9a84c;
              }
              .details {
                font-size: 11px;
                line-height: 1.4;
              }
              .name {
                font-weight: bold;
                font-size: 13px;
                color: #c9a84c;
              }
              .footer {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                border-top: 1px solid rgba(255,255,255,0.1);
                padding-top: 10px;
              }
              .sig-block {
                text-align: center;
                font-size: 7px;
                opacity: 0.7;
              }
              .sig-img {
                height: 25px;
                max-width: 80px;
                object-fit: contain;
              }
              .qr {
                width: 45px;
                height: 45px;
                background: white;
                padding: 2px;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <div>
                  <h2>SHARANAM SOCIETY</h2>
                  <p>MEMBERSHIP CREDENTIALS CARD</p>
                </div>
                ${printContent.querySelector('.office-seal-preview') ? `<img class="seal" src="${(printContent.querySelector('.office-seal-preview') as HTMLImageElement).src}" />` : ''}
              </div>
              <div class="body">
                <img class="photo" src="${(printContent.querySelector('.member-photo-preview') as HTMLImageElement).src}" />
                <div class="details">
                  <div class="name">${profileView.fullName}</div>
                  <div>Registered ID: ${profileView.kycStatus === 'VERIFIED' ? profileView.memberId : 'Pending Allocation'}</div>
                  <div>Date: ${profile?.membershipDate ? new Date(profile.membershipDate).toLocaleDateString('en-IN') : '—'}</div>
                  <div>Phone: ${profileView.contact}</div>
                </div>
              </div>
              <div class="footer">
                <div class="sig-block">
                  <div>USER SIGNATURE</div>
                  ${printContent.querySelector('.user-sig-preview') ? `<img class="sig-img" src="${(printContent.querySelector('.user-sig-preview') as HTMLImageElement).src}" />` : '<div>—</div>'}
                </div>
                <img class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${profileView.memberId}" />
                <div class="sig-block">
                  <div>AUTHORIZED SIGNATURE</div>
                  ${printContent.querySelector('.admin-sig-preview') ? `<img class="sig-img" src="${(printContent.querySelector('.admin-sig-preview') as HTMLImageElement).src}" />` : '<div>PENDING</div>'}
                </div>
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
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
          <span className="text-[#1a1f36] font-bold">Profile & Identity</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* LEFT SIDEBAR NAVIGATION */}
          <aside className="lg:w-[320px] space-y-6 shrink-0">
             <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 text-center space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-full h-24 bg-gradient-to-br from-[#1a1f36] to-[#6b21a8] rounded-t-[40px]" />
                <div className="relative pt-6">
                   <div className="w-28 h-28 relative rounded-[32px] border-4 border-white shadow-xl bg-[#c9a84c] mx-auto flex items-center justify-center text-white text-[40px] font-black group-hover:rotate-6 transition-transform duration-500 overflow-hidden">
                      {profileView.photoUrl ? (
                        <img src={getDocUrl(profileView.photoUrl)} alt={profileView.fullName} className="w-full h-full object-cover" />
                      ) : (
                        isLoading ? "..." : profileView.initials
                      )}
                      <label className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1a1f36] shadow-lg cursor-pointer z-10">
                         <Camera className="w-4 h-4" />
                         <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                   </div>
                </div>
                <div>
                   <h2 className="text-xl font-bold text-[#1a1f36]">{isLoading ? "Loading profile..." : profileView.fullName}</h2>
                   <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">REGISTERED ID: {profileView.kycStatus === 'VERIFIED' ? profileView.memberId : 'PENDING ALLOCATION'}</p>
                </div>
                <div className="pt-6 border-t border-gray-50 flex justify-center gap-6">
                   <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Status</p>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold border border-emerald-100">{profileView.status}</span>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Joined</p>
                      <p className="text-[12px] font-bold text-[#1a1f36]">{profileView.joined}</p>
                   </div>
                </div>
             </div>

             <nav className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden py-4">
                {[
                  { id: 'personal', label: 'Personal Information', icon: User },
                  { id: 'idcard', label: 'Membership ID Card', icon: Fingerprint },
                  { id: 'kyc', label: 'KYC Documents', icon: ShieldCheck },
                  { id: 'nominee', label: 'Nominee Management', icon: Users },
                  { id: 'security', label: 'Security & Password', icon: Lock }
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-4 px-8 py-5 transition-all relative border-l-4 ${
                      activeView === item.id ? "bg-[#1a1f36]/[0.02] text-[#6b21a8] border-[#6b21a8] font-bold" : "text-gray-400 border-transparent hover:text-gray-600"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-[13px]">{item.label}</span>
                    {activeView === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
             </nav>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="flex-grow space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             
             {/* Personal Information View */}
             <AnimatePresence mode="wait">
                {activeView === 'personal' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-10">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <h3 className="text-2xl font-bold text-[#1a1f36]">Manage Personal Identity</h3>
                           <p className="text-sm text-gray-400 font-medium">Keep your contact details updated for banking alerts</p>
                        </div>
                        <Button 
                           onClick={() => {
                              if (isEditing && profile) {
                                let dobString = "";
                                if (profile.dob) {
                                  try {
                                    dobString = new Date(profile.dob).toISOString().split('T')[0];
                                  } catch (e) {}
                                }
                                setFormState({
                                  fullName: profile.fullName || "",
                                  contact: profile.contact || "",
                                  address: profile.address || "",
                                  course: profile.course || "",
                                  seatBookingNumber: profile.seatBookingNumber || "",
                                  dob: dobString,
                                  designation: profile.designation || "",
                                  department: profile.department || "",
                                  gender: profile.gender || "",
                                  bloodGroup: profile.bloodGroup || "",
                                  emergencyContact: profile.emergencyContact || "",
                                });
                              }
                              setIsEditing(!isEditing);
                           }} 
                           disabled={updateProfileMutation.isPending}
                           className={`rounded-2xl px-8 h-12 font-bold transition-all ${
                              isEditing ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-[#1a1f36] text-white hover:bg-black"
                           }`}
                        >
                           {isEditing ? "Cancel Edit" : "Update Profile"}
                        </Button>
                     </div>

                     <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Full Legal Name</Label>
                           <Input
                             value={isEditing ? formState.fullName : profileView.fullName}
                             onChange={(e) => setFormState((current) => ({ ...current, fullName: e.target.value }))}
                             disabled={!isEditing || updateProfileMutation.isPending}
                             className={`h-14 rounded-2xl border-gray-100 transition-all ${isEditing ? "bg-white ring-2 ring-[#6b21a8]/10" : "bg-gray-50/50"}`}
                           />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Date of Birth</Label>
                           <Input 
                             type="date"
                             value={isEditing ? formState.dob : formState.dob} 
                             onChange={(e) => setFormState((current) => ({ ...current, dob: e.target.value }))}
                             disabled={!isEditing || updateProfileMutation.isPending} 
                             className={`h-14 rounded-2xl border-gray-100 transition-all ${isEditing ? "bg-white ring-2 ring-[#6b21a8]/10" : "bg-gray-50/50"}`}
                           />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Email Address</Label>
                           <Input value={profileView.email} readOnly disabled className="h-14 rounded-2xl border-gray-100 bg-gray-50/50" />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Mobile Number</Label>
                           <Input
                             value={isEditing ? formState.contact : profileView.contact}
                             onChange={(e) => setFormState((current) => ({ ...current, contact: e.target.value }))}
                             disabled={!isEditing || updateProfileMutation.isPending}
                             className={`h-14 rounded-2xl border-gray-100 transition-all ${isEditing ? "bg-white ring-2 ring-[#6b21a8]/10" : "bg-gray-50/50"}`}
                           />
                        </div>
                        <div className="md:col-span-2 space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Residential Address</Label>
                           <Input
                             value={isEditing ? formState.address : profileView.address}
                             onChange={(e) => setFormState((current) => ({ ...current, address: e.target.value }))}
                             disabled={!isEditing || updateProfileMutation.isPending}
                             className={`h-14 rounded-2xl border-gray-100 transition-all ${isEditing ? "bg-white ring-2 ring-[#6b21a8]/10" : "bg-gray-50/50"}`}
                           />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Other Details (if applicable)</Label>
                           <Input
                             value={isEditing ? formState.course : profileView.course}
                             onChange={(e) => setFormState((current) => ({ ...current, course: e.target.value }))}
                             disabled={!isEditing || updateProfileMutation.isPending}
                             placeholder="e.g. Additional details/membership references"
                             className={`h-14 rounded-2xl border-gray-100 transition-all ${isEditing ? "bg-white ring-2 ring-[#6b21a8]/10" : "bg-gray-50/50"}`}
                           />
                        </div>
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Unique ID</Label>
                           <Input
                             value={profileView.seatBookingNumber}
                             disabled
                             className="h-14 rounded-2xl border-gray-100 bg-gray-50/50"
                           />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Registered ID</Label>
                           <Input
                             value={profileView.kycStatus === 'VERIFIED' ? profileView.memberId : 'PENDING ALLOCATION'}
                             disabled
                             className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold"
                           />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Role / Designation</Label>
                           <Input
                             value={isEditing ? formState.designation : profileView.designation}
                             onChange={(e) => setFormState((current) => ({ ...current, designation: e.target.value }))}
                             disabled={!isEditing || updateProfileMutation.isPending}
                             placeholder="e.g. Student, Officer"
                             className={`h-14 rounded-2xl border-gray-100 transition-all ${isEditing ? "bg-white ring-2 ring-[#6b21a8]/10" : "bg-gray-50/50"}`}
                           />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Department / Organization</Label>
                           <Input
                             value={isEditing ? formState.department : profileView.department}
                             onChange={(e) => setFormState((current) => ({ ...current, department: e.target.value }))}
                             disabled={!isEditing || updateProfileMutation.isPending}
                             placeholder="e.g. Science Dept, IT"
                             className={`h-14 rounded-2xl border-gray-100 transition-all ${isEditing ? "bg-white ring-2 ring-[#6b21a8]/10" : "bg-gray-50/50"}`}
                           />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Gender (Optional)</Label>
                           <Input
                             value={isEditing ? formState.gender : profileView.gender}
                             onChange={(e) => setFormState((current) => ({ ...current, gender: e.target.value }))}
                             disabled={!isEditing || updateProfileMutation.isPending}
                             placeholder="e.g. Male, Female, Other"
                             className={`h-14 rounded-2xl border-gray-100 transition-all ${isEditing ? "bg-white ring-2 ring-[#6b21a8]/10" : "bg-gray-50/50"}`}
                           />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Blood Group (Optional)</Label>
                           <Input
                             value={isEditing ? formState.bloodGroup : profileView.bloodGroup}
                             onChange={(e) => setFormState((current) => ({ ...current, bloodGroup: e.target.value }))}
                             disabled={!isEditing || updateProfileMutation.isPending}
                             placeholder="e.g. O+, A-, B+"
                             className={`h-14 rounded-2xl border-gray-100 transition-all ${isEditing ? "bg-white ring-2 ring-[#6b21a8]/10" : "bg-gray-50/50"}`}
                           />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Emergency Contact (Optional)</Label>
                           <Input
                             value={isEditing ? formState.emergencyContact : profileView.emergencyContact}
                             onChange={(e) => setFormState((current) => ({ ...current, emergencyContact: e.target.value }))}
                             disabled={!isEditing || updateProfileMutation.isPending}
                             placeholder="e.g. +91 98765 43210"
                             className={`h-14 rounded-2xl border-gray-100 transition-all ${isEditing ? "bg-white ring-2 ring-[#6b21a8]/10" : "bg-gray-50/50"}`}
                           />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Issue Date (Fixed by Society)</Label>
                           <Input value={profileView.issueDate} disabled className="h-14 rounded-2xl border-gray-100 bg-gray-50/50" />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Expiry Date (Fixed by Society)</Label>
                           <Input value={profileView.expiryDate} disabled className="h-14 rounded-2xl border-gray-100 bg-gray-50/50" />
                        </div>

                        {isEditing && (
                           <div className="md:col-span-2 pt-6">
                              <Button
                                type="submit"
                                disabled={updateProfileMutation.isPending}
                                className="h-14 w-full bg-[#c9a84c] text-white rounded-2xl hover:bg-[#d4b65c] font-black shadow-xl shadow-amber-900/10"
                              >
                                 {updateProfileMutation.isPending ? "Saving Profile..." : "Save Profile Changes"}
                              </Button>
                           </div>
                        )}
                     </form>

                     {/* Candidate Signature Upload */}
                     <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-[32px] p-8 space-y-6">
                       <div className="flex items-start justify-between">
                         <div>
                           <h4 className="text-lg font-bold text-[#1a1f36] flex items-center gap-2">
                             <FileText className="w-5 h-5 text-[#c9a84c]" />
                             Candidate Signature Upload
                           </h4>
                           <p className="text-xs text-gray-400 mt-1 font-medium">
                             Upload your signature in <span className="font-bold text-slate-600">JPG</span> or <span className="font-bold text-slate-600">PDF</span> format. Max size: 2MB.
                           </p>
                         </div>
                         {profile?.approvedSignatureUrl ? (
                           <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100 uppercase tracking-wider">✓ Verified</span>
                         ) : profile?.pendingSignatureUrl ? (
                           <span className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black border border-amber-100 uppercase tracking-wider animate-pulse">⏳ Pending Review</span>
                         ) : (
                           <span className="px-3 py-1.5 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black border border-rose-100 uppercase tracking-wider">Not Uploaded</span>
                         )}
                       </div>

                       <form onSubmit={handleSignatureUpload} className="space-y-5">
                         <div className="flex flex-col sm:flex-row gap-4 items-end">
                           <div className="space-y-2 flex-grow w-full">
                             <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Signature File (JPG / PDF only)</Label>
                             <Input
                               type="file"
                               accept=".jpg,.jpeg,.pdf"
                               onChange={(e) => {
                                 const file = e.target.files?.[0] || null;
                                 if (file) {
                                   const validTypes = ['image/jpeg', 'image/jpg', 'application/pdf'];
                                   if (!validTypes.includes(file.type)) {
                                     toast.error("Only JPG and PDF files are accepted.");
                                     e.target.value = '';
                                     setSignatureFile(null);
                                     return;
                                   }
                                   if (file.size > 2 * 1024 * 1024) {
                                     toast.error("File size must be under 2MB.");
                                     e.target.value = '';
                                     setSignatureFile(null);
                                     return;
                                   }
                                 }
                                 setSignatureFile(file);
                               }}
                               className="h-14 rounded-2xl bg-white border-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1a1f36] file:text-white hover:file:bg-[#2d3356] cursor-pointer"
                             />
                           </div>
                           <Button
                             type="submit"
                             disabled={uploadingSig || !signatureFile}
                             className="h-14 px-10 bg-[#c9a84c] text-white hover:bg-[#b0903b] font-black rounded-2xl shadow-lg shadow-amber-900/10 w-full sm:w-auto transition-all disabled:opacity-40"
                           >
                             {uploadingSig ? (
                               <span className="flex items-center gap-2">
                                 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                 Uploading...
                               </span>
                             ) : "Upload Signature"}
                           </Button>
                         </div>

                         {/* Signature Preview */}
                         {(profile?.approvedSignatureUrl || profile?.pendingSignatureUrl) && (
                           <div className="flex items-center gap-6 p-5 bg-white border border-slate-100 rounded-2xl">
                             <div className="space-y-1">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Signature</p>
                               <div className="h-12 w-32 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center p-1">
                                 {(profile?.approvedSignatureUrl || profile?.pendingSignatureUrl)?.endsWith('.pdf') ? (
                                   <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                                     <FileText className="w-4 h-4 text-rose-500" />
                                     PDF File
                                   </div>
                                 ) : (
                                   <img
                                     src={getDocUrl(profile?.approvedSignatureUrl || profile?.pendingSignatureUrl)}
                                     alt="Signature"
                                     className={`h-full object-contain ${!profile?.approvedSignatureUrl ? 'opacity-50' : ''}`}
                                   />
                                 )}
                               </div>
                             </div>
                             <div className="text-xs text-slate-500 font-medium">
                               {profile?.approvedSignatureUrl
                                 ? "Your signature has been approved by the admin and will appear on your membership ID card."
                                 : "Your signature has been submitted and is awaiting admin verification."}
                             </div>
                           </div>
                         )}
                       </form>
                     </div>
                  </motion.div>
                )}

                {activeView === 'idcard' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-10">
                        <div className="space-y-1">
                           <h3 className="text-2xl font-bold text-[#1a1f36]">Membership Credentials Card</h3>
                           <p className="text-sm text-gray-400 font-medium">Verify your digital signature and download your official society ID card</p>
                        </div>

                        <div className="grid lg:grid-cols-[1fr,400px] gap-10">
                          {/* Left Column: Signature upload and Request controls */}
                          <div className="space-y-8">
                            
                            {/* Signature upload block */}
                            <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] space-y-6">
                              <div>
                                <h4 className="text-lg font-bold text-[#1a1f36]">Your Digital Signature</h4>
                                <p className="text-xs text-gray-400 mt-1 font-medium">Upload your signature to display on your membership card. Supports PNG/JPG/PDF.</p>
                              </div>

                              <form onSubmit={handleSignatureUpload} className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="space-y-2 flex-grow w-full">
                                  <Label className="text-xs font-black uppercase text-slate-400">Select Signature File</Label>
                                  <Input 
                                    type="file" 
                                    accept="image/*,.pdf" 
                                    onChange={e => setSignatureFile(e.target.files?.[0] || null)}
                                    className="h-12 rounded-xl bg-white border-slate-200"
                                  />
                                </div>
                                <Button
                                  type="submit"
                                  disabled={uploadingSig || !signatureFile}
                                  className="h-12 px-8 bg-[#1a1f36] text-white hover:bg-black font-bold rounded-xl w-full sm:w-auto"
                                >
                                  {uploadingSig ? "Uploading..." : "Upload"}
                                </Button>
                              </form>

                              {/* Status Display */}
                              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Approval Status</p>
                                  <div className="mt-1 flex items-center gap-2">
                                    {profile?.approvedSignatureUrl ? (
                                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">Approved</span>
                                    ) : profile?.pendingSignatureUrl ? (
                                      <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-100">Pending Review</span>
                                    ) : (
                                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">No Signature Uploaded</span>
                                    )}
                                  </div>
                                </div>
                                {profile?.approvedSignatureUrl && (
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase text-right">Signature Preview</p>
                                    <img src={getDocUrl(profile.approvedSignatureUrl)} className="h-8 object-contain mt-1 bg-white p-1 rounded border" alt="Approved Signature" />
                                  </div>
                                )}
                                {!profile?.approvedSignatureUrl && profile?.pendingSignatureUrl && (
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase text-right">Uploaded Preview</p>
                                    <img src={getDocUrl(profile.pendingSignatureUrl)} className="h-8 object-contain mt-1 bg-white p-1 rounded border opacity-50" alt="Pending Signature" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Download Request Actions */}
                            <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] space-y-6">
                              <div>
                                <h4 className="text-lg font-bold text-[#1a1f36]">Card Download Authorization</h4>
                                <p className="text-xs text-gray-400 mt-1 font-medium">To protect your credentials, downloading your digital card requires a one-time admin approval.</p>
                              </div>

                              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Clearance Status</p>
                                  <p className="text-sm font-black text-[#1a1f36] mt-0.5">
                                    {profile?.downloadRequestStatus === 'APPROVED' ? 'Approved (Ready to Download)' : 
                                     profile?.downloadRequestStatus === 'PENDING' ? 'Awaiting Approval' : 
                                     profile?.downloadRequestStatus === 'REJECTED' ? 'Rejected' : 'Not Requested'}
                                  </p>
                                  {profile?.downloadRequestStatus === 'REJECTED' && (
                                    <p className="text-xs text-rose-500 font-bold mt-1">Reason: {profile.downloadRequestRemarks || 'Incomplete profile'}</p>
                                  )}
                                </div>

                                {(!profile?.downloadRequestStatus || profile?.downloadRequestStatus === 'IDLE' || profile?.downloadRequestStatus === 'REJECTED') ? (
                                  <Button
                                    onClick={handleRequestDownload}
                                    className="bg-[#c9a84c] hover:bg-[#b0903b] text-white font-bold h-11 px-6 rounded-xl w-full sm:w-auto"
                                  >
                                    Request Download Access
                                  </Button>
                                ) : profile?.downloadRequestStatus === 'APPROVED' ? (
                                  <Button
                                    onClick={handlePrintCard}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 rounded-xl w-full sm:w-auto flex items-center gap-2"
                                  >
                                    <Download className="w-4 h-4" /> Download / Print ID Card
                                  </Button>
                                ) : (
                                  <span className="text-xs font-bold text-slate-400 italic">Review in progress</span>
                                )}
                              </div>
                            </div>

                          </div>

                          {/* Right Column: ID Card Preview Container */}
                          <div className="space-y-4">
                            <label className="text-xs font-black uppercase text-slate-400 block px-2">Interactive Preview</label>
                            
                            {profile?.idCardStatus !== 'GENERATED' ? (
                              <div className="border-2 border-dashed border-slate-200 rounded-[36px] p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[350px] bg-slate-50/50">
                                <Fingerprint className="w-16 h-16 text-slate-200 mb-4 animate-pulse" />
                                <p className="font-bold text-[#1a1f36] text-sm">ID Card Not Generated</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Admin must apply the official signature and office seal in the Member Registry.</p>
                              </div>
                            ) : (
                              <div 
                                id="printable-membership-card"
                                className="border border-slate-800 rounded-[30px] p-6 bg-slate-950 text-white relative overflow-hidden shadow-2xl min-h-[350px] flex flex-col justify-between"
                              >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#c9a84c]/20 to-transparent rounded-full blur-2xl" />
                                
                                <div className="flex justify-between items-start gap-4 relative z-10">
                                  <div>
                                    <h4 className="text-[11px] font-black tracking-widest text-[#c9a84c] uppercase">SHARANAM SOCIETY</h4>
                                    <p className="text-[7px] text-white/50">OFFICIAL MEMBERSHIP IDENTITY</p>
                                  </div>
                                  {profile?.officeSealUrl && (
                                    <img src={getDocUrl(profile.officeSealUrl)} className="w-12 h-12 object-contain office-seal-preview" alt="Seal" />
                                  )}
                                </div>

                                <div className="flex gap-4 items-center my-4 relative z-10">
                                  {profileView.photoUrl ? (
                                    <img src={getDocUrl(profileView.photoUrl)} className="w-20 h-20 rounded-2xl object-cover border-2 border-[#c9a84c] member-photo-preview" alt="Member Photo" />
                                  ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-2xl">M</div>
                                  )}
                                  <div className="space-y-1 text-xs">
                                    <p className="font-bold text-sm text-[#c9a84c]">{profileView.fullName}</p>
                                    <p className="text-[10px] text-white/60">Registered ID: {profileView.kycStatus === 'VERIFIED' ? profileView.memberId : 'Pending Allocation'}</p>
                                    <p className="text-[10px] text-white/60">Date: {profile?.membershipDate ? new Date(profile.membershipDate).toLocaleDateString('en-IN') : '—'}</p>
                                  </div>
                                </div>

                                <div className="flex justify-between items-end border-t border-white/10 pt-4 relative z-10">
                                  <div className="space-y-1 text-center">
                                    <p className="text-[7px] text-white/40 uppercase font-black">Member Signature</p>
                                    {profile?.approvedSignatureUrl ? (
                                      <img src={getDocUrl(profile.approvedSignatureUrl)} className="h-6 object-contain user-sig-preview bg-white/5 rounded px-1" alt="User Signature" />
                                    ) : (
                                      <p className="text-[8px] text-white/20 italic">No Signature</p>
                                    )}
                                  </div>

                                  <QRCodeSVG value={profileView.memberId || 'MEMBER-ID'} size={40} fgColor="#1a1f36" className="bg-white p-0.5 rounded" />

                                  <div className="space-y-1 text-center">
                                    <p className="text-[7px] text-white/40 uppercase font-black">Authorized Signatory</p>
                                    {profile?.adminSignatureUrl ? (
                                      <img src={getDocUrl(profile.adminSignatureUrl)} className="h-6 object-contain admin-sig-preview bg-white/5 rounded px-1" alt="Admin Signature" />
                                    ) : (
                                      <div className="h-6 w-16 border border-dashed border-white/20 rounded flex items-center justify-center text-[7px] text-white/30">Pending</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                     </div>
                  </motion.div>
                )}

                {activeView === 'kyc' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                     <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-10">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <h3 className="text-2xl font-bold text-[#1a1f36]">KYC Vault</h3>
                              <p className="text-sm text-gray-400 font-medium">Your verified identity documents and portal access cards</p>
                           </div>
                           <Button 
                              onClick={() => setShowUploadModal(true)}
                              className="h-12 px-8 bg-[#1a1f36] text-white rounded-2xl font-bold hover:bg-[#2a2f46] transition-all"
                            >
                              Upload New Document
                            </Button>
                        </div>

                        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                           <DialogContent className="max-w-md bg-white rounded-3xl p-6">
                             <DialogHeader>
                               <DialogTitle className="text-xl font-bold text-[#1a1f36]">Upload KYC Document</DialogTitle>
                               <DialogDescription className="text-sm text-gray-500">
                                 Select the document type and upload a PDF or image file (Max 20MB).
                               </DialogDescription>
                             </DialogHeader>
                             <form onSubmit={handleUploadDocumentSubmit} className="space-y-5 mt-4">
                               <div className="space-y-2">
                                 <Label className="text-xs font-bold text-gray-600 uppercase">Document Type</Label>
                                 <select
                                   value={uploadDocType}
                                   onChange={(e) => setUploadDocType(e.target.value)}
                                   className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#1a1f36] outline-none"
                                 >
                                   <option value="aadhaarDoc">Aadhaar Card</option>
                                   <option value="panDoc">PAN Card</option>
                                 </select>
                               </div>

                               <div className="space-y-2">
                                 <Label className="text-xs font-bold text-gray-600 uppercase">Document File</Label>
                                 <Input
                                   type="file"
                                   accept=".pdf,image/*"
                                   onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                   className="h-12 rounded-xl cursor-pointer"
                                 />
                               </div>

                               <div className="flex justify-end gap-3 pt-2">
                                 <Button
                                   type="button"
                                   variant="outline"
                                   onClick={() => setShowUploadModal(false)}
                                   className="rounded-xl font-bold"
                                 >
                                   Cancel
                                 </Button>
                                 <Button
                                   type="submit"
                                   disabled={uploadingDoc || !uploadFile}
                                   className="bg-[#1a1f36] text-white rounded-xl font-bold px-6"
                                 >
                                   {uploadingDoc ? "Uploading..." : "Upload Document"}
                                 </Button>
                               </div>
                             </form>
                           </DialogContent>
                         </Dialog>

                        <div className="grid md:grid-cols-2 gap-8">
                           {kycCards.map((doc, i) => (
                             <div key={i} className="p-8 bg-gray-50 rounded-[40px] border border-gray-200/50 flex flex-col justify-between group hover:border-[#6b21a8] transition-all cursor-pointer h-60 relative overflow-hidden">
                                <FileText className="absolute -right-4 -bottom-4 w-32 h-32 text-[#1a1f36]/[0.03] group-hover:rotate-12 transition-transform duration-500" />
                                <div className="space-y-4 relative z-10">
                                   <div className="px-4 py-1.5 rounded-full inline-block text-[10px] font-bold uppercase tracking-widest border border-current bg-slate-100 text-slate-600">
                                      Live Data
                                   </div>
                                   <div>
                                      <h4 className="text-[18px] font-black text-[#1a1f36] leading-tight">{doc.name}</h4>
                                      <p className="text-[12px] font-bold text-gray-400 mt-1">{doc.value}</p>
                                   </div>
                                </div>
                                <div className="flex justify-between items-center relative z-10 pt-4 border-t border-gray-200/50">
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profile Record</p>
                                   {doc.url ? (
                                     <button 
                                       onClick={() => window.open(getDocUrl(doc.url), '_blank', 'noopener,noreferrer')}
                                       className="p-3 bg-white rounded-2xl shadow-sm text-[#1a1f36] hover:bg-[#1a1f36] hover:text-white transition-all"
                                     >
                                        <Eye className="w-5 h-5" />
                                     </button>
                                   ) : (
                                     <div className="p-3 bg-gray-100/50 rounded-2xl text-gray-300">
                                        <Eye className="w-5 h-5" />
                                     </div>
                                   )}
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </motion.div>
                )}

                {activeView === 'nominee' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-10">
                     <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-[#1a1f36]">Nominee Management</h3>
                        <p className="text-sm text-gray-400 font-medium">Assign beneficiaries for your share capital and deposits</p>
                     </div>

                     <div className="grid md:grid-cols-[400px,1fr] gap-12">
                        <div className="bg-gradient-to-br from-[#1a1f36] via-[#2d3356] to-[#1a1f36] p-10 rounded-[48px] text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40">
                           <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                           <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                              <div className="flex items-center gap-4">
                                 <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center border border-white/5 shadow-inner">
                                    <Users className="w-8 h-8 text-[#c9a84c]" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-tight">Nominee Data</p>
                                    <h4 className="text-xl font-black text-white">Not configured yet</h4>
                                 </div>
                              </div>
                              <p className="text-[13px] text-white/70 leading-relaxed">
                                 No nominee has been saved for this member profile yet. When nominee management is connected, the saved beneficiary data will appear here.
                              </p>
                              <button className="w-full h-14 rounded-2xl bg-white/10 text-white font-black text-[13px] border border-white/10 cursor-default">
                                 Awaiting Nominee Setup
                              </button>
                           </div>
                        </div>

                        <div className="space-y-8">
                           <div className="p-8 bg-amber-50 rounded-[40px] border border-amber-100 flex items-start gap-6">
                              <AlertCircle className="w-10 h-10 text-amber-600 mt-1" />
                              <div className="space-y-2">
                                 <h5 className="text-[15px] font-bold text-amber-900">Legal Compliance Note</h5>
                                 <p className="text-[12px] text-amber-800 leading-relaxed font-bold opacity-80 uppercase tracking-tight">
                                    Nominations are made in accordance with the Cooperative Societies Act. Changes made here will apply to all your active accounts across CredTrust.
                                 </p>
                              </div>
                           </div>
                           
                           <div className="space-y-6">
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-8">Quick Settings</p>
                              <div className="grid gap-4">
                                 <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-[#6b21a8] transition-all cursor-pointer group shadow-sm">
                                    <div className="flex items-center gap-4">
                                       <Globe2 className="w-5 h-5 text-[#6b21a8]" />
                                       <span className="text-[13px] font-bold">Update Social Security Link</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#6b21a8] group-hover:translate-x-1 transition-all" />
                                 </div>
                                 <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-[#6b21a8] transition-all cursor-pointer group shadow-sm">
                                    <div className="flex items-center gap-4">
                                       <Download className="w-5 h-5 text-[#6b21a8]" />
                                       <span className="text-[13px] font-bold">Download Nomination Form (PDF)</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#6b21a8] group-hover:translate-x-1 transition-all" />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </motion.div>
                )}

                {activeView === 'security' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 space-y-10">
                     <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-[#1a1f36]">Security Preferences</h3>
                        <p className="text-sm text-gray-400 font-medium">Protect your vault with bio-metric and advanced security layers</p>
                     </div>

                     <div className="grid md:grid-cols-2 gap-10">
                        <div className="p-8 border-2 border-[#1a1f36]/5 bg-[#f8fafc] rounded-[40px] space-y-6 flex flex-col justify-between h-72 group hover:border-[#6b21a8] transition-all">
                           <div className="space-y-4">
                              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#6b21a8] shadow-sm">
                                 <Fingerprint className="w-8 h-8" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-[#1a1f36]">Biometric Authentication</h4>
                                 <p className="text-[11px] text-gray-400 font-medium leading-relaxed">Sign transactions using your device's touch or face identity.</p>
                              </div>
                           </div>
                           <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                              <span className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Not Configured</span>
                              <div className="w-12 h-6 bg-[#1a1f36] rounded-full relative cursor-pointer">
                                 <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                              </div>
                           </div>
                        </div>

                        <div className="p-8 border-2 border-[#1a1f36]/5 bg-[#f8fafc] rounded-[40px] space-y-6 flex flex-col justify-between h-72 group hover:border-[#6b21a8] transition-all">
                           <div className="space-y-4">
                              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-rose-600 shadow-sm">
                                 <ShieldCheck className="w-8 h-8" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-[#1a1f36]">Two-Factor (2FA)</h4>
                                 <p className="text-[11px] text-gray-400 font-medium leading-relaxed">Adds an extra layer of security via SMS or Authenticator App.</p>
                              </div>
                           </div>
                           <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                              <span className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">Recommendation: Medium</span>
                              <Link to="#" className="text-[11px] font-bold text-[#6b21a8] border-b border-[#6b21a8]">Enable Now</Link>
                           </div>
                        </div>
                     </div>

                     <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-8 py-2">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                              <Lock className="w-6 h-6" />
                           </div>
                           <div>
                              <h5 className="text-[15px] font-bold text-[#1a1f36]">Last Password Change</h5>
                              <p className="text-[12px] text-gray-400">Not available for this account yet</p>
                           </div>
                        </div>
                        <Button variant="ghost" className="h-14 px-10 border-2 border-gray-100 rounded-2xl font-bold text-[#1a1f36] hover:bg-gray-50">
                           Change Password
                        </Button>
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>

             {/* Support Help */}
             <div className="mt-8 flex items-center justify-between p-8 bg-gradient-to-r from-emerald-50 to-emerald-50/50 rounded-[40px] border border-emerald-100">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 rounded-[28px] bg-white flex items-center justify-center shadow-sm text-emerald-600">
                      <Globe2 className="w-6 h-6" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[16px] font-bold text-emerald-900 leading-none">Need assistance with your KYC?</h4>
                      <p className="text-[12px] text-emerald-700 font-medium max-w-sm">Contact our nodal officer or visit the nearest CredTrust branch portal.</p>
                   </div>
                </div>
                <button className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[12px] shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all">
                   CONTACT SUPPORT
                </button>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
