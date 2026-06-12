/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Clock, 
  Calendar,
  User,
  Share2,
  Copy,
  ChevronRight,
  TrendingUp,
  MessageCircle,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "../components/Breadcrumbs";
import postsData from "../data/posts.json";
import pagesData from "../data/pages.json";

export const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    const localPost = postsData.find(p => p.slug === slug);
    const localPage = pagesData.find(p => p.slug === slug);
    
    if (localPost) {
      setPost(localPost);
      document.title = `${localPost.title.rendered.replace(/&nbsp;/g, ' ')} - WhatsApp Status Views`;
    } else if (localPage) {
      setPost(localPage);
      document.title = `${localPage.title.rendered.replace(/&nbsp;/g, ' ')} - WhatsApp Status Views`;
    } else {
      toast.error("Content not found");
      navigate("/blog");
    }
  }, [slug, navigate]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Article link copied to clipboard!");
  };

  if (!post) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/10 border-t-secondary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface selection:bg-secondary/30 selection:text-primary">
      <main className="pt-24 sm:pt-32 pb-16 sm:pb-24">
        <article className="max-w-4xl mx-auto px-margin-mobile sm:px-margin-desktop">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Breadcrumbs items={[
              { label: "Growth Tips", path: "/blog" },
              { label: post.title.rendered.replace(/&nbsp;/g, ' ').replace(/&#8211;/g, '–') }
            ]} />
            <button 
              onClick={handleCopyLink}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-on-surface shadow-md hover:scale-105 hover:bg-surface-container transition-transform shrink-0 self-end sm:self-auto"
              title="Share Article"
            >
              <Share2 size={18} />
            </button>
          </div>

          {/* Post Header */}
          <header className="mb-8 sm:mb-12 md:mb-16 space-y-6 sm:space-y-8">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary/40">
              <span className="flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-full text-primary">
                <Calendar size={12} />
                {new Date(post.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5 bg-secondary/5 px-3 py-1.5 rounded-full text-secondary">
                <Clock size={12} />
                5 Min Read
              </span>
              <span className="flex items-center gap-1.5 bg-accent/5 px-3 py-1.5 rounded-full text-accent">
                <TrendingUp size={12} />
                Growth Strategy
              </span>
            </div>

            <h1 
              className="text-2xl sm:text-4xl md:text-6xl font-display-lg text-white leading-tight tracking-tighter"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                <User size={20} />
              </div>
              <div>
                <Link to="/author" className="hover:text-secondary transition-colors">
                  <p className="font-bold text-primary uppercase tracking-widest text-[9px]">Author</p>
                  <p className="font-bold text-on-surface-variant text-xs sm:text-sm">Adekiya Joscor</p>
                </Link>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="aspect-[21/9] rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-lg mb-8 sm:mb-12 border border-white/10 bg-white/5">
            {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
              <img 
                src={post._embedded['wp:featuredmedia'][0].source_url} 
                className="w-full h-full object-cover"
                alt={post.title.rendered}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center text-primary/10">
                <BookOpen size={48} />
              </div>
            )}
          </div>

          {/* Content */}
          <div 
            className="wp-content max-w-none text-sm sm:text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />

          {/* Post Footer / CTA */}
          <footer className="mt-12 sm:mt-20 pt-10 sm:pt-16 border-t border-primary/5">
            <div className="glass-card p-6 sm:p-12 md:p-16 rounded-2xl sm:rounded-[2.5rem] text-white border border-primary/20 ambient-glow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/10 rounded-full blur-[80px] sm:blur-[100px] -mr-32 sm:-mr-48 -mt-32 sm:-mt-48 pointer-events-none" />
              <div className="relative z-10 space-y-6 sm:space-y-8 max-w-2xl">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Zap size={24} className="text-accent" />
                </div>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-black font-headline leading-tight tracking-tighter">
                  Ready to put these strategies into action?
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-white/70 font-medium">
                  Join the network today and start growing your WhatsApp influence with our automated VCF sync.
                </p>
                <Link to="/#join" className="btn-secondary px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider">
                  Join The Network
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
};

const BookOpen = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
);
