/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Phone, Sparkles, CheckCircle2, MessageCircle, Download, Copy, X, Clock } from "lucide-react";
import { toast } from "sonner";

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const isSignup = searchParams.get("mode") === "signup";
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Referral code copied!");
  };
  const [formData, setFormData] = useState({ 
    businessName: "",
    name: "", 
    phoneNumber: "",
    gender: "",
    country: "",
    referredBy: "",
  });

  const countries = [
    { code: "NG", name: "Nigeria", flag: "🇳🇬", dialCode: "+234" },
    { code: "GH", name: "Ghana", flag: "🇬🇭", dialCode: "+233" },
    { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91" },
    { code: "US", name: "USA", flag: "🇺🇸", dialCode: "+1" },
    { code: "GB", name: "UK", flag: "🇬🇧", dialCode: "+44" },
    { code: "ZA", name: "South Africa", flag: "🇿🇦", dialCode: "+27" },
    { code: "KE", name: "Kenya", flag: "🇰🇪", dialCode: "+254" },
    { code: "OTHER", name: "Others", flag: "🌐", dialCode: "" },
  ];

  const selectedCountry = countries.find(c => c.code === formData.country) || countries[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup && (!formData.gender || !formData.country)) {
      toast.error("Please select your sex and country");
      return;
    }
    setIsLoading(true);

    const endpoint = isSignup ? "/api/submit" : "/api/login";
    
    let finalPhone = formData.phoneNumber;
    if (isSignup && selectedCountry.dialCode && !finalPhone.startsWith("+") && !finalPhone.startsWith(selectedCountry.dialCode)) {
      const cleanPhone = finalPhone.startsWith("0") ? finalPhone.substring(1) : finalPhone;
      finalPhone = selectedCountry.dialCode + cleanPhone;
    }
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, phoneNumber: finalPhone }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Invalid response body from server:", text);
        throw new Error(`Server returned an invalid response (Status ${response.status})`);
      }

      if (response.ok) {
        const fullUserData = { 
          name: data.name || formData.name, 
          phoneNumber: data.phoneNumber || formData.phoneNumber,
          businessName: data.businessName || formData.businessName,
          plan: data.plan || "Free",
          referralCode: data.referralCode 
        };
        
        localStorage.setItem("zar_user", JSON.stringify(fullUserData));
        setSubmissionData(fullUserData);
        setShowSuccessModal(true);
        toast.success(isSignup ? "Successfully joined!" : "Welcome back!");
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-margin-mobile sm:px-margin-desktop py-24 sm:py-32 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl glass-card p-6 sm:p-10 md:p-12 rounded-3xl md:rounded-[2.5rem] relative z-10 border border-primary/5 shadow-2xl shadow-primary/5"
      >
        <div className="text-center mb-10 sm:mb-12">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 sm:mb-8 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black font-black text-xl group-hover:rotate-12 transition-transform shadow-xl shadow-primary/20">W</div>
            <span className="font-black text-2xl tracking-tighter text-primary">WSV</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-display-lg text-white tracking-tighter leading-none mb-3">
            {isSignup ? "Unlock Your <br/> Network" : "Return To <br/> Base"}
          </h1>
          <p className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">
            {isSignup ? "Join 2M+ Creators Growing Today" : "Access Your Sync Terminal"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {isSignup && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Display Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={16} />
                  <input 
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-xl sm:rounded-2xl py-3.5 pl-12 pr-4 focus:border-primary/10 focus:bg-surface-container-high transition-all text-sm outline-none font-bold text-on-surface placeholder:text-on-surface/20 shadow-inner" 
                    placeholder="E.g. ZAR Media" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Personal Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={16} />
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-xl sm:rounded-2xl py-3.5 pl-12 pr-4 focus:border-primary/10 focus:bg-surface-container-high transition-all text-sm outline-none font-bold text-on-surface placeholder:text-on-surface/20 shadow-inner" 
                    placeholder="E.g. John Doe" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Gender identity</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Male", "Female"].map((sex) => (
                    <button
                      key={sex}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: sex })}
                      className={`py-3.5 rounded-xl sm:rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all border-2 ${
                        formData.gender === sex 
                        ? "bg-primary text-black border-primary shadow-xl shadow-primary/20 scale-102" 
                        : "bg-surface-container-low text-on-surface-variant/40 border-transparent hover:bg-surface-container"
                      }`}
                    >
                      {sex}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Region</label>
                <div className="relative">
                  <select 
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-xl sm:rounded-2xl py-3.5 px-4 focus:border-primary/10 focus:bg-surface-container-high transition-all appearance-none font-bold text-xs text-on-surface outline-none shadow-inner"
                  >
                    <option value="" disabled className="bg-surface text-on-surface">Select Country</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code} className="bg-surface text-on-surface">{c.flag} {c.name}</option>
                    ))}
                  </select>
                  <ArrowRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/20 rotate-90" />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Contact Number</label>
            <div className="flex gap-3">
              {isSignup && (
                <div className="bg-surface-container-high px-4 flex items-center justify-center rounded-xl sm:rounded-2xl font-bold text-on-surface text-xs border-2 border-transparent shadow-inner">
                  {selectedCountry.dialCode || "🌐"}
                </div>
              )}
              <div className="relative flex-1 group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={16} />
                <input 
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full bg-surface-container-low border-2 border-transparent rounded-xl sm:rounded-2xl py-3.5 pl-12 pr-4 focus:border-primary/10 focus:bg-surface-container-high transition-all text-sm outline-none font-bold text-on-surface placeholder:text-on-surface/20 shadow-inner" 
                  placeholder={isSignup ? "WhatsApp Number" : "Enter Registered Number"} 
                  type="tel"
                />
              </div>
            </div>
          </div>

          {isSignup && (
            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 ml-1">Access Key (Optional)</label>
              <div className="relative group">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={16} />
                <input 
                  value={formData.referredBy}
                  onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                  className="w-full bg-surface-container-low border-2 border-transparent rounded-xl sm:rounded-2xl py-3.5 pl-12 pr-4 focus:border-primary/10 focus:bg-surface-container-high transition-all text-sm outline-none font-bold text-on-surface placeholder:text-on-surface/20 shadow-inner" 
                  placeholder="Referral Code" 
                />
              </div>
            </div>
          )}

          <div className="pt-4">
            <button 
              disabled={isLoading}
              className="w-full bg-primary text-black py-4 rounded-xl sm:rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-secondary hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignup ? "Initialize Sync" : "Access Terminal"}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest">
            {isSignup ? "Synchronized Before?" : "New To The Network?"}{" "}
            <Link 
              to={isSignup ? "/auth" : "/auth?mode=signup"} 
              className="font-bold text-secondary hover:text-primary transition-colors ml-1 border-b border-secondary/20 pb-0.5"
            >
              {isSignup ? "Sign In Now" : "Register Here"}
            </Link>
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="glass-card w-full max-w-xl rounded-2xl sm:rounded-[2.5rem] overflow-hidden relative z-10 shadow-2xl border border-white/10"
            >
              <div className="bg-surface-container-high border-b border-white/15 p-8 sm:p-10 text-center text-white relative">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/20">
                  <CheckCircle2 size={32} className="text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-headline tracking-tighter mb-2 leading-tight">
                  Hey! {submissionData?.name} WSV.
                </h2>
                <p className="text-white/60 font-medium uppercase tracking-[0.15em] text-[9px] sm:text-[10px]">Thank you for your submission</p>
              </div>

              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                <div className="space-y-4">
                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 space-y-3">
                    <p className="text-primary font-bold leading-relaxed text-sm sm:text-base">
                      Please come back by <span className="text-secondary font-black">9:30 PM</span> to download your compiled VCF.
                    </p>
                    <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">
                      Everyday submission is needed for the views to work. Only download VCF for the date that you submitted your contact. That means if you submitted your contact today, download today's VCF file and repeat the step tommorow.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        toast.success("Reminder set for 9:30 PM! Don't forget to return.");
                        if ("Notification" in window) {
                           Notification.requestPermission();
                        }
                      }}
                      className="flex-1 bg-secondary/10 text-secondary py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-secondary hover:text-white transition-all"
                    >
                      <Clock size={14} />
                      Remind Me at 9:30 PM
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link 
                    to="/download"
                    className="w-full bg-primary text-black py-4.5 rounded-xl font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-primary/10 hover:scale-[1.01] transition-transform text-sm text-center"
                  >
                    <Download size={16} />
                    Access Drop Zone
                  </Link>
                  <button 
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full text-primary/40 font-bold uppercase tracking-widest text-[9px] hover:text-primary transition-colors py-1.5"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

