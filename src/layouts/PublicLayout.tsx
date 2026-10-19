import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { PageTransition } from '@/components/layout/PageTransition';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4EF] text-[#252A27]">
      {/* Scroll restoration across page transitions */}
      <ScrollToTop />

      {/* Accessible skip link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#246B45] focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#246B45]"
      >
        Skip to main content
      </a>

      {/* Main Public Header */}
      <Header />

      {/* Main content container with bottom padding on mobile for MobileBottomNav and animated page transition */}
      <main id="main-content" className="flex-1 focus:outline-none pb-20 md:pb-0">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Main Public Footer */}
      <Footer />

      {/* Persistent Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};
