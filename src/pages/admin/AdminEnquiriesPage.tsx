import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Phone, 
  Mail,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EnquiryStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminEnquiryDetailModal } from '@/components/admin/AdminEnquiryDetailModal';
import { enquiryService } from '@/services/enquiryService';
import { AdminEnquiry, EnquiryStatus } from '@/types/admin';

export const AdminEnquiriesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Active Enquiry modal
  const [activeEnquiry, setActiveEnquiry] = useState<AdminEnquiry | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);

  const handleCopyReference = (ref: string | undefined, id: string) => {
    if (!ref) return;
    navigator.clipboard.writeText(ref);
    setCopiedRefId(id);
    setTimeout(() => setCopiedRefId(null), 2500);
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await enquiryService.listAdminEnquiries({
        page,
        limit,
        search: debouncedSearch,
        type: typeFilter,
        status: statusFilter,
      });
      setEnquiries(res.enquiries);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (err: any) {
      console.error('Failed to load enquiries:', err);
      setError(err.message || 'Unable to retrieve enquiries from server.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, typeFilter, statusFilter]);

  useEffect(() => {
    document.title = 'Enquiry Management | Divine Favour Internal Console';
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Support ?id=... deep link
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      enquiryService.getAdminEnquiry(idParam)
        .then((found) => {
          if (found) setActiveEnquiry(found);
        })
        .catch(() => {
          // Fall back to looking in loaded list
          const found = enquiries.find((e) => e.id === idParam || e.reference === idParam);
          if (found) setActiveEnquiry(found);
        });
    }
  }, [searchParams, enquiries]);

  const showNotice = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  const handleOpenDetail = async (enq: AdminEnquiry) => {
    try {
      // Fetch full details with notes & items
      const full = await enquiryService.getAdminEnquiry(enq.id);
      setActiveEnquiry(full);
      setSearchParams({ id: full.id }, { replace: true });
    } catch {
      setActiveEnquiry(enq);
      setSearchParams({ id: enq.id }, { replace: true });
    }
  };

  const handleCloseDetail = () => {
    setActiveEnquiry(null);
    searchParams.delete('id');
    setSearchParams(searchParams, { replace: true });
  };

  const handleStatusChange = async (id: string, newStatus: EnquiryStatus) => {
    try {
      const updated = await enquiryService.updateAdminEnquiryStatus(id, newStatus);
      setActiveEnquiry(updated);
      setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      showNotice(`Enquiry ${updated.reference || id} status updated to "${newStatus.replace('_', ' ')}".`);
    } catch (err: any) {
      showNotice(`Failed to update status: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="border-b border-[#E6E4DD] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#246B45]">
            COMMERCIAL ENQUIRIES & LEADS
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252A27]">
            Enquiry Management
          </h1>
          <p className="text-xs sm:text-sm text-[#5C635F] mt-1">
            Review packaging quote requests, customer specifications, and manage internal follow-up statuses.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchEnquiries}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Local Feedback Banner */}
      {bannerNotice && (
        <div className="p-3 bg-[#EAF3ED] border border-[#BADBC5] rounded-md text-xs text-[#1D5838] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#246B45] shrink-0" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* Error alert banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* =========================================================================
          SEARCH & FILTER BAR
          ========================================================================= */}
      <div className="bg-white border border-[#D8D5CB] p-4 rounded-lg shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#88918C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by reference, customer name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded border border-[#D8D5CB] focus:outline-none focus:ring-1 focus:ring-[#246B45] focus:border-[#246B45]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#5C635F]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs py-2 px-2.5 rounded border border-[#D8D5CB] bg-white text-[#252A27] focus:outline-none focus:ring-1 focus:ring-[#246B45]"
            aria-label="Filter by enquiry type"
          >
            <option value="all">All Types</option>
            <option value="quote_standard">Standard Quote</option>
            <option value="quote_custom">Custom Requirement</option>
            <option value="contact_general">General Enquiry</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs py-2 px-2.5 rounded border border-[#D8D5CB] bg-white text-[#252A27] focus:outline-none focus:ring-1 focus:ring-[#246B45]"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in_review">In Review</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="closed">Closed</option>
          </select>

          {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
                setPage(1);
              }}
              className="text-xs text-[#246B45] hover:underline px-1 py-1 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          ENQUIRIES LIST TABLE
          ========================================================================= */}
      <div className="bg-white border border-[#D8D5CB] rounded-lg shadow-subtle overflow-hidden">
        {loading && (
          <div className="p-12 text-center text-xs text-[#5C635F] flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#246B45]" />
            <span>Loading customer enquiries...</span>
          </div>
        )}

        {!loading && enquiries.length === 0 ? (
          <div className="p-10">
            <AdminEmptyState
              title="No Enquiries Found"
              description="No enquiry records match your current search criteria or status filters."
              action={{
                label: 'Reset Filters',
                onClick: () => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setStatusFilter('all');
                  setPage(1);
                },
              }}
            />
          </div>
        ) : !loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#E6E4DD] text-[#5C635F] font-semibold">
                  <th className="py-3 px-4">Reference & Customer</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Subject & Requirements</th>
                  <th className="py-3 px-4">Date Received</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E4DD]">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#FAF9F6] transition-colors">
                    {/* Reference & Customer Name */}
                    <td className="py-3 px-4 font-semibold text-[#252A27]">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#246B45]">
                        <span>{enq.reference || `ID-${enq.id.substring(0, 8)}`}</span>
                        {enq.reference && (
                          <button
                            type="button"
                            onClick={() => handleCopyReference(enq.reference, enq.id)}
                            className="p-0.5 text-[#88918C] hover:text-[#246B45] transition-colors rounded cursor-pointer"
                            title="Copy reference code"
                          >
                            {copiedRefId === enq.id ? (
                              <Check className="w-3 h-3 text-[#246B45]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="text-xs font-bold text-[#252A27]">
                        {enq.customerName}
                      </div>
                      <div className="text-[11px] text-[#88918C]">
                        {enq.businessName || 'Individual Customer'}
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-[#252A27]">
                        <Phone className="w-3 h-3 text-[#246B45]" />
                        <span>{enq.phone}</span>
                      </div>
                      {enq.email && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#88918C]">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[140px]">{enq.email}</span>
                        </div>
                      )}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-[#5C635F] bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E6E4DD]">
                        {enq.type === 'quote_standard'
                          ? 'Standard Quote'
                          : enq.type === 'quote_custom'
                          ? 'Custom Order'
                          : 'General Enquiry'}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="py-3 px-4 text-[#252A27] max-w-[200px]">
                      <div className="truncate font-medium">{enq.subject}</div>
                      {enq.requestedProductName && (
                        <div className="text-[11px] text-[#246B45] font-semibold truncate">
                          {enq.requestedProductName}
                        </div>
                      )}
                      {enq.quantity && (
                        <div className="text-[11px] text-[#88918C]">
                          Qty: {enq.quantity} {enq.unit || 'units'}
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-[#88918C] whitespace-nowrap">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <EnquiryStatusBadge status={enq.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetail(enq)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        className="h-7 text-xs"
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Pagination Bar */}
        <div className="p-3.5 bg-[#FAF9F6] border-t border-[#E6E4DD] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5C635F]">
          <span>
            Showing {enquiries.length} of {total} enquiries {totalPages > 1 && `(Page ${page} of ${totalPages})`}
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                rightIcon={<ChevronRight className="w-3.5 h-3.5 ml-1" />}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          DETAIL MODAL
          ========================================================================= */}
      <AdminEnquiryDetailModal
        enquiry={activeEnquiry}
        onClose={handleCloseDetail}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
