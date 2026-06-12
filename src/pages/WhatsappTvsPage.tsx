/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";
import { 
  Tv, 
  Search, 
  ArrowRight, 
  MessageCircle, 
  Globe, 
  MapPin, 
  Mail, 
  PlusCircle,
  TrendingUp,
  Star,
  CheckCircle2,
  X
} from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Link } from "react-router-dom";

const TV_DATA = [
  { name: "Bamtheblogger", desc: "WhatsApp TV Bamtheblogger", category: "Entertaiment", link: "https://wa.me/2348148452738", number: "+2348148452738", email: "bamtheblogger@gmail.com", website: "https://wa.me/2348148452738" },
  { name: "Pot TV", desc: "WhatsApp TV Pot TV", category: "General", link: "https://wa.me/08182542750", number: "08182542750", email: "thepottvmedia@gmail.com", website: "pottvmedia.com", address: "3, Ayoola Drive, New Bodija, Ibadan." },
  { name: "IGTWEETTV Penthouse", desc: "WhatsApp TV IGTWEETTV Penthouse", category: "Entertaiment, General", link: "https://wa.me/08153404657", number: "08153404657", email: "theigtweettvmedia@gmail.com" },
  { name: "Jorra Media", desc: "WhatsApp TV Jorra Media", category: "Entertaiment", link: "https://wa.me/2347032608355", number: "+2347032608355", email: "jorramedia@gmail.com", website: "jorramedia.com" },
  { name: "Sunny TV", desc: "WhatsApp TV Sunny TV", category: "Sponsored", link: "https://wa.me/2349067855214", number: "+2349067855214", email: "asiegbuboniface142@gmail.com" },
  { name: "Freshzz TV", desc: "WhatsApp TV Freshzz TV", category: "General", link: "https://wa.me/23408169922719", number: "+23408169922719", email: "freshzzupdates@gmail.com", website: "Join Freshzz TV here" },
  { name: "Bigjoe🇳🇬📈💙", desc: "WhatsApp TV Bigjoe🇳🇬📈💙", category: "Sponsored", link: "https://wa.me/09051908486", number: "09051908486", email: "oloronduoziomajoseph@gmail.com" },
  { name: "CHINIX GRAPHICS", desc: "WhatsApp TV CHINIX GRAPHICS", category: "General", link: "https://wa.me/2348141853557", number: "+234 814 185 3557", email: "chinonsochinix@gmail.com" },
  { name: "OLA TV", desc: "WhatsApp TV OLA TV", category: "General", link: "https://wa.me/2349041861438", number: "+2349041861438", email: "olatv016@gmail.com" },
  { name: "WAPNAIJATV", desc: "WhatsApp TV WAPNAIJATV", category: "Entertaiment, General", link: "https://wa.me/07033862349", number: "07033862349", email: "Chukwuebukavalentine36@gmail.com" },
  { name: "Expensive TV", desc: "WhatsApp TV Expensive TV", category: "Entertaiment", link: "https://wa.me/23409163280635", number: "+23409163280635", email: "Kennygeeog@gmail.com" }
];

