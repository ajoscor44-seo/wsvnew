/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Clock, 
  ArrowRight, 
  ChevronRight,
  Search,
  Sparkles,
  Calendar
} from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import postsData from "../data/posts.json";

export const BlogPage = () => {
  const [posts] = useState<any[]>(postsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 9;

  useEffect(() => {
    document.title = "Growth Tips - Master Your WhatsApp Influence | WSV";
    window.scrollTo(0, 0);
  }, [currentPage]);

  const filteredPosts = posts.filter(post => 
    post.title.rendered.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.rendered.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-secondary/30 selection:text-primary">
      <main className="max-w-7xl mx-auto px-margin-mobile sm:px-margin-desktop pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 relative">
        <Breadcrumbs items={[{ label: "Growth Tips" }]} />
        
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 bg-primary/5 text-primary rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-6 sm:mb-10"
          >
            <Sparkles size={12} className="text-accent" />
            The Growth Blueprint
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display-lg text-white tracking-tighter leading-none mb-6 sm:mb-8">
            Master Your <br/> <span className="text-gradient">WhatsApp Influence</span>
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-on-surface-variant max-w-2xl mx-auto font-medium leading-relaxed">
            Exclusive tips, strategies, and insights to skyrocket your status views and build a massive audience.
          </p>
        </div>

        {/* Search Hub */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-12 relative px-2">
          <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 rounded-full" />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
          <input 
            type="text" 
            placeholder="Search growth strategies..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-14 sm:pl-16 pr-6 py-4 sm:py-5 bg-surface-container-low border border-white/10 rounded-xl sm:rounded-2xl focus:border-primary/20 focus:bg-surface-container-high shadow-xl shadow-white/5 outline-none font-bold text-sm sm:text-base text-on-surface placeholder:text-on-surface/20 transition-all focus:scale-[1.01]"
          />
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {currentPosts.map((post, i) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (i % 3) * 0.05 }}
                viewport={{ once: true }}
                className="group"
              >
                <Link to={`/${post.slug}`}>
                  <div className="aspect-[16/11] rounded-2xl sm:rounded-[2rem] overflow-hidden relative mb-5 sm:mb-6 shadow-md shadow-white/5 border border-white/10 bg-white/5 p-1 sm:p-2">
                    <div className="w-full h-full rounded-xl sm:rounded-[1.75rem] overflow-hidden relative">
                      {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                        <img 
                          src={post._embedded['wp:featuredmedia'][0].source_url} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          alt={post.title.rendered}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center text-primary/10">
                          <BookOpen size={48} strokeWidth={1} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="absolute bottom-6 left-6 right-6 translate-y-6 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[9px] font-bold uppercase tracking-widest border border-white/20">
                          Deep Dive <ArrowRight size={10} />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4 px-2">
                    <div className="flex items-center gap-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-primary/30">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-secondary" />
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                      <span className="w-1 h-1 bg-accent rounded-full animate-pulse" />
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} className="text-secondary" />
                        5 Min Read
                      </span>
                    </div>
                    <h3 
                      className="text-lg sm:text-xl md:text-2xl font-bold font-headline text-white group-hover:text-secondary transition-colors leading-snug tracking-tighter"
                      dangerouslySetInnerHTML={{ __html: post.title.rendered.replace(/&nbsp;/g, ' ') }}
                    />
                    <div 
                      className="text-on-surface-variant font-medium line-clamp-2 text-xs sm:text-sm leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity"
                      dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                    />
                    
                    <div className="pt-3 sm:pt-4 border-t border-primary/5 flex items-center justify-between group/btn">
                      <span className="text-secondary font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-1.5">
                        Read Full Insight
                        <motion.span
                          animate={{ x: [0, 3, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <ChevronRight size={14} />
                        </motion.span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

        {/* Pagination Hub */}
        {totalPages > 1 && (
          <div className="mt-10 sm:mt-16 flex flex-wrap justify-center items-center gap-2 sm:gap-3">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border border-white/10 text-on-surface disabled:opacity-20 disabled:cursor-not-allowed hover:bg-primary hover:text-black transition-all hover:scale-105"
            >
              <ArrowRight size={18} className="rotate-180" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => paginate(num)}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  currentPage === num 
                  ? "bg-primary text-black shadow-lg shadow-primary/15 scale-105" 
                  : "bg-white/5 text-on-surface-variant border border-white/10 hover:border-white/20 hover:bg-surface-container-high hover:scale-105"
                }`}
              >
                {num.toString().padStart(2, '0')}
              </button>
            ))}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border border-white/10 text-on-surface disabled:opacity-20 disabled:cursor-not-allowed hover:bg-primary hover:text-black transition-all hover:scale-105"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 bg-surface-container-low rounded-2xl sm:rounded-3xl border-2 border-dashed border-white/10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-on-surface/10 shadow-inner border border-white/10">
              <Search size={32} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-headline text-primary tracking-tighter mb-2">No strategies found</h3>
            <p className="text-on-surface-variant text-xs sm:text-sm font-medium">Try searching for different keywords or topics</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-6 text-secondary font-bold uppercase tracking-widest text-[9px] border-b-2 border-secondary pb-0.5"
            >
              Clear Search
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
