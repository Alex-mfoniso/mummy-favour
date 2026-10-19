import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Package, FileText, Database, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const AdminPage: React.FC = () => {
  const plannedModules = [
    {
      title: 'Packaging Catalogue Management',
      icon: <Package className="w-5 h-5 text-[#246B45]" />,
      desc: 'Add, update, and manage product specifications, micron thicknesses, and stock availability states.',
      status: 'Planned for Phase 2',
    },
    {
      title: 'Quote Inquiries & Pricing Dispatch',
      icon: <FileText className="w-5 h-5 text-[#246B45]" />,
      desc: 'Review incoming quote requests from retail, wholesale, and commercial clients, and generate structured proposals.',
      status: 'Planned for Phase 2',
    },
    {
      title: 'Extrusion Batch & Order Tracking',
      icon: <Database className="w-5 h-5 text-[#246B45]" />,
      desc: 'Track manufacturing runs, customer orders, and regional distribution dispatches.',
      status: 'Planned for Phase 3',
    },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 mb-2">
          <StatusBadge variant="forest">System Boundary</StatusBadge>
          <span className="text-xs font-semibold text-[#5C635F]">
            Internal Administrative Surface
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252A27]">
          Divine Favour Admin Portal
        </h1>
        <p className="mt-2 text-sm text-[#5C635F] leading-relaxed">
          This route establishes the dedicated architectural boundary and screen layout for future administration functions. In accordance with Phase 1 constraints, no authentication or backend persistence logic has been implemented.
        </p>
      </div>

      {/* Boundary Verification Notice */}
      <div className="bg-white border border-[#D8D5CB] p-6 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-[#246B45] font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>Phase 1 Architecture Boundary Verified</span>
        </div>
        <p className="text-xs text-[#5C635F] leading-relaxed">
          The admin route is rendered under a isolated layout wrapper (<code className="text-[#252A27] bg-[#F5F4EF] px-1 py-0.5 rounded">AdminLayout.tsx</code>), keeping internal console navigation independent from the customer-facing public storefront.
        </p>
      </div>

      {/* Planned Modules Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#252A27] mb-4">
          Future Administrative Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plannedModules.map((module) => (
            <div
              key={module.title}
              className="bg-white border border-[#D8D5CB] p-5 rounded-md flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded bg-[#EAF3ED] flex items-center justify-center mb-3">
                  {module.icon}
                </div>
                <h3 className="text-sm font-bold text-[#252A27] mb-1.5">{module.title}</h3>
                <p className="text-xs text-[#5C635F] leading-relaxed">{module.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E6E4DD]">
                <span className="text-[11px] font-semibold text-[#88918C]">
                  {module.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Return to Public Site */}
      <div className="pt-4">
        <Link to="/">
          <Button
            variant="outline"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4 stroke-[2]" />}
          >
            Return to Public Storefront
          </Button>
        </Link>
      </div>
    </div>
  );
};
