/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Breadcrumbs } from "../components/Breadcrumbs";
import pagesData from "../data/pages.json";

export const StaticPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    const localPage = pagesData.find(p => p.slug === slug);
    if (localPage) {
      setPage(localPage);
      document.title = `${localPage.title.rendered.replace(/&nbsp;/g, ' ')} - WSV`;
    } else {
      // If it's not a page, maybe it's a legacy link we should handle
      navigate("/");
    }
  }, [slug, navigate]);

  if (!page) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/10 border-t-secondary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface selection:bg-secondary/30 selection:text-primary">
      <main className="pt-24 sm:pt-32 pb-16 sm:pb-24">
        <article className="max-w-4xl mx-auto px-4 sm:px-6">
          <Breadcrumbs items={[{ label: page.title.rendered.replace(/&nbsp;/g, ' ') }]} />
          <header className="mb-10 sm:mb-16 text-center">
            <h1 
              className="text-3xl sm:text-5xl md:text-6xl font-display-lg text-white leading-[1.1] tracking-tighter"
              dangerouslySetInnerHTML={{ __html: page.title.rendered }}
            />
          </header>

          <div 
            className="wp-content max-w-none text-sm sm:text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.content.rendered }}
          />
        </article>
      </main>
    </div>
  );
};
