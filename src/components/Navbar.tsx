/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update user state and close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    const storedUser = localStorage.getItem("zar_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
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
    <header className={`bg-surface/80 backdrop-blur-xl w-full top-0 sticky z-50 border-b border-white/10 shadow-sm transition-all duration-300 ${isScrolled ? "py-3" : "py-4"}`}>
      <div className="flex justify-between items-center w-full px-margin-mobile sm:px-margin-desktop py-1 max-w-container-max mx-auto">
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
            to="/download" 
            className={`font-body-md text-body-md transition-colors duration-200 ${
              location.pathname === "/download" 
                ? "text-primary font-semibold border-b-2 border-primary" 
                : "text-on-surface-variant font-medium hover:text-primary"
            }`}
          >
            VCF Drop
          </Link>
          <button 
            onClick={() => handleNavClick("#pricing")} 
            className="text-on-surface-variant font-medium font-body-md text-body-md hover:text-primary transition-colors duration-200 text-left bg-transparent border-0 cursor-pointer"
          >
            Go Premium
          </button>
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
          <button 
            onClick={() => handleNavClick("#faq")} 
            className="text-on-surface-variant font-medium font-body-md text-body-md hover:text-primary transition-colors duration-200 text-left bg-transparent border-0 cursor-pointer"
          >
            FAQs
          </button>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              to="/dashboard"
              className="bg-primary text-on-primary-fixed px-6 py-2.5 rounded-full font-label-md text-label-md font-bold transition-opacity hover:opacity-90 active:opacity-80 hidden sm:block text-center"
            >
              Dashboard
            </Link>
          ) : (
            <button 
              onClick={() => handleNavClick("#join")}
              className="bg-primary text-on-primary-fixed px-6 py-2.5 rounded-full font-label-md text-label-md font-bold transition-opacity hover:opacity-90 active:opacity-80 hidden sm:block"
            >
              Join Network
            </button>
          )}

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

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] bg-background/95 backdrop-blur-xl z-[90] flex flex-col p-6 space-y-6 overflow-y-auto">
          <Link 
            to="/download" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl font-bold text-on-surface hover:text-primary transition-colors"
          >
            VCF Drop
          </Link>
          <button 
            onClick={() => handleNavClick("#pricing")} 
            className="text-left text-2xl font-bold text-on-surface hover:text-primary transition-colors bg-transparent border-0"
          >
            Go Premium
          </button>
          <Link 
            to="/whatsapp-tvs" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-2xl font-bold text-on-surface hover:text-primary transition-colors"
          >
            TV Directory
          </Link>
          <button 
            onClick={() => handleNavClick("#faq")} 
            className="text-left text-2xl font-bold text-on-surface hover:text-primary transition-colors bg-transparent border-0"
          >
            FAQs
          </button>
          {user ? (
            <Link 
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full bg-primary text-on-primary-fixed py-4 rounded-xl font-bold text-center text-decoration-none"
            >
              Dashboard
            </Link>
          ) : (
            <button 
              onClick={() => handleNavClick("#join")}
              className="w-full bg-primary text-on-primary-fixed py-4 rounded-xl font-bold text-center"
            >
              Join Network
            </button>
          )}
        </div>
      )}
    </header>
  );
};
