import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  ArrowRight, 
  Calculator, 
  ChevronDown, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ContactForm } from '@/components/contact/ContactForm';
import { useBusinessSettings } from '@/context/BusinessSettingsContext';

interface FAQItem {
  question: string;
  answer: string;
  linkText?: string;
  linkUrl?: string;
}

export const ContactPage: React.FC = () => {
  const { 
    settings, 
    hasPhone, 
    hasEmail, 
    isWhatsAppConfigured, 
    hasAddress, 
    formattedHours 
  } = useBusinessSettings();

  useEffect(() => {
    document.title = `Contact Us | ${settings.businessName} - Nylon Manufacturing & Packaging`;
  }, [settings.businessName]);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs: FAQItem[] = [
    {
      question: 'How can I enquire about a specific product?',
      answer: 'You can explore our Product Catalogue to inspect standard sizes, material grades, and specifications. On each product page, click "Request a Quote" to prefill the enquiry builder, or use the contact form above to ask questions.',
      linkText: 'Browse Product Catalogue',
      linkUrl: '/products',
    },
    {
      question: 'Can I enquire about bulk wholesale quantities?',
      answer: 'Yes. We cater to storefront retailers, regional stockists, and industrial distributors. When submitting your enquiry via our quotation builder, you can enter your estimated volume (in pieces, rolls, packs, or kg) to discuss bulk wholesale pricing.',
      linkText: 'Open Quotation Builder',
      linkUrl: '/request-quote',
    },
    {
      question: 'Can I enquire about custom sizes or brand printing?',
      answer: 'Yes. We evaluate custom bag dimensions, roll widths, and flexographic brand printing. Because custom extrusion and print cylinders are subject to minimum order thresholds and resin scheduling, please submit your intended dimensions to discuss feasibility with our team.',
      linkText: 'Discuss Custom Requirements',
      linkUrl: '/request-quote?custom=true',
    },
    {
      question: 'How can I confirm available technical specifications?',
      answer: 'All specifications listed on this website represent confirmed baseline metrics. Before mass production begins, exact micron thicknesses, physical dimensions, and polymer swatches can be verified directly with our sales team.',
    },
    {
      question: 'How do I request a formal price quotation?',
      answer: 'Visit our Request a Quote page, select your product or choose "Discuss a Custom Packaging Requirement", fill in your contact information and requirements, and continue directly to WhatsApp to review the compiled request with our team.',
      linkText: 'Request a Quote Now',
      linkUrl: '/request-quote',
    },
  ];

  return (
    <div className="py-8 sm:py-12 space-y-12 sm:space-y-16">
      <Container size="xl">
        {/* =========================================================================
            1. BREADCRUMBS & PAGE HEADER
            ========================================================================= */}
        <div className="space-y-4 border-b border-[#E6E4DD] pb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#5C635F]">
            <Link
              to="/"
              className="hover:text-[#246B45] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-[#88918C]" aria-hidden="true" />
            <span className="font-semibold text-[#252A27]" aria-current="page">
              Contact Us
            </span>
          </nav>

          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#246B45] bg-[#EAF3ED] px-2.5 py-0.5 rounded-sm">
              COMMUNICATION & ENQUIRIES
            </span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#252A27]">
              Let&apos;s Talk About Your Packaging Needs
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#5C635F] leading-relaxed">
              Have a question about our products, quantities, or a custom requirement? Get in touch with {settings.businessName}.
            </p>
          </div>
        </div>

        {/* =========================================================================
            2. CONTACT CHANNELS (VERIFIED INFORMATION OR CLEAN STATUS)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: WhatsApp Channel */}
          <div className="bg-white border border-[#D8D5CB] p-6 rounded-lg shadow-subtle flex flex-col justify-between space-y-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-elevated hover:border-[#246B45]">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-md bg-[#EAF3ED] text-[#246B45] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 stroke-[2]" />
              </div>
              <h2 className="text-base font-bold text-[#252A27]">
                WhatsApp Enquiries
              </h2>
              <p className="text-xs text-[#5C635F] leading-relaxed">
                Direct messaging for rapid specification review and preliminary quotation coordination.
              </p>
            </div>

            <div className="pt-2 border-t border-[#E6E4DD]">
              {isWhatsAppConfigured && settings.whatsAppNumber ? (
                <a
                  href={`https://wa.me/${settings.whatsAppNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#246B45] hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                >
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div className="text-xs text-[#88918C]">
                  <span className="font-semibold text-[#5C635F] block">Channel Setup:</span>
                  Official WhatsApp line pending configuration. Use the message builder below.
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Telephone Line */}
          <div className="bg-white border border-[#D8D5CB] p-6 rounded-lg shadow-subtle flex flex-col justify-between space-y-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-elevated hover:border-[#246B45]">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-md bg-[#EAF3ED] text-[#246B45] flex items-center justify-center">
                <Phone className="w-5 h-5 stroke-[2]" />
              </div>
              <h2 className="text-base font-bold text-[#252A27]">
                Phone Calls
              </h2>
              <p className="text-xs text-[#5C635F] leading-relaxed">
                Direct verbal consultation with our packaging sales desk during working operational hours.
              </p>
            </div>

            <div className="pt-2 border-t border-[#E6E4DD]">
              {hasPhone && settings.phone ? (
                <a
                  href={`tel:${settings.phone}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#246B45] hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                >
                  <span>{settings.phone}</span>
                </a>
              ) : (
                <div className="text-xs text-[#88918C]">
                  <span className="font-semibold text-[#5C635F] block">Channel Setup:</span>
                  Official phone line will be published upon verified completion of business licensing.
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Email Desk */}
          <div className="bg-white border border-[#D8D5CB] p-6 rounded-lg shadow-subtle flex flex-col justify-between space-y-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-elevated hover:border-[#246B45]">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-md bg-[#EAF3ED] text-[#246B45] flex items-center justify-center">
                <Mail className="w-5 h-5 stroke-[2]" />
              </div>
              <h2 className="text-base font-bold text-[#252A27]">
                Email Correspondence
              </h2>
              <p className="text-xs text-[#5C635F] leading-relaxed">
                Formal written estimates, corporate procurement schedules, and specification sheets.
              </p>
            </div>

            <div className="pt-2 border-t border-[#E6E4DD]">
              {hasEmail && settings.email ? (
                <a
                  href={`mailto:${settings.email}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#246B45] hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm truncate max-w-full"
                >
                  <span className="truncate">{settings.email}</span>
                </a>
              ) : (
                <div className="text-xs text-[#88918C]">
                  <span className="font-semibold text-[#5C635F] block">Channel Setup:</span>
                  Direct corporate email line to be activated with production dispatch.
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Physical Facility */}
          <div className="bg-white border border-[#D8D5CB] p-6 rounded-lg shadow-subtle flex flex-col justify-between space-y-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-elevated hover:border-[#246B45]">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-md bg-[#EAF3ED] text-[#246B45] flex items-center justify-center">
                <MapPin className="w-5 h-5 stroke-[2]" />
              </div>
              <h2 className="text-base font-bold text-[#252A27]">
                Location & Facility
              </h2>
              <p className="text-xs text-[#5C635F] leading-relaxed">
                Factory plant and regional warehousing depot for scheduled order pickups.
              </p>
            </div>

            <div className="pt-2 border-t border-[#E6E4DD]">
              {hasAddress && settings.address ? (
                <div className="text-xs text-[#252A27] space-y-1">
                  <span>{settings.address}</span>
                </div>
              ) : (
                <div className="text-xs text-[#88918C]">
                  <span className="font-semibold text-[#5C635F] block">Facility Address:</span>
                  Manufacturing & warehouse depot addresses will be confirmed upon facility commissioning.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. MAIN CONTENT: ENQUIRY FORM & SIDEBAR GUIDANCE
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: General Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          {/* Right Column: Direction to Quotation Builder & Working Hours (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Quotation Callout */}
            <div className="bg-white border border-[#D8D5CB] p-6 sm:p-7 rounded-lg shadow-subtle space-y-4">
              <div className="flex items-center gap-2 text-[#246B45]">
                <Calculator className="w-5 h-5 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#252A27]">
                  Looking for a Product Quotation?
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-[#5C635F] leading-relaxed">
                If you have specific bag dimensions, roll lengths, estimated quantities, or require a pricing estimate for a catalog item, our dedicated quotation builder provides tailored specification inputs.
              </p>

              <div className="pt-2">
                <Link to="/request-quote">
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Open Quotation Builder
                  </Button>
                </Link>
              </div>
            </div>

            {/* Custom Packaging Requirement Link */}
            <div className="bg-[#FAF9F6] border border-[#D8D5CB] p-6 rounded-lg space-y-3 text-xs text-[#5C635F]">
              <div className="flex items-center gap-2 text-[#246B45]">
                <Sparkles className="w-4 h-4 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#252A27]">
                  Custom Packaging Requirements
                </h3>
              </div>
              <p className="leading-relaxed">
                Need a custom gauge or non-standard size? You do not need to calculate technical metrics alone. Tell us what you plan to pack, and our team will guide you on suitable film densities.
              </p>
              <div className="pt-1">
                <Link
                  to="/request-quote?custom=true"
                  className="text-xs font-bold text-[#246B45] hover:underline underline-offset-4 inline-flex items-center gap-1"
                >
                  <span>Discuss Custom Packaging</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Operating Hours Note */}
            <div className="bg-white border border-[#D8D5CB] p-6 rounded-lg text-xs space-y-3">
              <div className="flex items-center gap-2 text-[#252A27] font-bold">
                <Clock className="w-4 h-4 text-[#246B45]" />
                <span>Operating & Communication Schedule</span>
              </div>
              <p className="text-[#5C635F] leading-relaxed">
                {formattedHours ? (
                  <span>{formattedHours}</span>
                ) : (
                  <span>
                    Our digital enquiry portal and WhatsApp handoff are accessible at any time. Messages are reviewed and addressed during standard business hours.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. FREQUENTLY ASKED QUESTIONS (FAQ)
            ========================================================================= */}
        <div className="pt-8 border-t border-[#E6E4DD] space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
              COMMON QUESTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#252A27] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#5C635F]">
              Direct answers regarding product enquiries, order volume questions, and communication procedures.
            </p>
          </div>

          <div className="max-w-3xl divide-y divide-[#E6E4DD] border-y border-[#E6E4DD]">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question} className="py-4 sm:py-5">
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between text-left gap-4 focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm py-1 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-[#252A27] hover:text-[#246B45] transition-colors">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#5C635F] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#246B45]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="pt-3 pb-1 text-xs sm:text-sm text-[#5C635F] leading-relaxed space-y-2 animate-fade-slide-down">
                      <p>{faq.answer}</p>
                      {faq.linkUrl && faq.linkText && (
                        <div className="pt-1">
                          <Link
                            to={faq.linkUrl}
                            className="inline-flex items-center gap-1 font-semibold text-[#246B45] hover:underline underline-offset-4"
                          >
                            <span>{faq.linkText}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-[#FAF9F6] border border-[#E6E4DD] rounded-md text-xs text-[#5C635F] flex items-start gap-2 max-w-3xl">
            <HelpCircle className="w-4 h-4 text-[#246B45] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Have a question that is not addressed here? Use the contact form above or reach out directly to confirm current stock, minimum order thresholds, and lead times.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};