export const WhatsappTvsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicTvs, setDynamicTvs] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    tvName: "",
    desc: "",
    category: "Entertainment",
    phoneNumber: "",
  });

  const categories = ["All", "Entertainment", "General", "Sponsored"];

  // Fetch dynamic TVs from the backend database
  const fetchTvs = async () => {
    try {
      const res = await fetch("/api/tvs");
      if (res.ok) {
        const data = await res.json();
        setDynamicTvs(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch dynamic TVs:", err);
    }
  };

  React.useEffect(() => {
    fetchTvs();
  }, []);

  const handleAddTvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tvName || !formData.desc || !formData.phoneNumber) {
      toast.error("Please fill in all fields");
      return;
    }

    const cleanPhone = formData.phoneNumber.replace(/\D/g, "");
    if (!cleanPhone) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const paymentRef = `wsvtv_${cleanPhone}_${Date.now()}`;
    const amount = 1000;
    const customerEmail = `${cleanPhone}@wsv.com.ng`;

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
          name: formData.tvName,
          email: customerEmail,
        },
        notification_url: window.location.origin + "/api/korapay/webhook",
        onClose: () => {
          setIsLoading(false);
          toast.error("Payment modal closed");
        },
        onSuccess: async (data: any) => {
          toast.success("Payment completed successfully! Syncing directory...");
          try {
            const response = await fetch("/api/tvs/submit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tvName: formData.tvName,
                desc: formData.desc,
                category: formData.category,
                phoneNumber: formData.phoneNumber,
                paymentReference: paymentRef
              })
            });

            if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              console.error("TV listing submit failed on backend:", errData);
              toast.warning("Listing stored locally on device. Syncing to Admin via WhatsApp.");
            } else {
              toast.success("TV Listing sync complete!");
              fetchTvs(); // Refresh listings on UI
            }
          } catch (err: any) {
            console.error("Failed to submit TV data:", err);
            toast.warning("Network issue. Proceeding to WhatsApp to complete listing.");
          } finally {
            setIsLoading(false);
            setShowAddModal(false);
            
            // Redirect to WhatsApp with TV info and payment details
            const encodedText = encodeURIComponent(
              `Hello Admin,\n\nI have completed payment (₦1,000) to get my WhatsApp TV listed on WSV.\n\nTV Name: ${formData.tvName}\nDescription: ${formData.desc}\nCategory: ${formData.category}\nWhatsApp Number: ${formData.phoneNumber}\nPayment Ref: ${paymentRef}\n\nPlease verify and add my TV to the directory.`
            );
            window.location.href = `https://wa.me/2348103460237?text=${encodedText}`;
          }
        }
      });
    } catch (err: any) {
      console.error("Korapay initialize error:", err);
      toast.error("Could not launch payment gateway");
      setIsLoading(false);
    }
  };

  // Merge dynamic TVs with static TV_DATA
  const formattedDynamicTvs = dynamicTvs.map(tv => ({
    name: tv.name,
    desc: tv.description,
    category: tv.category,
    link: tv.link || `https://wa.me/${tv.phone_number.replace(/\D/g, "")}`,
    number: tv.phone_number,
    email: tv.email || "",
    website: tv.website || "",
    address: tv.address || ""
  }));

  const combinedTvs = [
    ...formattedDynamicTvs,
    ...TV_DATA.filter(staticTv => 
      !formattedDynamicTvs.some(dynTv => dynTv.name.toLowerCase() === staticTv.name.toLowerCase())
    )
  ];

  const filteredTvs = combinedTvs.filter(tv => {
    const matchesSearch = tv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tv.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || tv.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-surface pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 px-margin-mobile sm:px-margin-desktop relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/5 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <Breadcrumbs items={[{ label: "TV Directory" }]} />
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 bg-primary/5 text-primary rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-6 sm:mb-10"
          >
            <Tv size={12} />
            Nigeria's #1 TV Directory
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display-lg text-white tracking-tighter leading-none mb-5 sm:mb-8 px-2">
            Discover The Best <br/> <span className="text-gradient">WhatsApp TVs In Nigeria</span>
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-on-surface-variant max-w-3xl mx-auto font-medium leading-relaxed px-2">
            Explore our curated directory featuring the most engaging and influential WhatsApp TVs. 
            From entertainment to business, find the ultimate platforms to follow.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-8 sm:mt-12">
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-primary w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-primary/15 cursor-pointer"
            >
              <PlusCircle size={18} />
              Add Your TV
            </button>
            <button className="bg-surface-container-high border border-white/10 w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-on-surface hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm uppercase tracking-widest shadow-lg">
              <TrendingUp size={18} />
              View Top TVs
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-20 md:mb-24">
          {[
            { label: "Listed TVs", value: "250+", icon: Tv, color: "bg-primary/5 text-primary" },
            { label: "Daily Impressions", value: "1.2M", icon: TrendingUp, color: "bg-secondary/5 text-secondary" },
            { label: "Verified Channels", value: "100%", icon: CheckCircle2, color: "bg-accent/5 text-accent" }
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 sm:p-8 md:p-10 card-radius flex items-center gap-5 sm:gap-8 group hover:bg-surface-container-high transition-all duration-300 border border-white/5">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ${stat.color} shrink-0`}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{stat.label}</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-black font-headline text-primary">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="mb-10 sm:mb-16 space-y-4 sm:space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-primary/30" size={20} />
              <input 
                type="text" 
                placeholder="Search TVs by name or category..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 sm:pl-16 pr-4 sm:pr-8 py-4 sm:py-5 md:py-6 bg-surface-container-low border-2 border-transparent rounded-xl sm:rounded-2xl focus:border-primary focus:bg-surface-container-high transition-all outline-none font-bold text-sm sm:text-base md:text-lg text-on-surface shadow-inner"
              />
            </div>
            <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
                    selectedCategory === cat 
                    ? "bg-primary text-black shadow-lg shadow-primary/15" 
                    : "bg-surface-container-low text-primary/40 hover:bg-surface-container"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {filteredTvs.map((tv, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              viewport={{ once: true }}
              className="glass-card p-6 sm:p-8 md:p-10 card-radius group hover:bg-surface-container-high transition-all duration-300 border border-white/5 hover:shadow-xl hover:shadow-primary/15"
            >
              <div className="flex justify-between items-start mb-5 sm:mb-8">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-primary/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary text-xl sm:text-2xl md:text-3xl font-black transition-all duration-300 shadow-inner shrink-0">
                  {tv.name[0]}
                </div>
                <div className="bg-secondary/10 text-secondary px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-colors">
                  {tv.category}
                </div>
              </div>

              <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-headline text-white mb-2 tracking-tighter leading-none">{tv.name}</h3>
              <p className="text-on-surface-variant mb-5 sm:mb-8 font-medium transition-colors text-xs sm:text-sm">{tv.desc}</p>

              <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-6 sm:mb-8 md:mb-10">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-primary/50 group-hover:text-white/40 transition-colors">
                  <MessageCircle size={14} className="shrink-0" />
                  <span className="truncate">{tv.number}</span>
                </div>
                {tv.email && (
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-primary/50 group-hover:text-white/40 transition-colors">
                    <Mail size={14} className="shrink-0" />
                    <span className="truncate">{tv.email}</span>
                  </div>
                )}
                {tv.address && (
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-primary/50 group-hover:text-white/40 transition-colors">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{tv.address}</span>
                  </div>
                )}
              </div>

              <a 
                href={tv.link} 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-primary text-black py-3.5 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-secondary hover:scale-[1.02] transition-all"
              >
                Join Channel
                <ArrowRight size={14} />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Featured Ad Section */}
        <section className="mt-16 sm:mt-24 md:mt-32 p-6 sm:p-10 md:p-16 lg:p-20 glass-card border border-primary/20 ambient-glow card-radius-lg text-white relative overflow-hidden shadow-xl shadow-primary/5">
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/10 rounded-full blur-[80px] sm:blur-[120px] -mr-32 sm:-mr-48 -mt-32 sm:-mt-48" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div className="space-y-5 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 bg-white/10 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">
                <Star size={12} className="text-accent fill-accent" />
                Featured Listing
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-headline-lg tracking-tighter leading-none">
                Get Your TV <br/> <span className="text-accent">Verified & Listed</span>
              </h2>
              <p className="text-white/50 text-sm sm:text-base md:text-xl font-medium leading-relaxed">
                Reach over 2 million creators in Nigeria. Add your TV for only ₦1,000 and get featured at the top of our directory.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2 sm:pt-4">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-accent text-black w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg shadow-xl shadow-accent/30 hover:scale-105 transition-transform flex items-center justify-center gap-3 sm:gap-4 cursor-pointer"
                >
                  Feature My TV
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="glass-card-dark p-8 sm:p-10 card-radius border border-white/10 bg-white/5">
                <div className="space-y-6 sm:space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-lg sm:rounded-xl flex items-center justify-center text-on-surface font-bold text-sm border border-white/10">AD</div>
                      <div>
                        <p className="font-bold text-sm">Sponsored Spot</p>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Available Now</p>
                      </div>
                    </div>
                    <div className="bg-accent/20 text-accent px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">₦1,000 / Mo</div>
                  </div>
                  <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: "0%" }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 3 }}
                      className="h-full bg-accent"
                    />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white/40 leading-relaxed italic">
                    "Since being listed on WSV, our engagement has tripled. The verification badge adds so much trust."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Add TV Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isLoading) setShowAddModal(false); }}
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
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <span className="text-primary font-bold uppercase tracking-[0.2em] text-[10px]">TV Directory Listing</span>
                <h2 className="text-2xl sm:text-3xl font-black font-headline tracking-tighter text-white mt-1">
                  Add Your WhatsApp TV
                </h2>
                <p className="text-on-surface-variant text-xs sm:text-sm font-semibold mt-1">
                  Get listed and verified in Nigeria's #1 directory for ₦1,000.
                </p>
              </div>

              <form onSubmit={handleAddTvSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/60 ml-1">TV Name</label>
                  <input
                    required
                    disabled={isLoading}
                    value={formData.tvName}
                    onChange={(e) => setFormData({ ...formData, tvName: e.target.value })}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl py-3.5 px-4 focus:border-primary/10 focus:bg-surface-container-high transition-all text-sm outline-none font-bold text-on-surface placeholder:text-on-surface/20 shadow-inner disabled:opacity-50"
                    placeholder="E.g. Bamtheblogger"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/60 ml-1">Short Description</label>
                  <input
                    required
                    disabled={isLoading}
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl py-3.5 px-4 focus:border-primary/10 focus:bg-surface-container-high transition-all text-sm outline-none font-bold text-on-surface placeholder:text-on-surface/20 shadow-inner disabled:opacity-50"
                    placeholder="E.g. Entertainment and lifestyle updates"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/60 ml-1">Category</label>
                    <select
                      required
                      disabled={isLoading}
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-xl py-3.5 px-3 focus:border-primary/10 focus:bg-surface-container-high transition-all text-xs outline-none font-bold text-on-surface shadow-inner disabled:opacity-50"
                    >
                      <option value="Entertainment" className="bg-surface text-on-surface">Entertainment</option>
                      <option value="General" className="bg-surface text-on-surface">General</option>
                      <option value="Sponsored" className="bg-surface text-on-surface">Sponsored</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/60 ml-1">WhatsApp Number</label>
                    <input
                      required
                      type="tel"
                      disabled={isLoading}
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl py-3.5 px-4 focus:border-primary/10 focus:bg-surface-container-high transition-all text-sm outline-none font-bold text-on-surface placeholder:text-on-surface/20 shadow-inner disabled:opacity-50"
                      placeholder="e.g. 08123456789"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setShowAddModal(false)}
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
                        Pay ₦1,000
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
