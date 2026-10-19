import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Layers, 
  MessageSquare, 
  Clock, 
  Plus, 
  ArrowRight, 
  ExternalLink,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { EnquiryStatusBadge, ProductStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { 
  getDashboardSummary, 
  listEnquiries, 
  listProducts,
  loadEnquiries,
  loadProducts,
  loadCategories,
  resetAdminDataToDefaults
} from '@/services/adminService';
import { DashboardSummaryMetrics, AdminEnquiry, AdminProduct } from '@/types/admin';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardSummaryMetrics>(getDashboardSummary());
  const [recentEnquiries, setRecentEnquiries] = useState<AdminEnquiry[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<AdminProduct[]>([]);
  const [resetNotice, setResetNotice] = useState(false);

  const loadData = () => {
    setMetrics(getDashboardSummary());
    setRecentEnquiries(listEnquiries().slice(0, 5));
    setFeaturedProducts(listProducts().slice(0, 4));
  };

  useEffect(() => {
    document.title = 'Admin Overview | Divine Favour Internal Console';
    loadData();
    Promise.allSettled([loadEnquiries(), loadProducts(), loadCategories()]).then(() => {
      loadData();
    });
  }, []);

  const handleResetDemoData = () => {
    if (window.confirm('Reset all demo products, categories, enquiries, and settings back to default mock data?')) {
      resetAdminDataToDefaults();
      loadData();
      setResetNotice(true);
      setTimeout(() => setResetNotice(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* =========================================================================
          PAGE HEADER & QUICK ACTIONS
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E4DD] pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#246B45]">
            OVERVIEW & METRICS
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252A27]">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#5C635F] mt-1">
            Review packaging inventory, pending quotation enquiries, and store classifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/products?action=new">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Product
            </Button>
          </Link>

          <Link to="/admin/enquiries">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<MessageSquare className="w-4 h-4" />}
            >
              View Enquiries
            </Button>
          </Link>

          <Link to="/admin/categories">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Layers className="w-4 h-4" />}
            >
              Manage Categories
            </Button>
          </Link>
        </div>
      </div>

      {/* Demo Reset Notice */}
      {resetNotice && (
        <div className="p-3 bg-[#EAF3ED] border border-[#BADBC5] rounded-md text-xs text-[#1D5838] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#246B45] shrink-0" />
          <span>Demo mock data has been reset to defaults.</span>
        </div>
      )}

      {/* =========================================================================
          1. SUMMARY METRICS CARDS
          ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#5C635F]">
            Demonstration Metrics (Session Cache)
          </h2>
          <span className="text-[11px] text-[#88918C]">
            *Mock data for preview
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Products */}
          <div className="bg-white border border-[#D8D5CB] p-5 rounded-lg shadow-subtle flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs text-[#5C635F]">Total Products</span>
              <div className="text-2xl font-bold text-[#252A27]">
                {metrics.totalProducts}
              </div>
              <div className="text-[11px] text-[#88918C]">
                {metrics.activeProductsCount} standard active lines
              </div>
            </div>
            <div className="w-9 h-9 rounded-md bg-[#EAF3ED] text-[#246B45] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>

          {/* Total Categories */}
          <div className="bg-white border border-[#D8D5CB] p-5 rounded-lg shadow-subtle flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs text-[#5C635F]">Packaging Categories</span>
              <div className="text-2xl font-bold text-[#252A27]">
                {metrics.totalCategories}
              </div>
              <div className="text-[11px] text-[#88918C]">
                {metrics.visibleCategoriesCount} published on storefront
              </div>
            </div>
            <div className="w-9 h-9 rounded-md bg-[#F0F5FA] text-[#286090] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          {/* New Enquiries */}
          <div className="bg-white border border-[#D8D5CB] p-5 rounded-lg shadow-subtle flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs text-[#5C635F]">New Enquiries</span>
              <div className="text-2xl font-bold text-[#7A5100]">
                {metrics.newEnquiries}
              </div>
              <div className="text-[11px] text-[#88918C]">
                Unreviewed incoming submissions
              </div>
            </div>
            <div className="w-9 h-9 rounded-md bg-[#FFF8E6] text-[#7A5100] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>

          {/* Follow-up Pending */}
          <div className="bg-white border border-[#D8D5CB] p-5 rounded-lg shadow-subtle flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs text-[#5C635F]">Awaiting Follow-up</span>
              <div className="text-2xl font-bold text-[#252A27]">
                {metrics.enquiriesAwaitingFollowUp}
              </div>
              <div className="text-[11px] text-[#88918C]">
                New or in-review records
              </div>
            </div>
            <div className="w-9 h-9 rounded-md bg-[#F5F4EF] text-[#5C635F] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. RECENT ENQUIRIES TABLE & PRODUCT OVERVIEW
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Enquiries (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#D8D5CB] rounded-lg shadow-subtle overflow-hidden">
          <div className="p-5 border-b border-[#E6E4DD] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#252A27]">
                Recent Enquiries (Demo Records)
              </h2>
              <p className="text-xs text-[#5C635F]">
                Latest customer quotation and packaging requests.
              </p>
            </div>
            <Link
              to="/admin/enquiries"
              className="text-xs font-semibold text-[#246B45] hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="p-8">
              <AdminEmptyState
                title="No Enquiries Recorded"
                description="Sample customer requests will appear here when submitted or generated."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b border-[#E6E4DD] text-[#5C635F] font-semibold">
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E4DD]">
                  {recentEnquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#252A27]">
                        <div>{enq.customerName}</div>
                        {enq.businessName && (
                          <div className="text-[11px] text-[#88918C]">{enq.businessName}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#5C635F] max-w-[180px] truncate">
                        {enq.subject}
                      </td>
                      <td className="py-3 px-4 text-[#88918C] whitespace-nowrap">
                        {enq.createdAt.split('T')[0]}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <EnquiryStatusBadge status={enq.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/admin/enquiries?id=${enq.id}`}
                          className="font-bold text-[#246B45] hover:underline text-xs"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Product Overview (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#D8D5CB] rounded-lg shadow-subtle overflow-hidden">
          <div className="p-5 border-b border-[#E6E4DD] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#252A27]">
                Product Inventory Snapshot
              </h2>
              <p className="text-xs text-[#5C635F]">
                Featured and standard catalogue lines.
              </p>
            </div>
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-[#246B45] hover:underline inline-flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#E6E4DD]">
            {featuredProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-[#FAF9F6] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded bg-[#FAF9F6] border border-[#E6E4DD] overflow-hidden shrink-0">
                    <OptimizedImage
                      src={prod.image}
                      alt={prod.title}
                      aspectRatio="square"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#252A27] truncate">
                      {prod.title}
                    </div>
                    <div className="text-[11px] text-[#5C635F] truncate">
                      {prod.category}
                    </div>
                    <div className="mt-1">
                      <ProductStatusBadge status={prod.status} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Link
                    to={`/products/${prod.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-[#88918C] hover:text-[#252A27]"
                    title="View on public storefront"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. DEMO ENVIRONMENT CONTROLS
          ========================================================================= */}
      <div className="p-4 bg-white border border-[#D8D5CB] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#5C635F]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#246B45] shrink-0" />
          <span>
            Demonstration mock data is stored in your current browser session. Reset to restore original seed data.
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetDemoData}>
          Reset Demo Data
        </Button>
      </div>
    </div>
  );
};
