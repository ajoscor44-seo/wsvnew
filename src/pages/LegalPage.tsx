/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { useParams } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const LegalPage = () => {
  const { type } = useParams();
  const isPrivacy = type === "privacy";

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-16 sm:pb-20 px-margin-mobile sm:px-margin-desktop bg-surface text-on-surface relative overflow-hidden">
      {/* Background polish */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-6 sm:mb-8"
      >
        <Breadcrumbs items={[{ label: isPrivacy ? "Privacy Policy" : "Terms & Conditions" }]} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto glass-card p-6 sm:p-12 md:p-20 rounded-3xl sm:rounded-[2.5rem] relative z-10 border border-primary/5 shadow-2xl shadow-primary/5"
      >
        <div className="mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 bg-primary/5 text-primary rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-6 sm:mb-8">
            WSV Network Terminal
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display-lg text-white tracking-tighter leading-none mb-3 sm:mb-4">
            {isPrivacy ? "Privacy <br/> Protocols" : "Terms of <br/> Operation"}
          </h1>
          <p className="text-on-surface-variant font-bold text-xs uppercase tracking-widest opacity-45">
            Version 4.2.0 • Last Refreshed Oct 2024
          </p>
        </div>
        
        <div className="prose prose-emerald max-w-none space-y-8 sm:space-y-12 text-on-surface-variant leading-relaxed font-medium">
          <section className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white font-headline-md tracking-tight flex items-center gap-3">
              <span className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/5 rounded-lg flex items-center justify-center text-xs">01</span>
              Initialization
            </h2>
            <p className="text-sm sm:text-base">
              Welcome to the WSV Network. We are committed to providing a high-performance terminal for WhatsApp status growth. 
              By accessing our sync engine, you agree to the protocols outlined in this transmission.
            </p>
          </section>

          <section className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white font-headline-md tracking-tight flex items-center gap-3">
              <span className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/5 rounded-lg flex items-center justify-center text-xs">02</span>
              Data Transmission
            </h2>
            <p className="text-sm sm:text-base">
              We capture minimal metadata required for terminal operations, including your verified identity and contact digits. 
              This data is utilized exclusively for generating VCF drops and facilitating network synchronization.
            </p>
          </section>

          <section className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white font-headline-md tracking-tight flex items-center gap-3">
              <span className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/5 rounded-lg flex items-center justify-center text-xs">03</span>
              Network Reciprocity
            </h2>
            <p className="text-sm sm:text-base">
              The WSV ecosystem operates on mutual exchange. Operators are required to import daily drops to maintain 
              the integrity of the sync cycle. Deviating from this protocol may result in degraded reach performance.
            </p>
          </section>

          <section className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white font-headline-md tracking-tight flex items-center gap-3">
              <span className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/5 rounded-lg flex items-center justify-center text-xs">04</span>
              Security Architecture
            </h2>
            <p className="text-sm sm:text-base">
              Our architecture leverages industry-grade encryption for all data handling. We strictly prohibit 
              the use of third-party scripts or unauthorized automation. Your security is integrated into our core.
            </p>
          </section>
        </div>

        <div className="mt-12 sm:mt-16 md:mt-24 pt-8 sm:pt-12 md:pt-16 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-black font-black text-sm">W</div>
            <span className="font-black text-lg tracking-tighter text-white">WSV</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-on-surface-variant/30 font-bold uppercase tracking-[0.3em] text-center">
            GiGsflix Digitals • Secure Transmission
          </p>
        </div>
      </motion.div>
    </div>
  );
};

