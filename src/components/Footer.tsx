import { Phone, Facebook, Linkedin, Twitter, Youtube, Instagram } from "lucide-react";
import { useLocation } from "react-router-dom";

const footerLinks = {
  "Popular Products": ["Savings Accounts", "Loans", "Deposits", "Cards", "Insurance"],
  "Customer Relations": ["Loan Rates", "Deposit Rates", "Savings Rates", "Charges", "Blog"],
  "About Us": ["About CredTrust", "Team", "Careers", "CSR", "Awards"],
  Support: ["Contact Us", "Locate Us", "FAQs", "Raise Concerns", "Download Center"],
};

const Footer = () => {
  const location = useLocation();
  if (location.pathname !== "/") return null;

  return (
    <footer>
      {/* Purple banner */}
      <div className="bg-navy py-6">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <img
               src="/logo.png"
               alt="CredTrust Logo"
               className="h-8 w-auto object-contain brightness-0 invert"
             />
             <span className="font-heading text-lg font-bold text-navy-foreground">CredTrust</span>
           </div>
          <div className="flex items-center gap-6 text-navy-foreground text-sm">
            <span className="text-navy-foreground/70">Toll free numbers</span>
            <span className="flex items-center gap-1.5 font-semibold"><Phone className="w-4 h-4" /> 1800 425 1444</span>
            <span className="font-semibold">| 1800 572 8031</span>
          </div>
          <div className="flex items-center gap-3 text-navy-foreground text-xs">
            <span className="text-navy-foreground/70">Download the CredTrust app</span>
            <span className="border border-navy-foreground/30 rounded px-3 py-1">Google Play</span>
            <span className="border border-navy-foreground/30 rounded px-3 py-1">App Store</span>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="bg-foreground text-background">
        <div className="container py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4 text-sm">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-background/60 hover:text-secondary transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="container pb-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-background/10 pt-6">
          <p className="text-xs text-background/50">© 2024 CredTrust Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {[Facebook, Linkedin, Twitter, Youtube, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="text-background/50 hover:text-secondary transition-colors">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
