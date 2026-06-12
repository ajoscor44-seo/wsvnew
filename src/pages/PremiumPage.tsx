/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Zap, 
  Check, 
  Users, 
  Sparkles, 
  Clock, 
  Share2, 
  ArrowRight,
  TrendingUp,
  Award,
  ShieldCheck,
  X
} from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "../components/Breadcrumbs";

interface ProductPlan {
  id: string;
  name: string;
  priceNGN: string;
  priceUSD: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  recommended?: boolean;
}

export const PremiumPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>("Better");
  const [showPayModal, setShowPayModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState<ProductPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    gender: "Male",
    country: "NG",
  });

  const countries = [
    { code: "NG", name: "Nigeria", flag: "🇳🇬", dialCode: "+234" },
    { code: "GH", name: "Ghana", flag: "🇬🇭", dialCode: "+233" },
    { code: "ZA", name: "South Africa", flag: "🇿🇦", dialCode: "+27" },
    { code: "KE", name: "Kenya", flag: "🇰🇪", dialCode: "+254" },
  ];

  const selectedCountry = countries.find((c) => c.code === formData.country) || countries[0];

  // Read query parameters to auto-highlight chosen plan
  useEffect(() => {
    document.title = "Choose Your WSV Premium Sync Plan | WSV Nigeria";
    window.scrollTo(0, 0);

    const params = new URLSearchParams(location.search);
    const planParam = params.get("plan");
    if (planParam && ["Good", "Better", "Best"].includes(planParam)) {
      setSelectedPlan(planParam);
    }
  }, [location.search]);

  const plans: ProductPlan[] = [
    {
      id: "Good",
      name: "WSV – 5,000 Contacts",
      priceNGN: "₦1,000",
      priceUSD: "$0.74",
      shortDesc: "Entry-level WhatsApp Status Views package designed to help users grow their contact list and increase status reach.",
      fullDesc: "Grow your WhatsApp audience with 5,000 active contacts delivered through our synchronization network. Ideal for small businesses, vendors, affiliate marketers, and creators looking to increase their WhatsApp Status views and expand their reach.",
      features: [
        "Priority sync queue entry",
        "5,000 active verified contacts",
        "Standard system synchronization",
        "No password or login required",
        "Lifetime support for imported files"
      ]
    },
    {
      id: "Better",
      name: "WSV – 10,000 Contacts",
      priceNGN: "₦2,000",
      priceUSD: "$1.47",
      shortDesc: "Mid-tier package offering a larger contact base for increased WhatsApp status visibility and audience growth.",
      fullDesc: "Grow your WhatsApp audience with 10,000 active contacts. Designed for businesses and influencers seeking higher visibility, better engagement, and more opportunities to reach potential customers.",
      features: [
        "High priority queue visibility",
        "10,000 active verified contacts",
        "Custom VCF naming structure",
        "Priority synchronization delivery",
        "Direct admin technical support"
      ],
      recommended: true
    },
    {
      id: "Best",
      name: "WSV – 15,000 Contacts",
      priceNGN: "₦3,000",
      priceUSD: "$2.21",
      shortDesc: "Premium package with 15,000 contacts, daily delivery, estimated 2,000+ WhatsApp views, group access, and support.",
      fullDesc: "Our most powerful growth package. Receive up to 15,000 contacts through daily deliveries, gain access to the premium WSV network, and maximize your WhatsApp Status exposure with one of our highest-capacity plans.",
      features: [
        "God-mode sync priority queue",
        "15,000 premium verified contacts",
        "Average of 800 contacts delivered daily until completed",
        "Expected 2,000+ stable status views",
        "Official WSV premium group membership",
        "Suitable for TV owners, agencies, and top brands",
        "24/7 VIP messaging support"
      ]
    }
  ];

  const handleUpgradeClick = (plan: ProductPlan) => {
    setTargetPlan(plan);
    setShowPayModal(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPlan) return;

    if (!formData.name) {
      toast.error("Please enter your display name");
      return;
    }
    if (!formData.phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }

    let finalPhone = formData.phoneNumber;
    if (selectedCountry.dialCode && !finalPhone.startsWith("+") && !finalPhone.startsWith(selectedCountry.dialCode)) {
      const cleanPhone = finalPhone.startsWith("0") ? finalPhone.substring(1) : finalPhone;
      finalPhone = selectedCountry.dialCode + cleanPhone;
    }

    const cleanPhoneForEmail = finalPhone.replace(/\D/g, "");
    const customerEmail = `${cleanPhoneForEmail}@wsv.com.ng`;

    const planPrices: Record<string, number> = {
      Good: 1000,
      Better: 2000,
      Best: 3000
    };
    const amount = planPrices[targetPlan.id] || 1000;
    const paymentRef = `wsv_${cleanPhoneForEmail}_${Date.now()}`;

    const korapayKey = import.meta.env.VITE_KORAPAY_PUBLIC_KEY;
    if (!korapayKey) {
      toast.error("Korapay public key is not configured");
      return;
    }

    if (!(window as any).Korapay) {
      toast.error("Payment gateway is loading, please try again in a moment");
      return;
    }

    setIsLoading(true);

    try {
      (window as any).Korapay.initialize({
        key: korapayKey,
        reference: paymentRef,
        amount: amount,
        currency: "NGN",
        customer: {
          name: formData.name,
          email: customerEmail,
        },
        notification_url: window.location.origin + "/api/korapay/webhook",
        onClose: () => {
          setIsLoading(false);
          toast.error("Payment modal closed");
        },
        onSuccess: async (data: any) => {
          toast.success("Payment completed successfully! Syncing account...");
          try {
            const response = await fetch("/api/submit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                ...formData, 
                phoneNumber: finalPhone,
                plan: targetPlan.id,
                paymentReference: paymentRef 
              }),
            });

            const text = await response.text();
            let resData;
            try {
              resData = JSON.parse(text);
            } catch (err) {
              console.error("Invalid response body:", text);
              throw new Error(`Server returned an invalid response (Status ${response.status})`);
            }

            if (response.ok) {
              const fullUserData = {
                name: formData.name,
                phoneNumber: finalPhone,
                businessName: formData.name,
                plan: targetPlan.id,
                referralCode: resData.referralCode,
              };

              localStorage.setItem("zar_user", JSON.stringify(fullUserData));
              setShowPayModal(false);
              toast.success("Successfully upgraded to Premium! Redirecting to WhatsApp...");
              
              const encodedText = encodeURIComponent(
                `Hello WSV Support,\n\nI have successfully paid and subscribed to the *${targetPlan.name}* plan.\n\nName: ${formData.name}\nPhone: ${finalPhone}\nPayment Ref: ${paymentRef}\n\nPlease verify my payment and add me to the VIP sync list.`
              );
              window.location.href = `https://wa.me/2348103460237?text=${encodedText}`;
            } else {
              toast.error(resData.error || "Upgrade failed, please contact support");
            }
          } catch (error: any) {
            console.error("Upgrade error:", error);
            toast.error(error.message || "Failed to update account status");
          } finally {
            setIsLoading(false);
          }
        }
      });
    } catch (err: any) {
      console.error("Korapay initialize error:", err);
      toast.error("Could not launch payment gateway");
      setIsLoading(false);
    }
  };

  // Structured product schemas to serve search crawlers
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": plans.map((plan, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": {
        "@type": "Product",
        "name": plan.name,
        "description": plan.fullDesc,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "NGN",
          "price": plan.priceNGN.replace(/[^\d]/g, ""),
          "availability": "https://schema.org/InStock"
        }
      }
    }))
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-secondary/30 selection:text-primary">
      {/* Schema injection */}
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>

      <main className="max-w-7xl mx-auto px-margin-mobile sm:px-margin-desktop pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 relative">
        <Breadcrumbs items={[{ label: "Go Premium", path: "/premium" }]} />

        {/* Hero Section */}
        <section className="text-center mb-10 sm:mb-14 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
          >
            <Sparkles size={12} className="text-accent" />
            Exponential Sync Velocity
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display-lg text-white tracking-tighter leading-none mb-4 sm:mb-6">
            Choose Your <span className="text-gradient">Premium Velocity</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto font-medium leading-relaxed">
            Boost visibility, double your audience metrics, and dominate your WhatsApp views. Fast and safe.
          </p>
        </section>

        {/* Pricing Layout */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start mb-16">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                className={`glass-card p-6 sm:p-8 rounded-[32px] flex flex-col relative overflow-hidden transition-all duration-300 border ${
                  plan.recommended 
                    ? "border-primary bg-primary/[0.02] shadow-xl shadow-primary/5 ring-1 ring-primary/20" 
                    : isSelected
                    ? "border-secondary bg-secondary/[0.01] shadow-lg shadow-secondary/5"
                    : "border-white/5"
                }`}
              >
                {/* Popular Badge */}
                {plan.recommended && (
                  <div className="absolute top-0 right-0 bg-primary text-black font-bold uppercase tracking-widest text-[9px] px-5 py-1.5 rounded-bl-2xl">
                    Most Popular
                  </div>
                )}

                <div className="mb-6 sm:mb-8">
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${plan.recommended ? "text-primary" : "text-on-surface-variant"}`}>
                    {plan.id === "Good" ? "Basic Plan" : plan.id === "Better" ? "Value Plan" : "Ultimate Plan"}
                  </span>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 mb-3">
                    {plan.name}
                  </h3>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-stats-number text-white">
                      {plan.priceNGN}
                    </span>
                    <span className="text-xs sm:text-sm text-on-surface-variant font-bold">
                      / {plan.priceUSD}
                    </span>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mt-4 font-semibold">
                    {plan.fullDesc}
                  </p>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-on-surface-variant/90">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        plan.id === "Best" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgradeClick(plan)}
                  className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    plan.recommended
                      ? "bg-primary text-black shadow-lg shadow-primary/15 hover:scale-[1.02] hover:shadow-primary/25"
                      : plan.id === "Best"
                      ? "bg-gradient-to-r from-accent to-secondary text-white shadow-lg hover:scale-[1.02]"
                      : "bg-white/5 text-white hover:bg-white/10 hover:scale-[1.02] border border-white/10"
                  }`}
                >
                  Upgrade & Pay Now
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            );
          })}
        </section>

        {/* Enterprise Sync Feature Callout */}
        <section className="glass-card rounded-[2rem] border border-white/5 p-6 sm:p-10 md:p-14 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-40 group-hover:scale-105 transition-transform duration-700" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4 sm:space-y-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Award size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline text-white tracking-tight leading-tight">
                  Looking for custom, high-volume growth cycles?
                </h3>
                <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed max-w-2xl font-semibold">
                  For enterprise brands, agencies, and large-scale digital creators looking for manual file compiles, customized campaign target coordinates, or priority support channels.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                <span className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <ShieldCheck size={16} /> Fully safe sync protocol
                </span>
                <span className="flex items-center gap-2 text-xs font-bold text-secondary">
                  <TrendingUp size={16} /> 100% organic growth guarantee
                </span>
              </div>
            </div>
            
            <div className="lg:col-span-4 lg:text-right">
              <a
                href="https://wa.me/2348103460237?text=Hello%20WSV%20Support%2C%20I%20am%20interested%20in%20an%20Enterprise%2FCustom%20Sync%20package."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black px-6 sm:px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest inline-flex items-center gap-2 hover:scale-105 transition-transform whitespace-nowrap shadow-xl"
              >
                Talk to Support
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showPayModal && targetPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isLoading) setShowPayModal(false); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-lg rounded-[2.5rem] overflow-hidden relative z-10 shadow-2xl border border-white/10 p-6 sm:p-10"
            >
              <button
                disabled={isLoading}
                onClick={() => setShowPayModal(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <span className="text-primary font-bold uppercase tracking-[0.2em] text-[10px]">Upgrade Checkout</span>
                <h2 className="text-2xl sm:text-3xl font-black font-headline tracking-tighter text-white mt-1">
                  Activate {targetPlan.name.split("–")[1]?.trim() || targetPlan.name}
                </h2>
                <p className="text-on-surface-variant text-xs sm:text-sm font-semibold mt-1">
                  Enter your contact details to authorize payment and initiate sync.
                </p>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/60 ml-1">Display Name</label>
                  <input
                    required
                    disabled={isLoading}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl py-3.5 px-4 focus:border-primary/10 focus:bg-surface-container-high transition-all text-sm outline-none font-bold text-on-surface placeholder:text-on-surface/20 shadow-inner disabled:opacity-50"
                    placeholder="E.g. ZAR Media"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/60 ml-1">Sex</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Male", "Female"].map((sex) => (
                        <button
                          key={sex}
                          type="button"
                          disabled={isLoading}
                          onClick={() => setFormData({ ...formData, gender: sex })}
                          className={`py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border-2 disabled:opacity-50 ${
                            formData.gender === sex
                              ? "bg-primary text-black border-primary shadow-lg shadow-primary/10"
                              : "bg-surface-container-low text-on-surface-variant/40 border-transparent hover:bg-surface-container"
                          }`}
                        >
                          {sex}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/60 ml-1">Country</label>
                    <select
                      required
                      disabled={isLoading}
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-xl py-3.5 px-3 focus:border-primary/10 focus:bg-surface-container-high transition-all text-xs outline-none font-bold text-on-surface shadow-inner disabled:opacity-50"
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.code} className="bg-surface text-on-surface">
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/60 ml-1">WhatsApp Number</label>
                  <div className="flex gap-2">
                    <div className="bg-surface-container-high px-4 flex items-center justify-center rounded-2xl font-bold text-on-surface text-xs border border-white/5">
                      {selectedCountry.dialCode}
                    </div>
                    <input
                      required
                      type="tel"
                      disabled={isLoading}
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="flex-1 bg-surface-container-low border-2 border-transparent rounded-2xl py-3.5 px-4 focus:border-primary/10 focus:bg-surface-container-high transition-all text-sm outline-none font-bold text-on-surface placeholder:text-on-surface/20 shadow-inner disabled:opacity-50"
                      placeholder="e.g. 8030000000"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setShowPayModal(false)}
                    className="flex-1 bg-white/5 text-white border border-white/10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-primary text-black py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-secondary hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Pay {targetPlan.priceNGN}
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
