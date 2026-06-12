/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from "react-router-dom";
import { ShieldAlert, MessageCircle, Heart } from "lucide-react";

export const Footer = () => {
  const handleScrollToSection = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/${selector}`;
    }
  };

  return (
    <footer className="bg-gradient-to-b from-surface-container-lowest via-black/40 to-black w-full border-t border-white/5 relative">
      <div className="absolute inset-0 bg-primary/2 h-[1px] w-full" />
      <div className="flex flex-col md:flex-row justify-between items-start gap-12 px-margin-mobile sm:px-margin-desktop py-16 max-w-container-max mx-auto relative z-10">
        
        {/* Brand Column */}
        <div className="space-y-6 max-w-sm">
          <div className="flex flex-col items-start leading-none">
            <Link to="/" className="font-headline-md text-headline-md font-bold text-primary dark:text-primary leading-none tracking-tighter">
              WSV
            </Link>
            <span className="text-[10px] font-bold text-primary/70 tracking-[0.2em] uppercase mt-1.5 px-2 py-0.5 bg-primary/5 border border-primary/10 rounded-full">
              v3.0 Stable
            </span>
          </div>
          
          <p className="font-body-md text-body-md text-on-surface-variant/80 leading-relaxed">
            WSV is Nigeria's leading WhatsApp Growth network. We help creators, business owners, and digital brands organically expand status reach and contact visibility.
          </p>

          {/* System Status Indicator */}
          <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3.5 py-2 rounded-xl w-fit border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            All Systems Operational
          </div>

          <p className="text-xs text-on-surface-variant/50 leading-relaxed max-w-[280px]">
            © {new Date().getFullYear()} WSV from ZAR Media Services
          </p>
        </div>
        
        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 w-full md:w-auto">
          
          {/* Column 1: Platform */}
          <div className="space-y-5">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.25em] opacity-40">Platform</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/download-vcf" className="text-on-surface-variant/80 font-body-md hover:text-primary transition-colors active:underline text-sm font-semibold">
                VCF Recovery
              </Link>
              <Link to="/whatsapp-tvs" className="text-on-surface-variant/80 font-body-md hover:text-primary transition-colors active:underline text-sm font-semibold">
                TV Directory
              </Link>
              <Link to="/csv-vcf" className="text-on-surface-variant/80 font-body-md hover:text-primary transition-colors active:underline text-sm font-semibold">
                CSV to VCF
              </Link>
              <Link to="/vcf-csv" className="text-on-surface-variant/80 font-body-md hover:text-primary transition-colors active:underline text-sm font-semibold">
                VCF to CSV
              </Link>
              <Link to="/blog" className="text-on-surface-variant/80 font-body-md hover:text-primary transition-colors active:underline text-sm font-semibold">
                Growth Tips
              </Link>
              <Link to="/premium" className="text-on-surface-variant/80 font-body-md hover:text-primary transition-colors active:underline text-sm font-semibold">
                Go Premium
              </Link>
            </nav>
          </div>

          {/* Column 2: Resources & Support */}
          <div className="space-y-5">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.25em] opacity-40">Support</h4>
            <nav className="flex flex-col gap-3">
              <a href="https://wa.me/2348103460237" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant/80 font-body-md hover:text-primary transition-colors active:underline text-sm font-semibold flex items-center gap-1.5">
                <MessageCircle size={14} className="text-primary" />
                Contact Support
              </a>
              <Link to="/knowledge-base" className="text-on-surface-variant/80 font-body-md hover:text-primary transition-colors active:underline text-sm font-semibold">
                Help Base
              </Link>
              <button 
                onClick={() => handleScrollToSection("#faq")}
                className="text-left text-on-surface-variant/80 font-body-md hover:text-primary transition-colors active:underline text-sm font-semibold bg-transparent border-0 cursor-pointer"
              >
                FAQs
              </button>
              <button 
                onClick={() => handleScrollToSection("#about")}
                className="text-left text-on-surface-variant/80 font-body-md hover:text-primary transition-colors active:underline text-sm font-semibold bg-transparent border-0 cursor-pointer"
              >
                About Us
              </button>
            </nav>
          </div>

          {/* Column 3: Legal */}
          <div className="space-y-5 col-span-2 sm:col-span-1">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.25em] opacity-40">Legal & Compliance</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/legal/terms" className="text-on-surface-variant/80 font-body-md hover:text-primary transition-colors active:underline text-sm font-semibold">
                Terms of Service
              </Link>
              <Link to="/legal/privacy" className="text-on-surface-variant/80 font-body-md hover:text-primary transition-colors active:underline text-sm font-semibold">
                Privacy Policy
              </Link>
              <Link to="/legal/refund" className="text-on-surface-variant/80 font-body-md hover:text-primary transition-colors active:underline text-sm font-semibold">
                Refund Policy
              </Link>
            </nav>
          </div>
          
        </div>
      </div>

      {/* Third Party Disclaimer Bar */}
      <div className="bg-black/60 border-t border-white/5 py-6 px-margin-mobile sm:px-margin-desktop">
        <div className="max-w-container-max mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-[11px] text-on-surface-variant/40 max-w-3xl leading-relaxed">
            Disclaimer: WSV is an independent growth platform. We are NOT associated, affiliated, authorized, endorsed by, or in any way officially connected with WhatsApp LLC, Meta Platforms Inc., or any of their subsidiaries or affiliates. All product names, logos, and brands are property of their respective owners.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-widest whitespace-nowrap">
            <ShieldAlert size={12} className="text-secondary" />
            Verified Secure
          </div>
        </div>
      </div>
    </footer>
  );
};
