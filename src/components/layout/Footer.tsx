import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  MapPin, 
  Phone, 
  MessageSquare,
  Clock
} from 'lucide-react';
import { useBusinessSettings } from '@/context/BusinessSettingsContext';

const InstagramIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const FacebookIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const LinkedinIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const TwitterIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { 
    settings, 
    hasPhone, 
    hasEmail, 
    isWhatsAppConfigured, 
    hasAddress, 
    hasSocialLinks,
    formattedHours 
  } = useBusinessSettings();

  const cleanWhatsAppNumber = (settings.whatsAppNumber || '').replace(/[^0-9]/g, '');

  return (
    <footer className="bg-white border-t border-[#E6E4DD] text-[#252A27] mt-auto">
      <Container size="xl">
        <div className="py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand lockup & description */}
          <div className="space-y-4 lg:pr-4">
            <Logo 
              size="md" 
              businessName={settings.businessName} 
              logoUrl={settings.logoUrl || undefined} 
            />
            <p className="text-xs sm:text-sm text-[#5C635F] leading-relaxed">
              {settings.shortDescription || 
                'Manufacturer and supplier of durable nylon packaging films, commercial sacks, and custom retail bags engineered for reliability, barrier protection, and high-tensile strength.'}
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#246B45] font-semibold bg-[#EAF3ED] px-2.5 py-1 rounded">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{settings.tagline}</span>
            </div>

            {/* Social Media Links (if configured) */}
            {hasSocialLinks && settings.socialLinks && (
              <div className="pt-2 flex items-center gap-3 text-[#5C635F]">
                {settings.socialLinks.instagram && (
                  <a
                    href={settings.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#246B45] transition-colors p-1"
                    aria-label="Instagram"
                  >
                    <InstagramIcon />
                  </a>
                )}
                {settings.socialLinks.facebook && (
                  <a
                    href={settings.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#246B45] transition-colors p-1"
                    aria-label="Facebook"
                  >
                    <FacebookIcon />
                  </a>
                )}
                {settings.socialLinks.linkedin && (
                  <a
                    href={settings.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#246B45] transition-colors p-1"
                    aria-label="LinkedIn"
                  >
                    <LinkedinIcon />
                  </a>
                )}
                {settings.socialLinks.twitter && (
                  <a
                    href={settings.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#246B45] transition-colors p-1"
                    aria-label="Twitter / X"
                  >
                    <TwitterIcon />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Site Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#252A27] mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  to="/"
                  className="text-[#5C635F] hover:text-[#246B45] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-[#5C635F] hover:text-[#246B45] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                >
                  Product Catalogue
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-[#5C635F] hover:text-[#246B45] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                >
                  About {settings.businessName}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-[#5C635F] hover:text-[#246B45] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                >
                  Contact & Inquiries
                </Link>
              </li>
              <li>
                <Link
                  to="/track-enquiry"
                  className="text-[#5C635F] hover:text-[#246B45] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                >
                  Track Enquiry Status
                </Link>
              </li>
              <li>
                <Link
                  to="/request-quote"
                  className="text-[#246B45] font-semibold inline-flex items-center gap-1 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                >
                  <span>Request a Custom Quote</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2]" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#252A27] mb-4">
              Packaging Lines
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#5C635F]">
              <li>
                <Link
                  to="/products?category=carrier-bags"
                  className="hover:text-[#246B45] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                >
                  Retail Carrier Bags & Liners
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=packaging-bags"
                  className="hover:text-[#246B45] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                >
                  Industrial Packaging Sacks
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=nylon-rolls-and-film"
                  className="hover:text-[#246B45] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                >
                  Nylon Rolls & Film Sheeting
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=custom-printed-nylon"
                  className="hover:text-[#246B45] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                >
                  Custom Printed Nylon Bags
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Inquiries / Verified Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#252A27] mb-4">
              Business Inquiries
            </h4>
            <div className="p-3.5 rounded-md bg-[#F5F4EF] border border-[#E6E4DD] space-y-3">
              {/* Phone Line */}
              {hasPhone && settings.phone && (
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="w-3.5 h-3.5 text-[#246B45] shrink-0" aria-hidden="true" />
                  <a
                    href={`tel:${settings.phone}`}
                    className="text-[#252A27] font-semibold hover:text-[#246B45]"
                  >
                    {settings.phone}
                  </a>
                </div>
              )}

              {/* Email Line */}
              {hasEmail && settings.email && (
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-3.5 h-3.5 text-[#246B45] shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-[#252A27] font-semibold hover:text-[#246B45] truncate"
                  >
                    {settings.email}
                  </a>
                </div>
              )}

              {/* WhatsApp Line */}
              {isWhatsAppConfigured && cleanWhatsAppNumber && (
                <div className="flex items-center gap-2 text-xs">
                  <MessageSquare className="w-3.5 h-3.5 text-[#246B45] shrink-0" aria-hidden="true" />
                  <a
                    href={`https://wa.me/${cleanWhatsAppNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#246B45] font-semibold hover:underline"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              )}

              {/* Physical Location */}
              {hasAddress && settings.address && (
                <div className="flex items-start gap-2.5 text-xs text-[#5C635F]">
                  <MapPin className="w-4 h-4 text-[#246B45] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{settings.address}</span>
                </div>
              )}

              {/* Business Hours */}
              {formattedHours && (
                <div className="flex items-start gap-2.5 text-xs text-[#5C635F]">
                  <Clock className="w-3.5 h-3.5 text-[#246B45] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{formattedHours}</span>
                </div>
              )}

              <div className="pt-1 border-t border-[#E6E4DD]">
                <Link
                  to="/contact"
                  className="text-xs font-bold text-[#246B45] hover:underline underline-offset-4 inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                >
                  <span>Open Contact Inquiries</span>
                  <ArrowRight className="w-3 h-3 stroke-[2.2]" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="py-6 border-t border-[#E6E4DD] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#88918C]">
          <p>© {currentYear} {settings.businessName}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-[#88918C]">{settings.tagline}</span>
            <span className="text-[#D8D5CB]" aria-hidden="true">|</span>
            <Link
              to="/about"
              className="text-[#88918C] hover:text-[#252A27] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
            >
              About
            </Link>
            <span className="text-[#D8D5CB]" aria-hidden="true">|</span>
            <Link
              to="/contact"
              className="text-[#88918C] hover:text-[#252A27] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
            >
              Contact
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};
