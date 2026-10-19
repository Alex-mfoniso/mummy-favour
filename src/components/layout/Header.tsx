import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Megaphone, MessageCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { NavItem } from '@/types';
import { useBusinessSettings } from '@/context/BusinessSettingsContext';

const NAV_LINKS: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Track Order', path: '/track-order' },
  { label: 'About Us', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useBusinessSettings();

  // Close mobile menu whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Listen for global mobile menu open/toggle events (e.g. from MobileBottomNav)
  useEffect(() => {
    const handleOpen = () => setMobileMenuOpen(true);
    const handleClose = () => setMobileMenuOpen(false);
    const handleToggle = () => setMobileMenuOpen((prev) => !prev);

    window.addEventListener('open-mobile-menu', handleOpen);
    window.addEventListener('close-mobile-menu', handleClose);
    window.addEventListener('toggle-mobile-menu', handleToggle);

    return () => {
      window.removeEventListener('open-mobile-menu', handleOpen);
      window.removeEventListener('close-mobile-menu', handleClose);
      window.removeEventListener('toggle-mobile-menu', handleToggle);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#E6E4DD]">
      {/* Public Announcement Bar (if configured by admin) */}
      {settings.publicAnnouncement && (
        <div className="bg-[#246B45] text-white text-xs font-medium py-1.5 px-4 text-center border-b border-[#1D5838] flex items-center justify-center gap-2">
          <Megaphone className="w-3.5 h-3.5 shrink-0 opacity-90" />
          <span>{settings.publicAnnouncement}</span>
        </div>
      )}

      <Container size="xl">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Logo with max-width containment on mobile to prevent overflow */}
          <div className="flex-shrink min-w-0 max-w-[220px] sm:max-w-none">
            <Logo size="md" businessName={settings.businessName} logoUrl={settings.logoUrl || undefined} />
          </div>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-6 lg:gap-8"
          >
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors duration-150 py-1 border-b-2 ${
                    isActive
                      ? 'text-[#246B45] border-[#246B45]'
                      : 'text-[#5C635F] border-transparent hover:text-[#252A27] hover:border-[#D8D5CB]'
                  } focus-visible:outline-2 focus-visible:outline-[#246B45] focus-visible:outline-offset-4 rounded-sm`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/request-quote" tabIndex={-1}>
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />}
              >
                Request a Quote
              </Button>
            </Link>
          </div>

          {/* Mobile Right Actions: Accessible Menu Button */}
          <div className="flex items-center md:hidden shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#252A27] bg-[#FAF9F6] border border-[#D8D5CB] hover:bg-[#F5F4EF] active:bg-[#EBE9DF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#246B45] transition-colors"
              aria-controls="mobile-navigation"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Menu Drawer Portal (renders directly into document.body to avoid backdrop-blur containment bugs) */}
      {typeof document !== 'undefined' &&
        createPortal(
          mobileMenuOpen && (
            <div
              id="mobile-navigation"
              className="fixed inset-0 z-50 md:hidden flex justify-end"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
            >
              {/* Dimmed Backdrop */}
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Drawer Content Panel */}
              <div className="relative w-full max-w-sm bg-white h-full flex flex-col justify-between p-6 z-10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
                <div className="space-y-6">
                  {/* Top bar inside drawer with Logo and Close button */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#E6E4DD]">
                    <Logo size="sm" businessName={settings.businessName} logoUrl={settings.logoUrl || undefined} />
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1.5 rounded-md text-[#5C635F] hover:text-[#252A27] hover:bg-[#F5F4EF] border border-[#E6E4DD] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#246B45]"
                      aria-label="Close navigation menu"
                    >
                      <X className="w-5 h-5 stroke-[2]" />
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#88918C] px-3 block mb-2">
                      Navigation Menu
                    </span>

                    {NAV_LINKS.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3.5 py-3 rounded-md text-base font-semibold transition-colors ${
                            isActive
                              ? 'bg-[#EAF3ED] text-[#246B45]'
                              : 'text-[#252A27] hover:bg-[#F5F4EF]'
                          }`
                        }
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="w-4 h-4 text-[#88918C]" aria-hidden="true" />
                      </NavLink>
                    ))}
                  </div>
                </div>

                {/* Drawer Footer Actions */}
                <div className="pt-6 border-t border-[#E6E4DD] space-y-3.5">
                  <div className="text-xs text-[#5C635F]">
                    Looking for custom nylon specifications or wholesale supply?
                  </div>

                  <Link
                    to="/request-quote"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      rightIcon={<ArrowRight className="w-4 h-4 stroke-[2.2]" />}
                      className="font-bold shadow-md"
                    >
                      Request a Quote
                    </Button>
                  </Link>

                  {/* Direct WhatsApp Contact button if configured */}
                  {settings.whatsAppNumber && (
                    <a
                      href={`https://wa.me/${settings.whatsAppNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md text-xs font-semibold text-[#1D5838] bg-[#EAF3ED] border border-[#BADBC5] hover:bg-[#D3E6DA] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-[#246B45]" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  )}

                  <div className="text-center text-[10px] text-[#88918C] pt-2">
                    {settings.businessName} • Industrial Nylon & Packaging
                  </div>
                </div>
              </div>
            </div>
          ),
          document.body
        )}
    </header>
  );
};
