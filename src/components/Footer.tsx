/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from "react-router-dom";

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
    <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest w-full border-t border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 px-margin-mobile sm:px-margin-desktop py-stack-lg max-w-container-max mx-auto">
        <div className="space-y-6 max-w-sm">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary dark:text-primary">
            WSV
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant">
            WSV is a third-party service provider. We are NOT affiliated with WhatsApp LLC or Meta Platforms, Inc. WSV provides network growth tools for independent creators and businesses.
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant">
            © 2026 WSV - WhatsApp Status Views. All rights reserved. Growth Engine for the African Ecosystem.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 w-full md:w-auto">
          <div className="space-y-4">
            <h4 className="font-label-md text-label-md text-white uppercase tracking-widest">Platform</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/download" className="text-on-surface-variant font-body-md hover:text-primary transition-colors active:underline">
                VCF Recovery
              </Link>
              <Link to="/whatsapp-tvs" className="text-on-surface-variant font-body-md hover:text-primary transition-colors active:underline">
                TV Directory
              </Link>
              <button 
                onClick={() => handleScrollToSection("#pricing")}
                className="text-left text-on-surface-variant font-body-md hover:text-primary transition-colors active:underline bg-transparent border-0 cursor-pointer"
              >
                Go Premium
              </button>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-label-md text-label-md text-white uppercase tracking-widest">Support</h4>
            <nav className="flex flex-col gap-2">
              <a href="https://wa.me/2348103460237" className="text-on-surface-variant font-body-md hover:text-primary transition-colors active:underline">
                Contact Support
              </a>
              <button 
                onClick={() => handleScrollToSection("#faq")}
                className="text-left text-on-surface-variant font-body-md hover:text-primary transition-colors active:underline bg-transparent border-0 cursor-pointer"
              >
                FAQs
              </button>
              <button 
                onClick={() => handleScrollToSection("#about")}
                className="text-left text-on-surface-variant font-body-md hover:text-primary transition-colors active:underline bg-transparent border-0 cursor-pointer"
              >
                About Us
              </button>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-label-md text-label-md text-white uppercase tracking-widest">Legal</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/legal/terms" className="text-on-surface-variant font-body-md hover:text-primary transition-colors active:underline">
                Terms of Service
              </Link>
              <Link to="/legal/privacy" className="text-on-surface-variant font-body-md hover:text-primary transition-colors active:underline">
                Privacy Policy
              </Link>
              <Link to="/legal/refund" className="text-on-surface-variant font-body-md hover:text-primary transition-colors active:underline">
                Refund Policy
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};
