import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Phone, Menu, X } from "lucide-react";

const navItems = [
  { label: "Home", href: "#" },
  { label: "About", href: "#about" },
  {
    label: "Services",
    href: "#services",
    children: ["Savings Account", "Current Account", "NRI Banking", "Digital Banking"],
  },
  {
    label: "Loans",
    href: "#loans",
    children: ["Home Loan", "Car Loan", "Personal Loan", "Business Loan"],
  },
  {
    label: "Deposits",
    href: "#deposits",
    children: ["Fixed Deposit", "Recurring Deposit", "Tax Saver FD"],
  },
  { label: "Contact", href: "#contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <>
      {/* Top strip */}
      <div className="bg-navy text-navy-foreground text-xs py-2 hidden lg:block">
        <div className="container flex justify-between items-center">
          <div className="flex gap-6">
            <span className="font-medium">PERSONAL</span>
            <span className="text-navy-foreground/60 cursor-pointer hover:text-navy-foreground transition-colors">BUSINESS & MSME</span>
            <span className="text-navy-foreground/60 cursor-pointer hover:text-navy-foreground transition-colors">NRI BANKING</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-navy-foreground/60 cursor-pointer hover:text-navy-foreground transition-colors">About Us</span>
            <span className="text-navy-foreground/60 cursor-pointer hover:text-navy-foreground transition-colors">Blog</span>
            <span className="text-navy-foreground/60 cursor-pointer hover:text-navy-foreground transition-colors">Investors</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> 1800 425 1444</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <motion.header
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border"
        style={{ boxShadow: "var(--shadow-nav)" }}
      >
        <div className="container flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-lg">C</span>
            </div>
            <span className="font-heading text-xl font-bold text-primary">CredTrust</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={item.href}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-md"
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-3.5 h-3.5" />}
                </a>
                <AnimatePresence>
                  {item.children && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-1 w-52 bg-card rounded-xl border border-border p-2"
                      style={{ boxShadow: "var(--shadow-card-hover)" }}
                    >
                      {item.children.map((child) => (
                        <a
                          key={child}
                          href="#"
                          className="block px-4 py-2.5 text-sm text-foreground/70 hover:text-primary hover:bg-muted rounded-lg transition-colors"
                        >
                          {child}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <Search className="w-5 h-5 text-foreground/60" />
            </button>
            <a href="#" className="btn-primary-banking hidden sm:inline-flex text-sm !px-6 !py-2.5">
              Login <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </a>
            <button
              className="lg:hidden p-2 rounded-full hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-border overflow-hidden bg-background"
            >
              <div className="container py-4 space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block px-4 py-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <a href="#" className="btn-primary-banking w-full text-sm !py-3 mt-3">Login</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Header;
