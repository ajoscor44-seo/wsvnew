/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

export const LandingPage = () => {
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    name: "",
    phoneNumber: "",
    gender: "Male",
    country: "NG",
    plan: "Free",
  });

  const navigate = useNavigate();

  const countries = [
    { code: "NG", name: "Nigeria", flag: "🇳🇬", dialCode: "+234" },
    { code: "GH", name: "Ghana", flag: "🇬🇭", dialCode: "+233" },
    { code: "ZA", name: "South Africa", flag: "🇿🇦", dialCode: "+27" },
    { code: "KE", name: "Kenya", flag: "🇰🇪", dialCode: "+254" },
  ];

  const selectedCountry = countries.find((c) => c.code === formData.country) || countries[0];

  // Countdown timer logic
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      let nextDrop = new Date();
      nextDrop.setHours(21, 30, 0, 0);
      if (now.getTime() > nextDrop.getTime()) {
        nextDrop.setDate(nextDrop.getDate() + 1);
      }

      const diff = nextDrop.getTime() - now.getTime();
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch status (e.g. submissions count) on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/status");
        const data = await response.json();
        setSystemStatus(data);
      } catch (error) {
        console.error("Failed to fetch status", error);
      }
    };
    fetchStatus();
    document.title = "Increase WhatsApp Status Views Fast | WSV Nigeria";
  }, []);

  const handleSelectPlan = (plan: string) => {
    if (plan === "Free") {
      setFormData((prev) => ({ ...prev, plan }));
      const joinSection = document.getElementById("join");
      if (joinSection) {
        joinSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.location.href = `/premium?plan=${plan}`;
    }
  };

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleScrollToSection = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Please enter your display name");
      return;
    }

    let finalPhone = formData.phoneNumber;
    if (selectedCountry.dialCode && !finalPhone.startsWith("+") && !finalPhone.startsWith(selectedCountry.dialCode)) {
      const cleanPhone = finalPhone.startsWith("0") ? finalPhone.substring(1) : finalPhone;
      finalPhone = selectedCountry.dialCode + cleanPhone;
    }

    const cleanPhoneForEmail = finalPhone.replace(/\D/g, "");
    const customerEmail = `${cleanPhoneForEmail}@wsv.com.ng`;

    const submitToApi = async (paymentRef?: string) => {
      try {
        const response = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            ...formData, 
            phoneNumber: finalPhone,
            paymentReference: paymentRef 
          }),
        });

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("Server returned an invalid response");
        }

        if (response.ok) {
          const fullUserData = {
            name: formData.name,
            phoneNumber: finalPhone,
            businessName: formData.plan === "Free" ? `${formData.name} WSV` : formData.name,
            plan: formData.plan,
            referralCode: data.referralCode,
          };

          localStorage.setItem("zar_user", JSON.stringify(fullUserData));
          setSubmissionData(fullUserData);
          setShowSuccessModal(true);
          toast.success(formData.plan === "Free" ? "Successfully joined!" : "Upgrade successful!");
        } else {
          toast.error(data.error || "Something went wrong");
        }
      } catch (error: any) {
        console.error("Submission error:", error);
        toast.error(error.message || "Failed to connect to server");
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);

    if (formData.plan !== "Free") {
      const planPrices: Record<string, number> = {
        Good: 1000,
        Better: 2000,
        Best: 3000
      };
      const amount = planPrices[formData.plan] || 1000;
      const paymentRef = `wsv_${cleanPhoneForEmail}_${Date.now()}`;

      const korapayKey = import.meta.env.VITE_KORAPAY_PUBLIC_KEY;
      if (!korapayKey) {
        toast.error("Korapay public key is not configured");
        setIsLoading(false);
        return;
      }

      if (!(window as any).Korapay) {
        toast.error("Payment gateway is loading, please try again in a moment");
        setIsLoading(false);
        return;
      }

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
            await submitToApi(paymentRef);
          }
        });
      } catch (err: any) {
        console.error("Korapay initialize error:", err);
        toast.error("Could not launch payment gateway");
        setIsLoading(false);
      }
    } else {
      await submitToApi();
    }
  };
  const getPlanButtonClass = (planId: string) => {
    const isSelected = formData.plan === planId;
    if (isSelected) {
      if (planId === "Best") {
        return "border border-tertiary bg-tertiary/10 p-3 rounded-xl transition-all text-left cursor-pointer";
      }
      return "border border-primary bg-primary/10 p-3 rounded-xl transition-all text-left cursor-pointer";
    }
    return "border border-white/10 p-3 rounded-xl hover:border-primary transition-all text-left group cursor-pointer";
  };

  const getPlanTextClass = (planId: string) => {
    const isSelected = formData.plan === planId;
    if (isSelected) {
      if (planId === "Best") return "block font-bold text-tertiary";
      return "block font-bold text-primary";
    }
    return "block font-bold text-white";
  };

  const joins = ["0706***5678", "0812***0921", "0905***1143", "0803***8822", "0704***4432"];
  const faqs = [
    {
      q: "How can I increase WhatsApp Status views?",
      a: "One of the most effective ways is to grow your contact network, create engaging content, post consistently, and encourage interactions from your audience.",
    },
    {
      q: "Is WSV suitable for businesses?",
      a: "Yes. Many entrepreneurs, vendors, marketers, and service providers use WhatsApp as a major sales and communication channel.",
    },
    {
      q: "Does it work on Android and iPhone?",
      a: "Yes. VCF contact files can be used on both Android and iOS devices.",
    },
    {
      q: "Can beginners use WSV?",
      a: "Absolutely. The process is simple and designed for users of all experience levels.",
    },
    {
      q: "Is my information protected?",
      a: "We are committed to maintaining user privacy and continuously improving platform security and operational standards.",
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-background text-on-background">
      {/* Hero Section */}
      <section className="relative pt-stack-lg pb-24 overflow-hidden">
        <div className="max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-stack-md">
            <div className="inline-flex items-center gap-2 bg-primary-container/20 border border-primary/20 px-4 py-1.5 rounded-full text-primary font-label-md text-label-md">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Nigeria's Leading WhatsApp Growth Network
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display-lg tracking-tight leading-[1.1] text-white">
              Increase WhatsApp Status Views <span className="text-primary">Fast</span> – Nigeria's Leading WhatsApp Growth Network
            </h1>
            <div className="space-y-4 text-on-surface-variant max-w-xl">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-headline">Grow Your WhatsApp Status Reach Organically</h2>
              <p className="font-body-md text-body-md leading-relaxed">
                Join Nigeria's leading community-driven WhatsApp growth network. WSV helps creators, online vendors, affiliate marketers, and business owners expand their reach, gain active contact views, and boost status engagement fast.
              </p>
              <p className="font-body-md text-body-md font-bold text-primary mt-2">
                More Contacts. More Reach. More Views. More Opportunities.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full">
              <Link
                to="/download-vcf"
                className="bg-gradient-to-b from-primary to-secondary-container text-on-primary-fixed px-8 py-4 rounded-xl font-headline-md text-[18px] font-bold shadow-lg hover:shadow-primary/20 transition-all text-center w-full sm:w-auto"
              >
                Download VCF
              </Link>
              <button
                onClick={() => handleScrollToSection("#join")}
                className="bg-surface-container-high border border-white/10 text-on-surface px-8 py-4 rounded-xl font-headline-md text-[18px] font-bold hover:bg-surface-container-highest transition-all cursor-pointer w-full sm:w-auto"
              >
                Submit Your Contact
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {/* Countdown & Stats Cards */}
            <div className="glass-card p-8 rounded-3xl ambient-glow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[80px] text-white">sync</span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-2">Next Sync Drop In</p>
              <div className="font-stats-number text-stats-number text-primary tabular-nums">{timeLeft}</div>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant mb-1">Live Reach</p>
                  <div className="flex items-center gap-3">
                    <span className="font-headline-lg text-headline-lg text-white">450.2k</span>
                    <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-bold font-label-md">+124.5%</span>
                  </div>
                </div>
                <div className="w-32 h-12 bg-surface-container-highest/50 rounded-lg overflow-hidden flex items-end gap-1 p-1">
                  <div className="w-full bg-primary h-[30%] rounded-sm"></div>
                  <div className="w-full bg-primary h-[45%] rounded-sm"></div>
                  <div className="w-full bg-primary h-[40%] rounded-sm"></div>
                  <div className="w-full bg-primary h-[60%] rounded-sm"></div>
                  <div className="w-full bg-primary h-[85%] rounded-sm"></div>
                  <div className="w-full bg-primary h-[75%] rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Activity Ticker */}
      <section className="bg-surface-container-lowest border-y border-white/5 py-4 overflow-hidden">
        <div className="flex whitespace-nowrap marquee gap-12">
          <div className="flex gap-12 items-center px-6">
            {joins.map((phone, i) => (
              <span key={i} className="flex items-center gap-2 text-on-surface-variant font-body-md">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                {phone} just joined
              </span>
            ))}
          </div>
          {/* Duplicate for seamless loop */}
          <div className="flex gap-12 items-center px-6" aria-hidden="true">
            {joins.map((phone, i) => (
              <span key={`dup-${i}`} className="flex items-center gap-2 text-on-surface-variant font-body-md">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                {phone} just joined
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop">
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-60">
          <div className="flex items-center gap-4 text-white">
            <span className="material-symbols-outlined text-primary text-[32px]">group</span>
            <span className="font-headline-md text-headline-md">2M+ Active Users</span>
          </div>
          <div className="flex items-center gap-4 text-white">
            <span className="material-symbols-outlined text-primary text-[32px]">star</span>
            <span className="font-headline-md text-headline-md">5.0 Ecosystem Score</span>
          </div>
          <div className="flex items-center gap-4 text-white">
            <span className="material-symbols-outlined text-primary text-[32px]">verified_user</span>
            <span className="font-headline-md text-headline-md">Verified Reach</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-stack-lg" id="about">
        <div className="max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-square glass-card rounded-[40px] flex items-center justify-center p-12">
              <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
                <div className="font-stats-number text-[80px] text-primary mb-2">94%</div>
                <div className="font-headline-md text-headline-md text-white">Network Saturation</div>
                <div className="w-full max-w-[240px] h-3 bg-surface-container-high rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary w-[94%]"></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 glass-card p-6 rounded-2xl border border-primary/20 premium-glow">
              <span className="font-label-md text-label-md block mb-1 text-on-surface-variant">Efficiency</span>
              <span className="font-headline-md text-headline-md text-primary">High Velocity</span>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline-lg text-white">What Is WhatsApp Status Views (WSV)?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              WSV is a community-powered platform that expands your contact list using downloadable VCF files. Connect with active WhatsApp users to increase status views organically without expensive ad campaigns.
            </p>
            <h3 className="font-headline-md text-headline-md text-white pt-2">Why Users Join WSV</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Increase WhatsApp Status views organically",
                "Grow your WhatsApp audience faster",
                "Reach more potential customers",
                "Expand your business visibility",
                "Improve engagement on WhatsApp",
                "Build a larger contact network",
                "Promote products and services effectively",
                "Increase brand awareness"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  <span className="font-body-md text-body-md">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section className="bg-surface-container-low py-stack-lg">
        <div className="max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline-lg mb-4 text-white">How To Increase WhatsApp Status Views</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto font-body-md leading-relaxed">
            Boost visibility through contact relationships. The more active contacts you have, the greater your status reach. Start growing with our simple 5-step process:
          </p>
        </div>
        <div className="max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { num: "01", title: "Submit Your Details", desc: "Provide your basic information and WhatsApp phone number." },
            { num: "02", title: "Join The Network", desc: "Your profile enters the active synchronization queue." },
            { num: "03", title: "Download Your VCF File", desc: "Receive access to contact files generated from active network participants." },
            { num: "04", title: "Import Contacts", desc: "Add contacts to your device quickly and easily." },
            { num: "05", title: "Grow Your Views", desc: "As your network expands, your WhatsApp Status gains more exposure and visibility." }
          ].map((step, idx) => (
            <div key={idx} className="glass-card p-8 rounded-3xl text-center hover:bg-surface-container-high transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary transition-colors">
                <span className="font-headline-md text-primary group-hover:text-black transition-colors">{step.num}</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-2 text-white">{step.title}</h3>
              <p className="font-label-md text-label-md text-on-surface-variant">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Target Audience & Views Importance */}
      <section className="py-stack-lg border-t border-white/5">
        <div className="max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop grid md:grid-cols-2 gap-16">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline-lg text-white">Who Can Benefit From WSV?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Business Owners", desc: "Promote products, services, offers, discounts, and announcements to a larger audience." },
                { title: "Affiliate Marketers", desc: "Get more eyes on your links, promotions, and marketing campaigns." },
                { title: "Content Creators", desc: "Increase content visibility and build a stronger community around your brand." },
                { title: "Online Vendors", desc: "Showcase products daily to a growing audience of WhatsApp users." },
                { title: "Freelancers", desc: "Reach potential clients and generate more business opportunities." },
                { title: "Influencers", desc: "Expand your influence and connect with more people in your niche." }
              ].map((role, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/20 transition-all text-left">
                  <h4 className="font-bold text-white font-headline text-sm mb-1">{role.title}</h4>
                  <p className="text-on-surface-variant text-xs">{role.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline-lg text-white">Why More WhatsApp Status Views Matter</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              WhatsApp is one of the most powerful platforms in Africa. Expanding your views helps you generate leads, build trust, and drive inquiries organically.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant font-semibold">
              More views can help you:
            </p>
            <div className="space-y-4 pt-2">
              {[
                "Generate more leads",
                "Increase product awareness",
                "Build trust with potential customers",
                "Drive more inquiries",
                "Improve conversion opportunities",
                "Expand your digital presence",
                "Grow your personal or business brand"
              ].map((point, i) => (
                <div key={i} className="flex items-center gap-3 text-on-surface-variant">
                  <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs shrink-0 font-bold font-headline">✓</span>
                  <span className="font-body-md text-body-md text-left">{point}</span>
                </div>
              ))}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed pt-2">
              When more people see your content, you create more opportunities for engagement and growth.
            </p>
          </div>
        </div>
      </section>

      {/* Free vs Premium Comparison Section */}
      <section className="py-12 border-t border-white/5 max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop">
        <div className="text-center mb-10">
          <span className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs">Ecosystem Comparison</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline-lg text-white mt-2">Free vs Premium Sync</h2>
        </div>

        <div className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm sm:text-base">
              <thead>
                <tr className="bg-surface-container-high border-b border-white/10 text-white font-bold font-headline uppercase text-[10px] tracking-wider">
                  <th className="p-4 sm:p-6">Feature</th>
                  <th className="p-4 sm:p-6 text-on-surface-variant">Free Plan</th>
                  <th className="p-4 sm:p-6 text-primary">Premium Plans</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-on-surface-variant font-semibold">
                <tr>
                  <td className="p-4 sm:p-6 text-white font-headline text-sm sm:text-base">Sync Priority</td>
                  <td className="p-4 sm:p-6 text-xs sm:text-sm">Standard sync queue</td>
                  <td className="p-4 sm:p-6 text-xs sm:text-sm text-primary flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Priority Sync & Fast Track
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 text-white font-headline text-sm sm:text-base">Contact Volume</td>
                  <td className="p-4 sm:p-6 text-xs sm:text-sm">Basic pool (~100 contacts)</td>
                  <td className="p-4 sm:p-6 text-xs sm:text-sm text-white">Up to 15,000 verified contacts</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 text-white font-headline text-sm sm:text-base">Custom Labeling</td>
                  <td className="p-4 sm:p-6 text-xs sm:text-sm">Standard contact format</td>
                  <td className="p-4 sm:p-6 text-xs sm:text-sm text-white">Custom names to stand out</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 text-white font-headline text-sm sm:text-base">Community Network</td>
                  <td className="p-4 sm:p-6 text-xs sm:text-sm">No group access</td>
                  <td className="p-4 sm:p-6 text-xs sm:text-sm text-white">Official WSV WhatsApp Group</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 text-white font-headline text-sm sm:text-base">Sync Schedule</td>
                  <td className="p-4 sm:p-6 text-xs sm:text-sm">Manual nightly download</td>
                  <td className="p-4 sm:p-6 text-xs sm:text-sm text-white">Automated priority drops</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-6 text-white font-headline text-sm sm:text-base">Support Priority</td>
                  <td className="p-4 sm:p-6 text-xs sm:text-sm">Standard self-service</td>
                  <td className="p-4 sm:p-6 text-xs sm:text-sm text-white">24/7 VIP Admin Support</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Contact Submission Form */}
      <section className="py-stack-lg" id="join">
        <div className="max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop grid md:grid-cols-2 gap-16 items-start">
          <div className="sticky top-24">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline-lg mb-6 text-white">Initiate Your Growth Sequence</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">Join the queue for the next VCF download. Ensure your phone number is correct to maintain synchronization integrity.</p>
            <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="block text-primary font-stats-number text-stats-number">
                  {systemStatus?.totalUsers ? systemStatus.totalUsers.toLocaleString() : "93,559"}
                </span>
                <span className="text-on-surface-variant font-label-md">Active Submissions Today</span>
              </div>
              <span className="material-symbols-outlined text-primary text-[48px]">trending_up</span>
            </div>
          </div>
          <div className="glass-card p-10 rounded-[32px] border border-primary/20 ambient-glow">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Display Name</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, businessName: e.target.value })}
                    className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                    placeholder="John Doe"
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Sex</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none appearance-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant">Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code} className="bg-surface-container-high text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant">Phone Number</label>
                <div className="flex">
                  <span className="bg-surface-container-highest border border-r-0 border-white/10 rounded-l-xl px-4 py-3 text-on-surface-variant flex items-center">
                    {selectedCountry.dialCode}
                  </span>
                  <input
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-surface-container-high border border-white/10 rounded-r-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                    placeholder="8030000000"
                    type="tel"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant">Select Sync Plan</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan("Free")}
                    className={getPlanButtonClass("Free")}
                  >
                    <span className={getPlanTextClass("Free")}>Free</span>
                    <span className="text-xs text-on-surface-variant">Basic Sync</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan("Good")}
                    className={getPlanButtonClass("Good")}
                  >
                    <span className={getPlanTextClass("Good")}>Good</span>
                    <span className="text-xs text-on-surface-variant">Priority Sync</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan("Better")}
                    className={getPlanButtonClass("Better")}
                  >
                    <span className={getPlanTextClass("Better")}>Better</span>
                    <span className="text-xs text-on-surface-variant">High Impact</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan("Best")}
                    className={getPlanButtonClass("Best")}
                  >
                    <span className={getPlanTextClass("Best")}>Best</span>
                    <span className="text-xs text-on-surface-variant">Mega Reach</span>
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-on-primary-fixed py-4 rounded-xl font-headline-md text-headline-md font-bold hover:scale-[1.02] active:scale-100 transition-all shadow-lg shadow-primary/20 cursor-pointer flex justify-center items-center"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : formData.plan === "Free" ? (
                  "Submit Sequence"
                ) : (
                  `Upgrade & Sync (${formData.plan})`
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-surface-container-lowest py-stack-lg">
        <div className="max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline-lg mb-4 text-white">Trusted by 50,000+ Creators</h2>
          <div className="flex justify-center gap-1">
            <span className="material-symbols-outlined text-tertiary">star</span>
            <span className="material-symbols-outlined text-tertiary">star</span>
            <span className="material-symbols-outlined text-tertiary">star</span>
            <span className="material-symbols-outlined text-tertiary">star</span>
            <span className="material-symbols-outlined text-tertiary">star</span>
          </div>
        </div>
        <div className="max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-3xl">
            <p className="font-body-md text-body-md text-on-surface-variant italic mb-6">"My views went from 50 to 800 in just one week. The VCF quality is insane. No dead contacts."</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPDjIQlnXCwYorBHecEbsO7UALze3mZdWs4LKczI4TdGHh-5AkC3ShQeU7SowCmEqvv3mnSLsXobWkp_I-a-PflnA9EhIX0j0Jh3gn_xrLaLENByXhtLpQwCw2HuaEJAnNteSpM_EQjsgNv04ZfWvPxmQMt_0nDPSVKDgfSxEwKIBkR6zhy76RPenwN68IxP30XVY4OYP8zGl_Oxu17fvl0Q0FOmSNLnG7ZLtJRrJLvMqVnwL4-fR_s2zdZWYdOWCrMcWHXsYs_x8"
                  alt="David K."
                />
              </div>
              <div>
                <span className="block font-bold text-white">David K.</span>
                <span className="text-xs text-primary">Content Creator</span>
              </div>
            </div>
          </div>
          <div className="glass-card p-8 rounded-3xl border border-primary/20 md:scale-105 shadow-xl relative">
            <span className="absolute top-4 right-4 bg-primary text-on-primary-fixed px-2 py-0.5 rounded text-[10px] font-bold font-label-md">PREMIUM</span>
            <p className="font-body-md text-body-md text-on-surface-variant italic mb-6">"As a vendor, reach is everything. WSV helped me triple my sales conversion by putting my products in front of thousands daily."</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDh-2C4unFYPiUUwwYHSSn9Qmclyp9RbDwgHxzf0uQb7qwAE7M31ZUNcFEspf7fYayaGGsxSayGXHivaN7DqMPnwyKE5iWgaMdV4TSHPxwSRuDL3_T1vK3J0_-6ScRP3CsIhSO_LhLsnSuwFvs8LI8pi2NQApewV1spO-jY30EZ8M91Fms2sv_sjJ_7l7sijCKAPdxzfxOf7kA_A2hOMyTtonusbDNg93MWpdJP4NOsWPX-IcHVbcXJuyo5omfymIe-GFfOOxC2oPs"
                  alt="Blessing O."
                />
              </div>
              <div>
                <span className="block font-bold text-white">Blessing O.</span>
                <span className="text-xs text-primary">E-commerce Vendor</span>
              </div>
            </div>
          </div>
          <div className="glass-card p-8 rounded-3xl">
            <p className="font-body-md text-body-md text-on-surface-variant italic mb-6">"Clean, simple, and effective. The synchronization process is truly automatic. Nigeria's best, hands down."</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAR6I_3dOqtoSnUU0T4FHEZxY5entalRceacYvne5h5ghIUWOU4ISmtYwUxmQ088Saa0Lvd-bO7kC95JyoolhBO0PVmAgTWNdGE0bxpnnvpNvKudlVu6wDEEWyUv92F3Qr1njrXcl-mAjzvAKP1zgVQjSGIEFCgnWRCZgvicpExUCnhEYVkYa7iiSpgnJnQTHXfsw_i2HMgnnStNN0oyrXaHkwsT0RDvaQa2O-bGJGkaFcmd7q2TnFat8_d3sUTG0sKkSExBEq8vn0"
                  alt="Ibrahim S."
                />
              </div>
              <div>
                <span className="block font-bold text-white">Ibrahim S.</span>
                <span className="text-xs text-primary">Digital Marketer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface-container-low py-stack-lg border-y border-white/5">
        <div className="max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline-lg mb-4 text-white">Features Designed For Growth</h2>
        </div>
        <div className="max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Verified Contact Network", desc: "Access a growing ecosystem of active WhatsApp users.", icon: "verified" },
            { title: "Daily Network Expansion", desc: "New users join every day, creating fresh growth opportunities.", icon: "group_add" },
            { title: "Fast Synchronization", desc: "Get connected to the network quickly and efficiently.", icon: "bolt" },
            { title: "Multiple Growth Plans", desc: "Choose the package that fits your goals and audience size.", icon: "layers" },
            { title: "User-Friendly Process", desc: "No complicated setup. No technical skills required.", icon: "touch_app" },
            { title: "Community-Powered Reach", desc: "Leverage the power of a growing network of active WhatsApp users.", icon: "share" }
          ].map((feature, idx) => (
            <div key={idx} className="glass-card p-8 rounded-3xl hover:bg-surface-container-high transition-all group border border-white/5 text-left">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-primary group-hover:text-black transition-colors">{feature.icon}</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-2 text-white">{feature.title}</h3>
              <p className="font-label-md text-label-md text-on-surface-variant">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-stack-lg max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop" id="pricing">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline-lg mb-4 text-white">Precision Sync Plans</h2>
          <p className="text-on-surface-variant font-body-md">Choose your velocity. Scale your influence.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Good */}
          <div className="glass-card p-8 rounded-[40px] flex flex-col hover:border-primary/40 transition-all group">
            <div className="mb-8">
              <span className="text-on-surface-variant font-label-md uppercase tracking-widest">Good</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[32px] font-bold font-headline-lg text-white">₦</span>
                <span className="text-[56px] font-extrabold font-stats-number leading-none text-white">1,000</span>
              </div>
              <p className="text-on-surface-variant mt-2 text-sm">Essential Growth Sync</p>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Priority Queue Entry
              </li>
              <li className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                2,000+ Verified Contacts
              </li>
              <li className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Standard Support
              </li>
            </ul>
            <button
              onClick={() => handleSelectPlan("Good")}
              className="w-full py-4 rounded-2xl border border-primary/30 text-primary font-bold hover:bg-primary hover:text-black transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>
          {/* Better (Recommended) */}
          <div className="glass-card p-8 rounded-[40px] flex flex-col border border-primary ambient-glow relative overflow-hidden ring-2 ring-primary/20">
            <div className="absolute top-0 right-0 bg-primary text-on-primary-fixed px-6 py-2 rounded-bl-3xl font-bold font-label-md">BEST VALUE</div>
            <div className="mb-8">
              <span className="text-primary font-label-md uppercase tracking-widest">Better</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[32px] font-bold font-headline-lg text-white">₦</span>
                <span className="text-[56px] font-extrabold font-stats-number leading-none text-white">2,000</span>
              </div>
              <p className="text-on-surface-variant mt-2 text-sm">High Velocity Network Reach</p>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Instant Sync Access
              </li>
              <li className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                5,000+ Premium Contacts
              </li>
              <li className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Priority Tech Support
              </li>
              <li className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Custom VCF Naming
              </li>
            </ul>
            <button
              onClick={() => handleSelectPlan("Better")}
              className="w-full py-4 rounded-2xl bg-primary text-black font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer"
            >
              Select Better
            </button>
          </div>
          {/* Best */}
          <div className="glass-card p-8 rounded-[40px] flex flex-col border border-tertiary/30 premium-glow relative group">
            <div className="mb-8">
              <span className="text-tertiary font-label-md uppercase tracking-widest">Best</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[32px] font-bold font-headline-lg text-white">₦</span>
                <span className="text-[56px] font-extrabold font-stats-number leading-none text-white">3,000</span>
              </div>
              <p className="text-on-surface-variant mt-2 text-sm">Maximum Ecosystem Saturation</p>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
                God-Mode Queue Priority
              </li>
              <li className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
                10,000+ Verified Network
              </li>
              <li className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
                Direct Admin Support
              </li>
              <li className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
                Weekly Sync Updates
              </li>
            </ul>
            <button
              onClick={() => handleSelectPlan("Best")}
              className="w-full py-4 rounded-2xl bg-tertiary text-black font-bold hover:scale-[1.02] transition-all cursor-pointer"
            >
              Go Unlimited
            </button>
          </div>
        </div>
      </section>

      {/* Final Slogan / CTA Banner */}
      <section className="py-stack-lg max-w-container-max mx-auto px-margin-mobile sm:px-margin-desktop">
        <div className="glass-card p-8 sm:p-12 md:p-16 rounded-[40px] border border-primary/20 ambient-glow relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display-lg text-white">Join Thousands Growing Their WhatsApp Reach</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Expand your reach, grow your audience, and get more status views daily. Join thousands of creators and vendors using our smart network synchronization to build visibility.
            </p>
            <div className="font-headline-md text-headline-md text-primary font-bold pt-2">
              Increase WhatsApp Status Views. Grow Your Audience. Expand Your Influence.
            </div>
            <div className="pt-4">
              <button 
                onClick={() => handleScrollToSection("#join")}
                className="bg-primary text-black px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-primary/20 cursor-pointer"
              >
                Get started today.
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-stack-lg max-w-3xl mx-auto px-margin-mobile sm:px-margin-desktop" id="faq">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline-lg text-center mb-12 text-white">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-card rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="w-full p-6 text-left flex justify-between items-center group bg-transparent border-0 cursor-pointer"
              >
                <span className="font-headline-md text-headline-md group-hover:text-primary transition-colors text-white">{faq.q}</span>
                <span className="material-symbols-outlined text-white">{openIndex === index ? "remove" : "add"}</span>
              </button>
              <div className={`px-6 pb-6 text-on-surface-variant font-body-md ${openIndex === index ? "block" : "hidden"}`}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Premium Banner */}
      <div className="fixed bottom-0 w-full z-40 bg-surface/90 border-t border-white/10 backdrop-blur-xl py-3.5 sm:py-4 px-4 sm:px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        <div className="max-w-container-max mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="font-bold text-xs sm:text-sm text-center sm:text-left text-on-surface">
            Would You Like To Increase Your Views Even Further? Get 1k Views for as low as N1000
          </p>
          <button
            onClick={() => handleSelectPlan("Better")}
            className="btn-secondary w-full sm:w-auto py-2.5 sm:py-3 px-6 sm:px-8 text-[10px] sm:text-xs rounded-full shadow-lg cursor-pointer"
          >
            TAP HERE / GO PREMIUM
          </button>
        </div>
      </div>

      {/* Message Us WhatsApp Sticky Button */}
      <a
        href="https://wa.me/2348103460237"
        className="fixed bottom-20 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-50 group"
      >
        <span className="material-symbols-outlined text-[28px]">chat</span>
        <span className="absolute right-16 bg-white text-gray-900 px-4 py-2 rounded-xl text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100 hidden sm:block">
          Message us
        </span>
      </a>

      {/* Success Modal */}
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
              className="bg-background w-full max-w-xl rounded-3xl sm:rounded-[3rem] overflow-hidden relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto border border-white/10"
            >
              <div className="bg-primary p-8 sm:p-12 text-center text-black relative">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="absolute top-6 right-6 text-black/50 hover:text-black transition-colors bg-transparent border-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined font-bold">close</span>
                </button>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
                  <span className="material-symbols-outlined text-primary text-[36px] font-bold">check_circle</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tighter mb-3 leading-tight text-black">
                  Hey! {submissionData?.name} WSV.
                </h2>
                <p className="text-black/60 font-medium uppercase tracking-[0.15em] text-[10px]">Thank you for your submission</p>
              </div>

              <div className="p-6 sm:p-10 md:p-12 space-y-6 sm:space-y-10">
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-primary/5 p-5 sm:p-8 rounded-2xl border border-primary/10 space-y-3">
                    <p className="text-primary font-bold leading-relaxed text-sm sm:text-base">
                      Please come back by <span className="text-secondary font-black">9:30 PM</span> to download your compiled VCF.
                    </p>
                    <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">
                      Everyday submission is needed for the views to work. Only download VCF for the date that you submitted your contact. That means if you submitted your contact today, download today's VCF file and repeat the step tomorrow.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      toast.success("Reminder set for 9:30 PM! Don't forget to return.");
                      if ("Notification" in window) {
                        Notification.requestPermission();
                      }
                    }}
                    className="w-full bg-secondary/10 text-secondary py-4 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-secondary hover:text-white transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    Remind Me at 9:30 PM
                  </button>
                </div>

                <div className="space-y-3">
                  {submissionData?.plan !== "Free" ? (
                    <button
                      onClick={() => {
                        const adminWhatsApp = "2348103460237";
                        const message = encodeURIComponent(
                          `Hello Admin, I just paid for the ${submissionData?.plan} plan on WSV. My name is ${submissionData?.name} and my number is ${submissionData?.phoneNumber}.`
                        );
                        window.location.href = `https://wa.me/${adminWhatsApp}?text=${message}`;
                      }}
                      className="w-full bg-emerald-500 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform text-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      Confirm Payment via WhatsApp
                    </button>
                  ) : (
                    <Link
                      to="/download-vcf"
                      className="w-full bg-primary text-black py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform text-sm text-center"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Go to Download Zone
                    </Link>
                  )}
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full text-primary/40 font-bold uppercase tracking-widest text-[10px] hover:text-primary transition-colors py-2 bg-transparent border-0 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
