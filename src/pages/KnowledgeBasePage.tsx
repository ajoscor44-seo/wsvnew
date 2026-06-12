/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";
import { 
  BookOpen, 
  Search, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight, 
  Settings, 
  Layers, 
  Users, 
  Info,
  ArrowRight
} from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";

interface KBArticle {
  id: string;
  category: string;
  q: string;
  a: string;
}

export const KnowledgeBasePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { name: "Getting Started", icon: BookOpen, desc: "Basics of WSV and setting up your network.", color: "text-primary bg-primary/10 border-primary/20" },
    { name: "Troubleshooting", icon: Settings, desc: "Resolve view sync, device lag, and import errors.", color: "text-accent bg-accent/10 border-accent/20" },
    { name: "Premium Sync", icon: Layers, desc: "Understand sync rates, Korapay, and priority queues.", color: "text-secondary bg-secondary/10 border-secondary/20" },
    { name: "Referrals & Rewards", icon: Users, desc: "Earn premium days by sharing your referral code.", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  ];

  const articles: KBArticle[] = [
    {
      id: "gs-1",
      category: "Getting Started",
      q: "What is WSV and how does it increase views?",
      a: "WhatsApp Status Views (WSV) is a community-driven contact exchange system. Users submit their names and numbers, which are merged into downloadable VCF files daily. By importing this VCF, all participants save each other's contacts simultaneously, allowing mutual status views to grow organically."
    },
    {
      id: "gs-2",
      category: "Getting Started",
      q: "How do I join the synchronization queue?",
      a: "Go to the homepage, fill out the display form with your WhatsApp name, select your gender/country, select a sync plan (Free or Premium), and submit. Your profile is instantly registered for the next daily synchronization window."
    },
    {
      id: "gs-3",
      category: "Getting Started",
      q: "What is a VCF file and how do I import it?",
      a: "A VCF (Virtual Contact File) contains contact cards. To import, download the file from the Download Zone, tap it on your mobile device, select 'Contacts' or 'Google Contacts', and save. All contacts will be automatically added to your contact list."
    },
    {
      id: "ts-1",
      category: "Troubleshooting",
      q: "Why are my WhatsApp Status views not increasing yet?",
      a: "This happens for three reasons: 1. You haven't imported the daily VCF file. 2. The users in the file have not imported the file yet (it can take up to 24 hours for everyone to import). 3. You did not submit your details for that specific drop day. Remember, you must participate and download the VCF on the days you submit."
    },
    {
      id: "ts-2",
      category: "Troubleshooting",
      q: "How can I merge duplicate contacts to prevent phone lag?",
      a: "On Android, open Google Contacts -> Fix & manage -> Merge & fix -> Merge duplicates. On iPhone, open Contacts, scroll to the top, tap 'Duplicates Found', and select 'Merge All'. This consolidates contacts and prevents device lag."
    },
    {
      id: "ts-3",
      category: "Troubleshooting",
      q: "Why does the contact file say 'Locked'?",
      a: "VCF files compile and release at exactly 9:30 PM WAT daily. Before 9:30 PM, the file for the current day is locked while submissions are active. The page features a countdown timer displaying the time left until the file is unlocked."
    },
    {
      id: "pr-1",
      category: "Premium Sync",
      q: "What is the difference between Free and Premium Sync?",
      a: "Free sync provides basic entry into the queue. Premium plans (Good, Better, Best) prioritize your contact entry, assign custom premium labels to stand out, and provide larger contact distributions (up to 10,000+ views), ensuring high visibility."
    },
    {
      id: "pr-2",
      category: "Premium Sync",
      q: "How is my payment verified?",
      a: "WSV integrates with Korapay for secure payments. After completing your payment, the system automatically checks your transaction reference. If you select a premium plan, you will also see a button in the success modal to message our WhatsApp support for manual confirmation."
    },
    {
      id: "rf-1",
      category: "Referrals & Rewards",
      q: "How does the referral system work?",
      a: "Upon submission, you receive a unique referral code. Share this code with friends. When 5 people register using your referral code, you automatically get rewarded with 7 free days of Premium Sync access!"
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? article.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const toggleAccordion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <main className="max-w-5xl mx-auto px-margin-mobile sm:px-margin-desktop pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 relative">
        <Breadcrumbs items={[{ label: "Knowledge Base" }]} />
        
        {/* Ambient Lights */}
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Page Header */}
        <section className="text-center mb-6 sm:mb-10 relative">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display-lg text-white tracking-tighter mb-4 leading-tight">
            Help & <span className="text-gradient">Knowledge Base</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl mx-auto font-body-md leading-relaxed">
            Find quick answers, setup guides, and troubleshooting steps to maximize your WhatsApp status views and growth reach.
          </p>
        </section>

        {/* Search Hub */}
        <section className="max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="relative">
            <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-primary/30" size={20} />
            <input 
              type="text" 
              placeholder="Search help articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 sm:pl-16 pr-4 sm:pr-8 py-4 sm:py-5 bg-surface-container-low border-2 border-transparent rounded-xl sm:rounded-2xl focus:border-primary focus:bg-surface-container-high transition-all outline-none font-bold text-sm sm:text-base text-on-surface placeholder:text-on-surface/20 shadow-inner"
            />
          </div>
        </section>

        {/* Categories Hub */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 sm:mb-10">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={idx}
                onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                className={`glass-card p-6 rounded-2xl border text-left hover:bg-surface-container transition-all group flex flex-col justify-between items-start gap-4 cursor-pointer w-full ${
                  isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-white/5"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${cat.color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-white font-headline text-base mb-1 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </section>

        {/* Articles Accordion */}
        <section className="glass-card rounded-3xl border border-white/5 overflow-hidden">
          <div className="bg-surface-container-high p-5 sm:p-6 md:p-8 text-white border-b border-white/5 flex items-center justify-between">
            <h2 className="font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs flex items-center gap-2">
              <HelpCircle size={16} className="text-primary" />
              Frequently Asked Questions
            </h2>
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full text-primary hover:bg-primary hover:text-black transition-all cursor-pointer"
              >
                Clear Filter: {selectedCategory}
              </button>
            )}
          </div>

          <div className="p-4 sm:p-6 md:p-8 space-y-4">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => {
                const isOpen = openIndex === article.id;
                return (
                  <div key={article.id} className="border-b border-white/5 last:border-b-0 pb-2 last:pb-0">
                    <button
                      onClick={() => toggleAccordion(article.id)}
                      className="w-full text-left py-4 flex items-center justify-between gap-4 group cursor-pointer bg-transparent border-0"
                    >
                      <span className="font-bold font-headline text-white group-hover:text-primary transition-colors text-base sm:text-lg">
                        {article.q}
                      </span>
                      <span className="text-on-surface-variant/40 group-hover:text-primary transition-colors shrink-0">
                        {isOpen ? <ChevronDown size={20} className="rotate-180 transition-transform" /> : <ChevronRight size={20} />}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed pl-1 pb-4">
                            {article.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-on-surface-variant text-sm font-semibold">
                  No help articles found matching your query.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Support Sticky Card */}
        <section className="mt-12 sm:mt-16 p-6 sm:p-8 md:p-12 glass-card rounded-3xl border border-primary/10 ambient-glow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 space-y-6 max-w-xl">
            <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary">
              <Info size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-headline text-white mb-2">
                Still Need Assistance?
              </h2>
              <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
                If you have queries regarding payment billing, enterprise sponsorship, or specific sync questions, reach our operators directly on WhatsApp.
              </p>
            </div>
            <div>
              <a 
                href="https://wa.me/2348103460237"
                className="bg-primary text-black px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest inline-flex items-center gap-2 hover:scale-105 transition-transform"
              >
                Message Operator
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
