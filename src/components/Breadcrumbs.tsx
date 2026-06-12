/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

interface BreadcrumbProps {
  items?: { label: string; path?: string }[];
}

export const Breadcrumbs = ({ items = [] }: BreadcrumbProps) => {
  return (
    <nav className="inline-flex items-center gap-1.5 sm:gap-2 p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] mb-8 sm:mb-12 shadow-sm max-w-full overflow-x-auto scrollbar-hide">
      <Link to="/" className="px-3 sm:px-4 py-2 text-on-surface-variant/60 hover:text-primary hover:bg-white/5 rounded-lg sm:rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Home size={12} />
        <span className="hidden sm:inline">Base</span>
      </Link>
      
      <div className="w-1 h-1 bg-white/10 rounded-full shrink-0" />
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.path ? (
            <Link 
              to={item.path} 
              className="px-3 sm:px-4 py-2 text-on-surface-variant/60 hover:text-primary hover:bg-white/5 rounded-lg sm:rounded-xl transition-all shrink-0"
            >
              {item.label}
            </Link>
          ) : (
            <span className="px-3 sm:px-4 py-2 text-secondary bg-secondary/10 rounded-lg sm:rounded-xl truncate max-w-[140px] sm:max-w-[200px] md:max-w-none">
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <div className="w-1 h-1 bg-white/10 rounded-full shrink-0" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
