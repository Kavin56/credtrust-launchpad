import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Phone,
  Menu,
  X,
  Globe,
  Wallet,
  PiggyBank,
  CreditCard,
  Landmark,
  Receipt,
  ShieldCheck,
  Smartphone,
  Globe2,
  Building2,
  Users,
  Briefcase,
  Gem,
  HandCoins,
  FileCheck,
  BookOpen,
  Headphones,
  MapPin,
  HelpCircle,
  Download,
  MessageSquare,
  LogIn,
  UserPlus,
  FileText,
  LogOut,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/modules/auth/AuthContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const categoryLinks = [
  { label: "Personal", href: "#" },
  { label: "Business & MSME", href: "#" },
  { label: "Agriculture", href: "#" },
  { label: "NRI Services", href: "#" },
];

const mainNavItems = [
  {
    label: "Accounts",
    href: "#",
    megaMenu: {
      columns: [
        {
          heading: "Savings Accounts",
          icon: PiggyBank,
          items: [
            { name: "Regular Savings Account", tag: undefined },
            { name: "Premium Savings Account", tag: "Popular" },
            { name: "Salary Account", tag: undefined },
            { name: "Zero Balance Account", tag: "New" },
          ],
        },
        {
          heading: "Current Accounts",
          icon: Wallet,
          items: [
            { name: "Individual Current Account", tag: undefined },
            { name: "Business Current Account", tag: "Popular" },
            { name: "Institutional Account", tag: undefined },
          ],
        },
        {
          heading: "Special Accounts",
          icon: ShieldCheck,
          items: [
            { name: "Minor Account", tag: undefined },
            { name: "Joint Account", tag: undefined },
            { name: "Senior Citizen Account", tag: "New" },
          ],
        },
      ],
      featured: {
        title: "Open Account in Minutes",
        desc: "Instant digital account opening with zero paperwork.",
        cta: "Apply Now",
        gradient: "from-[#1a1f36] to-[#2d3356]",
      },
    },
  },
  {
    label: "Deposits",
    href: "#",
    megaMenu: {
      columns: [
        {
          heading: "Term Deposits",
          icon: Landmark,
          items: [
            { name: "Fixed Deposit", tag: "Popular" },
            { name: "Recurring Deposit", tag: undefined },
            { name: "Tax Saver FD", tag: "New" },
            { name: "Flexi Deposit", tag: undefined },
          ],
        },
        {
          heading: "Savings Schemes",
          icon: Receipt,
          items: [
            { name: "Daily Deposit Scheme", tag: undefined },
            { name: "Monthly Income Scheme", tag: "Popular" },
            { name: "Cumulative Deposit", tag: undefined },
          ],
        },
      ],
      featured: {
        title: "Earn Up to 8.5%* Interest",
        desc: "Competitive rates on fixed and recurring deposits.",
        cta: "View Rates",
        gradient: "from-[#c9a84c] to-[#b8953f]",
      },
    },
  },
  {
    label: "Loans",
    href: "#",
    megaMenu: {
      columns: [
        {
          heading: "Personal Loans",
          icon: HandCoins,
          items: [
            { name: "Personal Loan", tag: "Popular" },
            { name: "Salary Loan", tag: undefined },
            { name: "Emergency Loan", tag: "New" },
          ],
        },
        {
          heading: "Business Loans",
          icon: Briefcase,
          items: [
            { name: "Business Term Loan", tag: undefined },
            { name: "Working Capital Loan", tag: "Popular" },
            { name: "Micro Enterprise Loan", tag: undefined },
          ],
        },
        {
          heading: "Secured Loans",
          icon: Gem,
          items: [
            { name: "Gold Loan", tag: "Popular" },
            { name: "Property Mortgage Loan", tag: undefined },
            { name: "Loan Against Deposit", tag: undefined },
          ],
        },
        {
          heading: "Other Loans",
          icon: FileText,
          items: [
            { name: "Education Loan", tag: undefined },
            { name: "Vehicle Loan", tag: undefined },
            { name: "Housing Loan", tag: "Popular" },
          ],
        },
      ],
      featured: {
        title: "Quick Loan Approval",
        desc: "Get pre-approved loans with minimal documentation.",
        cta: "Check Eligibility",
        gradient: "from-[#1a1f36] to-[#2d3356]",
      },
    },
  },
  {
    label: "Services",
    href: "#",
    megaMenu: {
      columns: [
        {
          heading: "Digital Services",
          icon: Smartphone,
          items: [
            { name: "Mobile Banking", tag: "Popular" },
            { name: "Net Banking", tag: undefined },
            { name: "UPI Payments", tag: "New" },
            { name: "Fund Transfer", tag: undefined },
          ],
        },
        {
          heading: "Member Services",
          icon: Users,
          items: [
            { name: "Share Certificate", tag: undefined },
            { name: "Passbook Update", tag: undefined },
            { name: "Account Statement", tag: undefined },
            { name: "Nominee Change", tag: undefined },
          ],
        },
      ],
      featured: {
        title: "Go Digital Today",
        desc: "Access all services from your phone or computer.",
        cta: "Get Started",
        gradient: "from-[#c9a84c] to-[#b8953f]",
      },
    },
  },
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMegaMenuEnter = (label: string) => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setActiveMegaMenu(label);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => setActiveMegaMenu(null), 200);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* ===== TOP STRIP ===== */}
      <div className="bg-[#1a1f36] text-white text-xs hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-10">
          {/* Left - Category Links */}
          <div className="flex items-center gap-0">
            {categoryLinks.map((cat, idx) => (
              <a
                key={cat.label}
                href={cat.href}
                className={`px-4 py-2.5 font-medium transition-colors hover:text-[#c9a84c] ${
                  idx === 0 ? "text-[#c9a84c]" : "text-white/70"
                }`}
              >
                {cat.label}
              </a>
            ))}
          </div>

          {/* Right - Utility Links with shadcn DropdownMenu */}
          <div className="flex items-center gap-0">
            {/* Ways to Bank */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3.5 py-2.5 text-white/60 hover:text-white transition-colors outline-none">
                Ways to Bank
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  Digital Banking
                </DropdownMenuLabel>
                <DropdownMenuItem className="gap-2.5">
                  <Smartphone className="w-4 h-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm">Mobile Banking</p>
                    <p className="text-xs text-muted-foreground">Bank on the go</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2.5">
                  <Globe2 className="w-4 h-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm">Net Banking</p>
                    <p className="text-xs text-muted-foreground">Online access 24/7</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2.5">
                  <MessageSquare className="w-4 h-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm">WhatsApp Banking</p>
                    <p className="text-xs text-muted-foreground">Chat to bank</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2.5">
                  <Landmark className="w-4 h-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm">ATM & e-Lobby</p>
                    <p className="text-xs text-muted-foreground">Self-service branches</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2.5">
                  <MapPin className="w-4 h-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm">Doorstep Banking</p>
                    <p className="text-xs text-muted-foreground">We come to you</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* About Us */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3.5 py-2.5 text-white/60 hover:text-white transition-colors outline-none">
                About Us
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem className="gap-2.5">
                  <Building2 className="w-4 h-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm">About the Society</p>
                    <p className="text-xs text-muted-foreground">Our story</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2.5">
                  <Users className="w-4 h-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm">Board of Directors</p>
                    <p className="text-xs text-muted-foreground">Leadership team</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2.5">
                  <FileCheck className="w-4 h-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm">Awards & Achievements</p>
                    <p className="text-xs text-muted-foreground">Recognition</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2.5">
                  <Briefcase className="w-4 h-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm">Careers</p>
                    <p className="text-xs text-muted-foreground">Join our team</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Support */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3.5 py-2.5 text-white/60 hover:text-white transition-colors outline-none">
                Support
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem className="gap-2.5">
                  <Headphones className="w-4 h-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm">Contact Us</p>
                    <p className="text-xs text-muted-foreground">Get in touch</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2.5">
                  <MapPin className="w-4 h-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm">Locate Branch</p>
                    <p className="text-xs text-muted-foreground">Find nearest branch</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2.5">
                  <Download className="w-4 h-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm">Download Center</p>
                    <p className="text-xs text-muted-foreground">Forms & apps</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2.5">
                  <HelpCircle className="w-4 h-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm">FAQs</p>
                    <p className="text-xs text-muted-foreground">Common questions</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Blog */}
            <a href="#" className="px-3.5 py-2.5 text-white/60 hover:text-white transition-colors">
              Blog
            </a>

            {/* Investors */}
            <a href="#" className="px-3.5 py-2.5 text-white/60 hover:text-white transition-colors">
              Investors
            </a>

            {/* Phone */}
            <a
              href="tel:1800-425-1444"
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-white/60 hover:text-white transition-colors border-l border-white/10 ml-1"
            >
              <Phone className="w-3 h-3" />
              <span className="font-medium">1800 425 1444</span>
            </a>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3.5 py-2.5 text-white/60 hover:text-white transition-colors outline-none border-l border-white/10">
                <Globe className="w-3 h-3" />
                EN
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem className="font-medium">English</DropdownMenuItem>
                <DropdownMenuItem>Hindi</DropdownMenuItem>
                <DropdownMenuItem>Kannada</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ===== MAIN NAVBAR ===== */}
      <nav
        className={`bg-white border-b transition-all duration-300 ${
          scrolled ? "shadow-md border-gray-200" : "shadow-sm border-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 shrink-0">
            <img
              src="/logo.png"
              alt="CredTrust Logo"
              className="h-10 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <span className="font-heading text-lg font-bold text-[#1a1f36] leading-none block">
                CredTrust
              </span>
              <span className="text-[10px] text-gray-500 tracking-wide uppercase leading-none mt-0.5 block">
                Cooperative Society
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {mainNavItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.megaMenu && handleMegaMenuEnter(item.label)}
                onMouseLeave={handleMegaMenuLeave}
              >
                <a
                  href={item.href}
                  className={`flex items-center gap-1 px-3 xl:px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                    activeMegaMenu === item.label
                      ? "text-[#1a1f36] bg-gray-50"
                      : "text-gray-600 hover:text-[#1a1f36] hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                  {item.megaMenu && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        activeMegaMenu === item.label ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </a>

                {/* Mega Menu */}
                <AnimatePresence>
                  {item.megaMenu && activeMegaMenu === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
                      style={{ width: "max-content", minWidth: "600px", maxWidth: "820px" }}
                    >
                      <div
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                        style={{ boxShadow: "0 25px 60px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03)" }}
                      >
                        <div className="flex">
                          {/* Menu Columns */}
                          <div className="flex-1 p-5">
                            <div
                              className={`grid gap-5 ${
                                item.megaMenu.columns.length > 2 ? "grid-cols-3" : "grid-cols-2"
                              }`}
                            >
                              {item.megaMenu.columns.map((group) => {
                                const GroupIcon = group.icon;
                                return (
                                  <div key={group.heading}>
                                    <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-gray-100">
                                      <div className="w-7 h-7 rounded-lg bg-[#1a1f36]/5 flex items-center justify-center">
                                        <GroupIcon className="w-3.5 h-3.5 text-[#1a1f36]/60" />
                                      </div>
                                      <h4 className="text-xs font-bold text-[#1a1f36] uppercase tracking-wider">
                                        {group.heading}
                                      </h4>
                                    </div>
                                    <ul className="space-y-0.5">
                                      {group.items.map((subItem) => (
                                        <li key={subItem.name}>
                                          <a
                                            href="#"
                                            className="flex items-center justify-between gap-2 px-2.5 py-2 text-[13px] text-gray-600 hover:text-[#1a1f36] hover:bg-gray-50 rounded-lg transition-all duration-150 group/item"
                                          >
                                            <span className="flex items-center gap-2">
                                              <ChevronRight className="w-3 h-3 text-gray-300 group-hover/item:text-[#c9a84c] transition-colors" />
                                              {subItem.name}
                                            </span>
                                            {subItem.tag && (
                                              <span
                                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${
                                                  subItem.tag === "Popular"
                                                    ? "bg-[#c9a84c]/15 text-[#a08530]"
                                                    : "bg-emerald-50 text-emerald-600"
                                                }`}
                                              >
                                                {subItem.tag}
                                              </span>
                                            )}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explore All */}
                            <div className="mt-4 pt-3 border-t border-gray-100">
                              <a
                                href="#"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a1f36] hover:text-[#c9a84c] transition-colors group/explore"
                              >
                                Explore all {item.label.toLowerCase()}
                                <ChevronRight className="w-4 h-4 group-hover/explore:translate-x-0.5 transition-transform" />
                              </a>
                            </div>
                          </div>

                          {/* Featured Card */}
                          <div className="w-[220px] shrink-0 border-l border-gray-100">
                            <div
                              className={`h-full bg-gradient-to-br ${item.megaMenu.featured.gradient} p-5 flex flex-col justify-between`}
                            >
                              <div>
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                                  <CreditCard className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-white font-bold text-base leading-snug mb-2">
                                  {item.megaMenu.featured.title}
                                </h3>
                                <p className="text-white/70 text-xs leading-relaxed">
                                  {item.megaMenu.featured.desc}
                                </p>
                              </div>
                              <a
                                href="#"
                                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#c9a84c] hover:text-white transition-colors"
                              >
                                {item.megaMenu.featured.cta}
                                <ChevronRight className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 hover:text-[#1a1f36]">
              <Search className="w-5 h-5" />
            </button>

            {/* Login / Profile Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="default"
                    className="hidden sm:inline-flex items-center gap-2 bg-[#1a1f36] text-white hover:bg-[#2d3356] text-sm font-semibold border border-white/10"
                  >
                    <User className="w-4 h-4 text-[#c9a84c]" />
                    {user.email?.split('@')[0]}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Account
                  </DropdownMenuLabel>
                  <DropdownMenuItem className="gap-2.5">
                    <User className="w-4 h-4 text-muted-foreground/60" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="gap-2.5 text-red-500 focus:text-red-500 focus:bg-red-50"
                    onClick={async () => {
                      await signOut(auth);
                      toast.success("Successfully logged out");
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="default"
                asChild
                className="hidden sm:inline-flex items-center gap-2 bg-[#1a1f36] text-white hover:bg-[#2d3356] text-sm font-semibold"
              >
                <Link to="/auth?mode=signup">
                  Signup
                  <UserPlus className="w-3.5 h-3.5" />
                </Link>
              </Button>
            )}

            <Link
              to={user ? "/loan-apply" : "/auth"}
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-[#c9a84c] text-[#1a1f36] text-sm font-semibold rounded-lg hover:bg-[#d4b65c] transition-all shadow-sm hover:shadow-md"
            >
              Apply Now
            </Link>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ===== MOBILE MENU ===== */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-gray-100 overflow-hidden bg-white"
            >
              <div className="max-w-7xl mx-auto px-4 py-4">
                {/* Mobile Categories */}
                <div className="flex gap-2 mb-4 pb-4 border-b border-gray-100">
                  {categoryLinks.map((cat, idx) => (
                    <a
                      key={cat.label}
                      href={cat.href}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                        idx === 0
                          ? "bg-[#1a1f36] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat.label}
                    </a>
                  ))}
                </div>

                {/* Mobile Nav Items */}
                <div className="space-y-0.5">
                  {mainNavItems.map((item) => (
                    <div key={item.label}>
                      <a
                        href={item.href}
                        className="flex items-center justify-between px-3 py-3 text-sm font-medium text-gray-700 hover:text-[#1a1f36] hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={(e) => {
                          if (item.megaMenu) {
                            e.preventDefault();
                            setActiveDropdown(activeDropdown === item.label ? null : item.label);
                          } else {
                            setMobileOpen(false);
                          }
                        }}
                      >
                        {item.label}
                        {item.megaMenu && (
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              activeDropdown === item.label ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </a>
                      <AnimatePresence>
                        {item.megaMenu && activeDropdown === item.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-2"
                          >
                            {item.megaMenu.columns.map((group) => {
                              const GroupIcon = group.icon;
                              return (
                                <div key={group.heading} className="py-2">
                                  <div className="flex items-center gap-2 px-3 mb-1.5">
                                    <GroupIcon className="w-3.5 h-3.5 text-gray-400" />
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                      {group.heading}
                                    </p>
                                  </div>
                                  {group.items.map((subItem) => (
                                    <a
                                      key={subItem.name}
                                      href="#"
                                      className="flex items-center justify-between px-3 py-2 text-sm text-gray-500 hover:text-[#1a1f36] hover:bg-gray-50 rounded-md transition-colors"
                                      onClick={() => setMobileOpen(false)}
                                    >
                                      <span>{subItem.name}</span>
                                      {subItem.tag && (
                                        <span
                                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${
                                            subItem.tag === "Popular"
                                              ? "bg-[#c9a84c]/15 text-[#a08530]"
                                              : "bg-emerald-50 text-emerald-600"
                                          }`}
                                        >
                                          {subItem.tag}
                                        </span>
                                      )}
                                    </a>
                                  ))}
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Mobile Actions */}
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100">
                  {user ? (
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12 text-[#1a1f36] border-gray-200"
                      onClick={async () => {
                        await signOut(auth);
                        setMobileOpen(false);
                        toast.success("Successfully logged out");
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#c9a84c]" />
                        <span>Logout ({user.email?.split('@')[0]})</span>
                      </div>
                      <LogOut className="w-4 h-4 text-gray-400" />
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Link
                        to="/auth?mode=signup"
                        className="flex-1 text-center py-3 bg-[#1a1f36] text-white text-sm font-semibold rounded-lg"
                        onClick={() => setMobileOpen(false)}
                      >
                        Signup
                      </Link>
                      <Link
                        to={user ? "/loan-apply" : "/auth"}
                        className="flex-1 text-center py-3 bg-[#c9a84c] text-[#1a1f36] text-sm font-semibold rounded-lg"
                        onClick={() => setMobileOpen(false)}
                      >
                        Apply Now
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile Contact */}
                <a
                  href="tel:1800-425-1444"
                  className="flex items-center justify-center gap-2 mt-3 py-2.5 text-sm text-gray-500 hover:text-[#1a1f36] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  1800 425 1444
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;
