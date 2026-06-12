/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { 
  Download, 
  FileText, 
  Clock, 
  Users, 
  Search,
  ChevronDown,
  MessageCircle,
  AlertTriangle,
  Mail,
  Sparkles,
  ExternalLink,
  TrendingUp,
  Zap,
  ArrowRight,
  Globe,
  Lock
} from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Link } from "react-router-dom";

export const DownloadPage = () => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlert, setShowAlert] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("");

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
  }, []);

  useEffect(() => {
    if (!systemStatus?.nextDrop) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(systemStatus.nextDrop) - +new Date();
      if (difference <= 0) {
        setTimeLeft("00:00:00");
        // Trigger a reload of system status to get the unlocked file
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
        return false;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const parts = [
        String(hours).padStart(2, "0"),
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0")
      ];
      setTimeLeft(parts.join(":"));
      return true;
    };

    calculateTimeLeft();
    const timer = setInterval(() => {
      const active = calculateTimeLeft();
      if (!active) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [systemStatus?.nextDrop]);

  const allFiles = systemStatus ? [
    ...(systemStatus.latestFile ? [systemStatus.latestFile] : []),
    ...(systemStatus.olderFiles || [])
  ] : [];

  const nextDropDate = systemStatus?.nextDropDate;
  const isNextDropReleased = nextDropDate && allFiles.some(f => f.date === nextDropDate);

  const displayFiles = [...allFiles];
  if (systemStatus && nextDropDate && !isNextDropReleased) {
    displayFiles.unshift({
      id: "upcoming-drop",
      name: `contacts-${nextDropDate}.vcf`,
      date: nextDropDate,
      count: systemStatus.totalUsers || 0,
      size: "Compiling...",
      url: "#",
      isLocked: true
    });
  }

  const filteredFiles = displayFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface text-on-surface">

      <main className="max-w-5xl mx-auto px-margin-mobile sm:px-margin-desktop pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 relative">
        <Breadcrumbs items={[{ label: "Download Zone" }]} />
        {/* Dynamic Background */}
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/5 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />

        {/* Hero Title */}
        <section className="text-center mb-12 sm:mb-20 md:mb-24 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-[100px] sm:blur-[120px] rounded-full -z-10" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/5 border border-white/10 shadow-lg shadow-white/5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-8 sm:mb-12 text-primary"
          >
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
            </span>
            System Live: Daily Sync Terminal
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display-lg text-white tracking-tighter leading-[1.1] mb-8 sm:mb-12">
            Secure Your <br/> <span className="text-gradient">Daily VCF Download</span>
          </h1>
          
          <div className="max-w-4xl mx-auto glass-card p-6 sm:p-8 md:p-12 card-radius-lg text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full -mr-24 sm:-mr-32 -mt-24 sm:-mt-32 group-hover:scale-110 transition-transform duration-700" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 relative z-10">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-headline-md text-white flex items-center gap-2 sm:gap-3">
                  <Clock size={20} className="text-secondary shrink-0" />
                  Terminal Schedule
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-on-surface-variant font-medium leading-relaxed">
                  Daily VCF Downloads are compiled and released every night at <span className="text-primary font-bold px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/5 rounded-lg text-xs sm:text-sm">21:30 WAT</span>. 
                </p>
                <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-primary/30 uppercase tracking-widest">
                  <Globe size={12} /> Global Sync Protocols Active
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6 border-t md:border-t-0 md:border-l border-primary/5 pt-6 md:pt-0 md:pl-8 lg:pl-12">
                <h3 className="text-lg sm:text-xl md:text-2xl font-black font-headline text-primary flex items-center gap-2 sm:gap-3">
                  <Zap size={20} className="text-accent shrink-0" />
                  Operator Guide
                </h3>
                <ul className="space-y-3 sm:space-y-4">
                  {[
                    "Daily submission is required for reach.",
                    "Only download your submitted date.",
                    "Merge duplicates to avoid lag."
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-on-surface-variant">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 sm:mt-2 shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Alert Zone */}
        {showAlert && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-accent/10 border border-accent/20 p-5 sm:p-6 md:p-8 mb-6 sm:mb-10 relative rounded-2xl sm:rounded-[2rem] overflow-hidden group"
          >
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <button 
              onClick={() => setShowAlert(false)}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 text-accent hover:scale-125 transition-transform"
            >
              <Users size={16} />
            </button>
            <div className="flex gap-4 sm:gap-6 relative z-10">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-accent text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md shadow-accent/20 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="font-bold text-accent mb-1 sm:mb-2 uppercase tracking-widest text-[10px]">Critical Performance Tip</h4>
                <p className="text-primary/70 text-xs sm:text-sm md:text-base font-bold leading-relaxed">
                  Avoid phone lag by merging duplicate contacts. Learn the pro method 
                  <a href="#" className="text-accent underline ml-1 sm:ml-2 hover:text-accent-variant transition-colors">here</a>.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Terminal */}
        <section className="bg-surface rounded-2xl sm:rounded-3xl md:rounded-[3rem] shadow-xl shadow-primary/5 overflow-hidden border border-primary/5">
          <div className="bg-surface-container-high p-5 sm:p-6 md:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border-b border-white/5">
            <h2 className="font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs flex items-center gap-2 sm:gap-3">
              <Download size={16} className="text-primary" />
              Available VCF Downloads
            </h2>
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
              {filteredFiles.length} Releases Found
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-10">
            {/* Search Hub */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div className="relative flex-1">
                <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by date or keyword..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 sm:pl-16 pr-4 sm:pr-8 py-4 sm:py-5 bg-surface-container-low border-2 border-transparent rounded-xl sm:rounded-2xl focus:border-primary focus:bg-surface-container-high transition-all outline-none font-bold text-sm sm:text-base text-on-surface placeholder:text-on-surface/20 shadow-inner"
                />
              </div>
              <button className="px-6 sm:px-8 py-4 sm:py-5 bg-surface-container-low rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 text-[10px] font-bold text-primary/40 uppercase tracking-widest hover:bg-surface-container transition-colors">
                Date <ChevronDown size={14} />
              </button>
            </div>

            {/* Release List */}
            <div className="space-y-3 sm:space-y-4">
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file: any) => (
                  <motion.div 
                    key={file.id} 
                    whileHover={file.isLocked ? {} : { scale: 1.01 }}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl transition-all shadow-sm ${
                      file.isLocked 
                        ? "bg-surface-container-low/40 border-2 border-dashed border-white/10 opacity-80"
                        : "bg-surface-container-low hover:bg-surface-container-high border-2 border-transparent hover:border-white/10 hover:shadow-lg group"
                    }`}
                  >
                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm border border-white/10 shrink-0 ${
                        file.isLocked 
                          ? "text-accent" 
                          : "text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500"
                      }`}>
                        {file.isLocked ? <Lock size={22} className="text-accent animate-pulse" /> : <FileText size={22} />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold font-headline text-white group-hover:text-primary transition-colors text-base sm:text-lg md:text-xl tracking-tighter truncate">
                          {file.name.replace(".vcf", "").toUpperCase()}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1.5">
                          <span className="text-[9px] sm:text-[10px] font-bold text-primary/30 uppercase tracking-widest">
                            {file.isLocked ? "Type: Sync In Progress" : "Type: VCF Terminal"}
                          </span>
                          <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${
                            file.isLocked 
                              ? "text-accent bg-accent/5" 
                              : "text-secondary bg-secondary/5"
                          }`}>
                            {file.isLocked ? "Release at 9:30 PM WAT" : (file.size || "1.2 MB")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {file.isLocked ? (
                      <div className="w-full sm:w-auto bg-white/5 border border-white/10 text-on-surface-variant/45 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 sm:gap-3 cursor-not-allowed">
                        <Lock size={14} className="text-accent shrink-0" />
                        Locked ({timeLeft || "00:00:00"})
                      </div>
                    ) : (
                      <a 
                        href={file.url} 
                        download 
                        className="w-full sm:w-auto bg-primary text-black px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-[0.15em] hover:bg-secondary hover:scale-105 transition-all shadow-lg shadow-primary/15 flex items-center justify-center gap-2 sm:gap-3"
                      >
                        <Download size={14} />
                        Download
                      </a>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16 sm:py-20 bg-surface-container-low rounded-2xl sm:rounded-3xl">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-on-surface/10 shadow-inner">
                    <Search size={32} />
                  </div>
                  <p className="text-primary/30 font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs">Zero Releases Found</p>
                </div>
              )}
            </div>

            {/* Resubmit CTA Section */}
            <div className="mt-12 sm:mt-20 md:mt-24 p-6 sm:p-8 md:p-12 glass-card rounded-2xl sm:rounded-3xl border border-primary/20 ambient-glow text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/10 rounded-full blur-[80px] sm:blur-[100px] -mr-32 sm:-mr-48 -mt-32 sm:-mt-48 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10 space-y-6 sm:space-y-8 md:space-y-10 max-w-2xl">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl flex items-center justify-center">
                  <Zap size={28} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-headline-lg leading-tight tracking-tighter mb-3 sm:mb-4">
                    Don't Break The Streak!
                  </h2>
                  <p className="text-sm sm:text-base md:text-xl text-white/60 font-medium">
                    To keep your status views growing, you need to submit your contact <span className="text-accent font-bold">EVERY DAY</span>. Submit now for tomorrow's 9:30 PM drop.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2 sm:pt-4">
                  <Link to="/#join" className="btn-secondary px-8 sm:px-12 py-4 sm:py-5 rounded-2xl inline-flex items-center justify-center gap-3 text-sm sm:text-base">
                    Submit For Tomorrow
                    <ArrowRight size={20} />
                  </Link>
                  <Link to="/blog" className="px-8 sm:px-12 py-4 sm:py-5 rounded-2xl border-2 border-white/20 hover:bg-white/10 transition-all text-sm sm:text-base font-bold text-center">
                    Growth Strategies
                  </Link>
                </div>
              </div>
              <div className="absolute bottom-8 sm:bottom-12 right-8 sm:right-12 opacity-5 hidden lg:block">
                <TrendingUp size={250} />
              </div>
            </div>
          </div>
        </section>

        {/* Global Support */}
        <section className="mt-20 sm:mt-32 md:mt-40 text-center space-y-6 sm:space-y-10 py-12 sm:py-16 md:py-20 border-t border-primary/5">
          <p className="text-[9px] sm:text-xs font-bold text-primary/20 uppercase tracking-[0.3em] sm:tracking-[0.5em]">
            Brand Partnerships & Sponsorships
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-8 sm:gap-10">
            <a href="mailto:faqwithjoscor@gmail.com" className="group">
              <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1 sm:mb-2 group-hover:translate-x-1 transition-transform">Email Support</div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary flex items-center justify-center gap-2 sm:gap-3">
                <Mail size={20} className="text-primary/20" />
                <span className="truncate">faqwithjoscor@gmail.com</span>
              </div>
            </a>
            <a href="https://wa.me/2348103460237" className="group">
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1 sm:mb-2 group-hover:translate-x-1 transition-transform">WhatsApp Direct</div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary flex items-center justify-center gap-2 sm:gap-3">
                <MessageCircle size={20} className="text-primary/20" />
                +234 810 346 0237
              </div>
            </a>
          </div>
        </section>
      </main>


      {/* Persistent CTA Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-10 z-[60] border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
          <p className="text-xs sm:text-sm font-bold text-center sm:text-left text-on-surface">
            Scale your reach to <span className="text-accent">15,000+ targeted views</span> today. 
            <span className="block sm:inline sm:ml-2 text-on-surface-variant">Starting from only ₦1,000.</span>
          </p>
          <a href="/#join" className="btn-secondary w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-secondary/30">
            Upgrade To Premium
          </a>
        </div>
      </motion.div>
    </div>
  );
};
