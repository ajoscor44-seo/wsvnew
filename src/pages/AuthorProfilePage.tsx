/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import React, { useEffect } from "react";
import { 
  Globe, 
  Twitter, 
  Linkedin, 
  Mail, 
  MapPin, 
  Award,
  Zap,
  TrendingUp,
  MessageCircle,
  Users
} from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import postsData from "../data/posts.json";
import { Link } from "react-router-dom";

export const AuthorProfilePage = () => {
  useEffect(() => {
    document.title = "Adekiya Joscor - Growth Strategist | WSV";
  }, []);

  const authorPosts = postsData.slice(0, 6); // Just showing some posts as "his"

  return (
    <div className="min-h-screen bg-surface selection:bg-secondary/30 selection:text-primary">
      <main className="max-w-7xl mx-auto px-margin-mobile sm:px-margin-desktop py-24 sm:py-32 relative">
        <Breadcrumbs items={[{ label: "Author Profile" }]} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 mt-8 sm:mt-12">
          {/* Sidebar / Bio */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xl shadow-white/5 border border-white/10 text-center"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-6 p-1">
                <div className="w-full h-full bg-surface rounded-full overflow-hidden flex items-center justify-center">
                   <img src="/uploads/avatar.png" alt="Adekiya Joscor" className="w-full h-full object-cover" />
                </div>
              </div>
              <h1 className="text-xl sm:text-3xl font-display-lg text-white tracking-tighter mb-1 sm:mb-2">Adekiya Joscor</h1>
              <p className="text-secondary font-black uppercase tracking-widest text-[9px] sm:text-[10px] mb-4 sm:mb-6">Growth Strategist & Founder</p>
              
              <div className="flex justify-center gap-3 sm:gap-4">
                <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all"><Twitter size={16} /></a>
                <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all"><Linkedin size={16} /></a>
                <a href="mailto:faqwithjoscor@gmail.com" className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all"><Mail size={16} /></a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface-container-low p-6 sm:p-8 rounded-2xl sm:rounded-3xl space-y-6 sm:space-y-8"
            >
              <div>
                <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 mb-3 flex items-center gap-2">
                  <MapPin size={12} /> Location
                </h4>
                <p className="text-primary font-bold text-sm sm:text-base">Lagos, Nigeria</p>
              </div>
              <div>
                <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 mb-3 flex items-center gap-2">
                  <Award size={12} /> Expertise
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {['WhatsApp SEO', 'Viral Growth', 'Audience Building', 'SaaS Marketing'].map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-white/5 rounded-full text-[9px] sm:text-[10px] font-bold text-on-surface-variant border border-white/10">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10 sm:space-y-16">
            <section>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline-lg text-white tracking-tighter mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
                <div className="w-1.5 h-8 sm:w-2 sm:h-10 bg-accent rounded-full" />
                About Adekiya
              </h2>
              <div className="text-on-surface-variant font-medium leading-relaxed space-y-4 sm:space-y-6 text-sm sm:text-base md:text-lg">
                <p>
                  Adekiya Joscor is a digital growth architect specializing in high-velocity audience expansion. As the visionary behind WhatsApp Status Views (WSV), he has empowered thousands of entrepreneurs across Nigeria to break through the "visibility ceiling" and build sustainable status influence.
                </p>
                <p>
                  With a background in behavioral marketing and viral mechanics, Adekiya focuses on creating automated ecosystems that turn passive contacts into active, engaged status viewers. His mission is to democratize digital reach for the next generation of Nigerian creators.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline-lg text-white tracking-tighter flex items-center gap-3 sm:gap-4">
                  <div className="w-1.5 h-8 sm:w-2 sm:h-10 bg-secondary rounded-full" />
                  Latest Insights
                </h2>
                <Link to="/blog" className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-secondary hover:translate-x-0.5 transition-transform">View All Articles</Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {authorPosts.map((post, i) => (
                  <motion.div 
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group"
                  >
                    <Link to={`/${post.slug}`}>
                      <div className="aspect-video bg-white/5 rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 border border-white/10 shadow-md shadow-white/5">
                        <img 
                          src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/uploads/placeholder.png'} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          alt={post.title.rendered} 
                        />
                      </div>
                      <h4 className="font-bold font-headline text-white group-hover:text-secondary transition-colors line-clamp-2 leading-snug text-sm sm:text-base">
                        {post.title.rendered.replace(/&nbsp;/g, ' ')}
                      </h4>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
