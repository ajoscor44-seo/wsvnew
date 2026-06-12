/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { useEffect } from "react";

// Components
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Toaster } from "sonner";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { LegalPage } from "./pages/LegalPage";
import { DownloadPage } from "./pages/DownloadPage";
import { WhatsappTvsPage } from "./pages/WhatsappTvsPage";
import { BlogPage } from "./pages/BlogPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { StaticPage } from "./pages/StaticPage";
import { AuthorProfilePage } from "./pages/AuthorProfilePage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  const location = useLocation();
  const isDownloadPage = location.pathname === "/download";

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface selection:bg-secondary/30 selection:text-primary">
      <Toaster position="top-center" richColors />
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/whatsapp-tvs" element={<WhatsappTvsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/legal/:type" element={<LegalPage />} />
        <Route path="/p/:slug" element={<StaticPage />} />
        <Route path="/author" element={<AuthorProfilePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/:slug" element={<BlogPostPage />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
