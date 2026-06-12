/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Download, Tv, Sparkles } from "lucide-react";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (selector: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== "/") {
      // If we are not on home, redirect to home with hash
      window.location.href = `/${selector}`;
      return;
    }
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className={`bg-surface/80 backdrop-blur-xl w-full top-0 sticky z-50 border-b border-white/10 shadow-sm transition-all duration-300 ${isScrolled ? "py-3" : "py-4"}`}>
        <div className="flex justify-between items-center w-full px-margin-mobile sm:px-margin-desktop py-1 max-w-container-max mx-auto relative z-50">
          <div className="flex flex-col items-start leading-none">
            <Link to="/" className="font-headline-md text-headline-md font-bold text-primary dark:text-primary leading-none">
              WSV
            </Link>
            <span className="text-[10px] font-bold text-on-surface-variant/70 tracking-widest mt-1">
              v3.0
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/download-vcf" 
              className={`font-body-md text-body-md transition-colors duration-200 ${
                location.pathname === "/download-vcf" 
                  ? "text-primary font-semibold border-b-2 border-primary" 
                  : "text-on-surface-variant font-medium hover:text-primary"
              }`}
            >
              Download VCF
            </Link>
            <Link 
              to="/whatsapp-tvs" 
              className={`font-body-md text-body-md transition-colors duration-200 ${
                location.pathname === "/whatsapp-tvs" 
                  ? "text-primary font-semibold border-b-2 border-primary" 
                  : "text-on-surface-variant font-medium hover:text-primary"
              }`}
            >
              TV Directory
            </Link>
            <Link 
              to="/blog" 
              className={`font-body-md text-body-md transition-colors duration-200 ${
                location.pathname === "/blog" 
                  ? "text-primary font-semibold border-b-2 border-primary" 
                  : "text-on-surface-variant font-medium hover:text-primary"
              }`}
            >
              Growth Tips
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleNavClick("#join")}
              className="bg-primary text-on-primary-fixed px-6 py-2.5 rounded-full font-label-md text-label-md font-bold transition-opacity hover:opacity-90 active:opacity-80 hidden sm:block"
            >
              Submit Your Contact
            </button>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-primary bg-white/5 border border-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-background/98 backdrop-blur-2xl z-50 flex flex-col px-margin-mobile pt-6 pb-8 space-y-8 overflow-y-auto">
          {/* Ambient blur blob in background */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Header inside drawer */}
          <div className="flex justify-between items-center w-full relative z-10 py-4 border-b border-white/5">
            <div className="flex flex-col items-start leading-none">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="font-headline-md text-headline-md font-bold text-primary leading-none">
                WSV
              </Link>
              <span className="text-[10px] font-bold text-on-surface-variant/70 tracking-widest mt-1">
                v3.0
              </span>
            </div>
            <button 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-primary bg-white/5 border border-white/10"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col space-y-4 relative z-10">
            <Link 
              to="/download-vcf" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/10 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Download size={20} />
              </div>
              <div>
                <p className="text-base font-bold text-white group-hover:text-primary transition-colors">Download VCF</p>
                <p className="text-xs text-on-surface-variant/70 font-semibold">Access the daily sync lists</p>
              </div>
            </Link>

            <Link 
              to="/whatsapp-tvs" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/10 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Tv size={20} />
              </div>
              <div>
                <p className="text-base font-bold text-white group-hover:text-secondary transition-colors">TV Directory</p>
                <p className="text-xs text-on-surface-variant/70 font-semibold">Browse registered WhatsApp TVs</p>
              </div>
            </Link>

            <Link 
              to="/blog" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/10 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-base font-bold text-white group-hover:text-accent transition-colors">Growth Tips</p>
                <p className="text-xs text-on-surface-variant/70 font-semibold">Master your WhatsApp reach</p>
              </div>
            </Link>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col space-y-4 relative z-10">
            <Link 
              to="/premium"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 hover:scale-[1.01] transition-all"
            >
              <span className="font-bold text-white text-sm">Go Premium Sync</span>
              <span className="text-primary font-bold text-xs uppercase tracking-wider">View Pricing →</span>
            </Link>
            
            <Link 
              to="/knowledge-base"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center py-3 text-sm font-semibold text-on-surface-variant hover:text-white transition-colors"
            >
              Help & Knowledge Base
            </Link>
          </div>

          <div className="mt-auto flex flex-col space-y-4 relative z-10">
            <button 
              onClick={() => handleNavClick("#join")}
              className="w-full bg-primary text-black py-4 rounded-xl font-bold text-center tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/15"
            >
              Submit Your Contact
            </button>
            <p className="text-[10px] text-center text-on-surface-variant/40 font-bold uppercase tracking-widest">
              WSV v3.0 • Secure Growth Network
            </p>
          </div>
        </div>
      )}
    </>
  );
};
