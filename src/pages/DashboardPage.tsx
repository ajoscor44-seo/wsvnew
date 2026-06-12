/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Download, 
  Users, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowUpRight,
  Share2,
  Copy,
  MessageCircle,
  Zap
} from "lucide-react";

import { toast } from "sonner";

export const DashboardPage = () => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const adminWhatsApp = "2348103460237";
  const whatsappMessage = user 
    ? `Hello Admin, I want to upgrade my account to Premium. My name is ${user.name} and my number is ${user.phoneNumber}.` 
    : "Hello Admin, I would like to upgrade my account to Premium on WSV.";
  const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    const storedUser = localStorage.getItem("zar_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Referral code copied!");
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const storedUser = localStorage.getItem("zar_user");
        const phoneNumber = storedUser ? JSON.parse(storedUser).phoneNumber : "";
        const response = await fetch(`/api/status?phoneNumber=${encodeURIComponent(phoneNumber)}`);
        const data = await response.json();
        setSystemStatus(data);
      } catch (error) {
        console.error("Failed to fetch status", error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!systemStatus?.nextDrop) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(systemStatus.nextDrop).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [systemStatus]);

  const handleQuickSubmit = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: user.phoneNumber, name: user.name }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Successfully submitted for today!");
      } else {
        toast.error(data.error || "Submission failed");
      }
    } catch (error) {
      toast.error("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-16 sm:pb-20 px-margin-mobile sm:px-margin-desktop bg-surface text-on-surface relative overflow-hidden">
      {/* Background Polish */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 relative z-10">
        {/* Support Modal */}
        {isSupportOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSupportOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="glass-card p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-3xl border border-white/10 max-w-lg w-full relative z-10 shadow-2xl"
            >
              <h2 className="text-2xl sm:text-3xl font-black font-headline text-primary mb-4 sm:mb-6 tracking-tighter">Support Hub</h2>
              <p className="text-on-surface-variant mb-6 sm:mb-10 text-sm sm:text-base md:text-lg font-medium leading-relaxed">
                Need help with your account or VCF files? Our expert team is here to assist you 24/7.
              </p>
              <div className="space-y-3 sm:space-y-4">
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full bg-[#25D366] text-white py-4 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2.5 hover:scale-[1.01] transition-transform shadow-lg shadow-emerald-500/10 text-sm"
                >
                  <MessageCircle size={20} />
                  Chat on WhatsApp
                </a>
                <button 
                  onClick={() => setIsSupportOpen(false)}
                  className="w-full bg-surface-container-low text-primary/40 py-4 rounded-xl sm:rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-surface-container transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display-lg text-white tracking-tighter">Control Center</h1>
            <p className="text-sm sm:text-base md:text-lg text-on-surface-variant mt-1.5 sm:mt-2 font-medium">Welcome back, <span className="text-secondary">{user?.name || "Creator"}</span>. Your reach is expanding.</p>
          </motion.div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3 sm:gap-4 w-full lg:w-auto">
            {user && (
              <button 
                onClick={handleQuickSubmit}
                disabled={isLoading}
                className="btn-secondary px-6 py-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2.5 shadow-lg shadow-secondary/15 group w-full sm:w-auto justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Zap size={16} className="group-hover:scale-110 transition-transform" />
                )}
                <span className="font-bold uppercase tracking-widest text-[10px] sm:text-xs">Sync For Today</span>
              </button>
            )}
            <div className="bg-primary/10 border border-primary/20 text-primary px-6 py-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2.5 shadow-lg shadow-primary/5 w-full sm:w-auto justify-center">
              <div className={`w-2 h-2 ${systemStatus?.isPremium ? "bg-accent" : "bg-emerald-400"} rounded-full animate-pulse`} />
              <span className="font-bold uppercase tracking-widest text-[10px] sm:text-xs">{systemStatus?.isPremium ? "Elite Network Active" : "Basic Network Active"}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {[
            { label: "Global Sync Size", value: systemStatus?.totalUsers || "...", icon: Users, color: "bg-primary/5 text-primary" },
            { label: "Estimated Reach", value: "124.5k", icon: TrendingUp, color: "bg-secondary/5 text-secondary" },
            { label: "Network Referrals", value: systemStatus?.referralCount || "0", icon: Zap, color: "bg-accent/5 text-accent" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl flex items-center gap-6 sm:gap-8 group hover:bg-surface-container-high hover:border-white/15 transition-all duration-300 border border-white/5 shadow-sm"
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ${stat.color}`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1 sm:mb-2">{stat.label}</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-black font-headline text-primary tracking-tighter">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
            <div className="glass-card p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full -mr-24 sm:-mr-32 -mt-24 sm:-mt-32" />
              <div className="flex justify-between items-center mb-8 sm:mb-12 relative z-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-headline-lg text-white tracking-tight">Active Releases</h2>
                <Link to="/download" className="btn-primary px-4 py-2 rounded-lg text-[9px] uppercase tracking-widest flex items-center gap-1.5 font-bold">
                  Drop Zone <ArrowUpRight size={12} />
                </Link>
              </div>

              <div className="space-y-4 sm:space-y-6 relative z-10">
                {systemStatus?.latestFile ? (
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 sm:p-6 md:p-8 bg-surface-container-low rounded-xl sm:rounded-2xl border-2 border-transparent hover:border-white/10 transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-primary shadow-inner transition-all duration-300">
                        <Download size={20} />
                      </div>
                      <div>
                        <p className="text-base sm:text-lg md:text-xl font-bold font-headline text-white tracking-tighter">{systemStatus.latestFile.date}</p>
                        <p className="text-[10px] sm:text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-0.5 sm:mt-1">{systemStatus.latestFile.count} Creators • {systemStatus.latestFile.size}</p>
                      </div>
                    </div>
                    <Link 
                      to="/download"
                      className="bg-primary text-black p-3 rounded-xl hover:bg-secondary hover:scale-105 transition-all shadow-lg shadow-primary/10"
                    >
                      <Download size={18} />
                    </Link>
                  </motion.div>
                ) : (
                  <div className="text-center py-12 sm:py-16 md:py-20 bg-surface-container-low rounded-2xl sm:rounded-3xl border-4 border-dashed border-primary/5">
                    <p className="text-on-surface-variant font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-6 sm:mb-8">Waiting for next global drop...</p>
                    <div className="flex flex-wrap justify-center gap-4 px-4">
                      <button 
                        onClick={async () => {
                          const res = await fetch("/api/admin/seed", { method: "POST" });
                          const data = await res.json();
                          if (res.ok) toast.success(data.message);
                          else toast.error(data.error);
                        }}
                        className="text-[9px] font-bold text-secondary uppercase tracking-widest hover:underline bg-secondary/5 px-4 sm:px-6 py-2.5 rounded-full"
                      >
                        [Admin] Seed Network
                      </button>
                      <button 
                        onClick={async () => {
                          const res = await fetch("/api/admin/generate-vcf", { method: "POST" });
                          const data = await res.json();
                          if (res.ok) toast.success(data.message);
                          else toast.error(data.error);
                        }}
                        className="text-[9px] font-bold text-primary uppercase tracking-widest hover:underline bg-primary/5 px-4 sm:px-6 py-2.5 rounded-full"
                      >
                        [Admin] Trigger Sync
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Refer & Grow */}
            <div className="bg-primary/5 p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-3xl border border-primary/20 ambient-glow text-white relative overflow-hidden shadow-xl shadow-primary/5">
              <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/10 rounded-full blur-[80px] sm:blur-[100px] -mr-32 sm:-mr-48 -mb-32 sm:-mb-48 pointer-events-none" />
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-10 relative z-10">
                <div className="space-y-2 text-center md:text-left">
                  <h2 className="text-xl sm:text-2xl font-black font-headline flex items-center justify-center md:justify-start gap-2.5">
                    <Share2 className="text-accent" size={20} />
                    Elite Referral Engine
                  </h2>
                  <p className="text-white/60 text-sm sm:text-base font-medium max-w-md leading-relaxed">
                    Refer 5 creators to unlock <span className="text-white font-bold">7 Days of Elite Sync</span>. Automate your growth today.
                  </p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 w-full md:w-auto justify-between md:justify-start">
                  <code className="px-4 font-mono font-bold text-white text-lg sm:text-xl tracking-widest">{user?.referralCode || "WSV-SYNC"}</code>
                  <button 
                    onClick={() => handleCopy(user?.referralCode || "WSV-SYNC")}
                    className="p-3 bg-accent text-white rounded-lg hover:scale-105 transition-transform shadow-lg shadow-accent/25 shrink-0"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 md:space-y-12">
            <div className="glass-card p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl">
              <h3 className="text-lg sm:text-xl font-headline-md text-white mb-6 sm:mb-8 tracking-tight">Sync Health</h3>
              <div className="space-y-4 sm:space-y-6">
                {[
                  { label: "Sync Engine", status: "Active", color: "bg-emerald-500", text: "text-emerald-500" },
                  { label: "VCF Terminal", status: "Optimal", color: "bg-emerald-500", text: "text-emerald-500" },
                  { label: "Next Drop", status: timeLeft || "...", color: "bg-secondary", text: "text-secondary", icon: <Clock size={12} /> }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 ${item.color} rounded-full animate-pulse`} />
                      <span className="font-bold text-primary/60 uppercase tracking-widest text-[9px] sm:text-[10px]">{item.label}</span>
                    </div>
                    <span className={`font-bold uppercase tracking-widest flex items-center gap-1.5 text-[9px] sm:text-[10px] ${item.text}`}>
                      {item.icon} {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Feed */}
            <div className="glass-card p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl">
              <h3 className="text-lg sm:text-xl font-headline-md text-white mb-6 sm:mb-8 tracking-tight">Live Network</h3>
              <div className="space-y-4 sm:space-y-6">
                {[
                  { user: "Tunde.eth", action: "Elite Sync Active", time: "2m ago" },
                  { user: "ZAR Media", action: "VCF Downloaded", time: "5m ago" },
                  { user: "Creative.Jo", action: "New Referral", time: "12m ago" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start group text-xs sm:text-sm">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center font-bold text-primary border border-primary/5 group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
                      {item.user[0]}
                    </div>
                    <div className="flex-1 border-b border-primary/5 pb-4 last:border-0 group-hover:translate-x-0.5 transition-transform min-w-0">
                      <p className="text-primary font-bold truncate">
                        {item.user} <span className="text-on-surface-variant/55 font-medium">{item.action}</span>
                      </p>
                      <p className="text-[8px] sm:text-[9px] text-secondary font-bold uppercase tracking-widest mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-accent p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl text-white relative overflow-hidden shadow-xl shadow-accent/15">
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 pointer-events-none" />
              <h3 className="text-xl sm:text-2xl font-black font-headline mb-3 sm:mb-4 tracking-tighter relative z-10">Scale Faster?</h3>
              <p className="text-white/70 text-sm sm:text-base font-medium mb-6 sm:mb-8 relative z-10 leading-relaxed">
                Unlock 15,000+ daily views and dedicated sync support.
              </p>
              <button 
                onClick={() => setIsSupportOpen(true)}
                className="w-full bg-primary text-black py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all relative z-10 shadow-lg text-center shadow-primary/10"
              >
                Go Elite Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

