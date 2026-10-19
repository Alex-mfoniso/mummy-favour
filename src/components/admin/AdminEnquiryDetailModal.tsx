import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  User, 
  Layers, 
  Lock, 
  Save, 
  Trash2, 
  Clock, 
  AlertCircle,
  Copy,
  Check,
  ShoppingBag
} from 'lucide-react';
import { AdminEnquiry, EnquiryStatus, AdminEnquiryNote } from '@/types/admin';
import { EnquiryStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Button } from '@/components/ui/Button';
import { enquiryService } from '@/services/enquiryService';

export interface AdminEnquiryDetailModalProps {
  enquiry: AdminEnquiry | null;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: EnquiryStatus) => void;
}

export const AdminEnquiryDetailModal: React.FC<AdminEnquiryDetailModalProps> = ({
  enquiry,
  onClose,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<EnquiryStatus>('new');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const handleCopyRef = () => {
    if (!enquiry?.reference) return;
    navigator.clipboard.writeText(enquiry.reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const getCustomerStatusInfo = (status: EnquiryStatus) => {
    switch (status) {
      case 'new':
        return { step: 'Step 1 of 4', label: 'Enquiry Received' };
      case 'in_review':
        return { step: 'Step 2 of 4', label: 'Under Technical Review' };
      case 'contacted':
        return { step: 'Step 3 of 4', label: 'Follow-up in Progress' };
      case 'quoted':
        return { step: 'Step 4 of 4', label: 'Quotation Prepared' };
      case 'closed':
        return { step: 'Archived', label: 'Enquiry Closed' };
      default:
        return { step: 'Step 1 of 4', label: 'Enquiry Received' };
    }
  };

  // Notes state
  const [notes, setNotes] = useState<AdminEnquiryNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  useEffect(() => {
    if (enquiry) {
      setSelectedStatus(enquiry.status);
      setNewNoteContent('');
      setNoteError(null);

      // Load live internal staff notes
      setNotesLoading(true);
      enquiryService.listAdminEnquiryNotes(enquiry.id)
        .then((fetchedNotes) => {
          setNotes(fetchedNotes);
        })
        .catch((err) => {
          console.error('Failed to load enquiry notes:', err);
          if (enquiry.notes) {
            setNotes(enquiry.notes);
          }
        })
        .finally(() => {
          setNotesLoading(false);
        });
    }
  }, [enquiry]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && enquiry) onClose();
    };
    if (enquiry) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [enquiry, onClose]);

  if (!enquiry) return null;

  const handleStatusChangeInternal = async (status: EnquiryStatus) => {
    setIsUpdatingStatus(true);
    try {
      setSelectedStatus(status);
      await onStatusChange(enquiry.id, status);
    } catch (err) {
      console.error('Failed to change status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    setIsAddingNote(true);
    setNoteError(null);
    try {
      const created = await enquiryService.createAdminEnquiryNote(enquiry.id, newNoteContent.trim());
      setNotes((prev) => [created, ...prev]);
      setNewNoteContent('');
    } catch (err: any) {
      setNoteError(err.message || 'Failed to save staff note.');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this internal note?')) {
      return;
    }

    try {
      await enquiryService.deleteAdminEnquiryNote(enquiry.id, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err: any) {
      setNoteError(err.message || 'Failed to delete staff note.');
    }
  };

  const formatType = (type: string) => {
    switch (type) {
      case 'quote_standard':
        return 'Standard Catalogue Quotation';
      case 'quote_custom':
        return 'Custom Packaging Requirement';
      case 'contact_general':
        return 'General Enquiry';
      default:
        return type;
    }
  };

  const items = (enquiry.items && enquiry.items.length > 0)
    ? enquiry.items
    : [
        {
          id: 'primary',
          enquiryId: enquiry.id,
          productName: enquiry.requestedProductName || enquiry.productSlug || 'General Packaging Inquiry',
          quantity: enquiry.quantity ? Number(enquiry.quantity) : null,
          unit: enquiry.unit,
          size: enquiry.specifications?.size,
          gauge: enquiry.specifications?.thickness,
          color: enquiry.specifications?.color,
          customPrinting: enquiry.specifications?.printing,
          specifications: enquiry.specifications,
        },
      ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
    >
      <div
        className="bg-white border border-[#D8D5CB] rounded-lg shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E6E4DD] flex items-start justify-between bg-white rounded-t-lg sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#246B45] font-mono">
                {enquiry.reference || `REF #${enquiry.id.substring(0, 8)}`}
              </span>
              {enquiry.reference && (
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-[#D8D5CB] bg-white text-[#5C635F] hover:text-[#246B45] hover:border-[#246B45] cursor-pointer"
                  title="Copy reference number to clipboard"
                >
                  {copiedRef ? (
                    <>
                      <Check className="w-3 h-3 text-[#246B45]" />
                      <span className="text-[#246B45] font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Ref</span>
                    </>
                  )}
                </button>
              )}
              <span className="text-[#D8D5CB]" aria-hidden="true">•</span>
              <span className="text-[11px] font-semibold text-[#5C635F]">
                {formatType(enquiry.type)}
              </span>
            </div>
            <h2 id="enquiry-modal-title" className="text-lg font-bold text-[#252A27]">
              {enquiry.subject}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-[#88918C] hover:text-[#252A27] hover:bg-[#F5F4EF]"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Status Bar & Management Controls */}
          <div className="p-4 bg-[#FAF9F6] border border-[#D8D5CB] rounded-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#5C635F]">Internal Status:</span>
                <EnquiryStatusBadge status={selectedStatus} />
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="enquiry-status-select" className="text-[#5C635F]">
                  Update Status:
                </label>
                <select
                  id="enquiry-status-select"
                  disabled={isUpdatingStatus}
                  value={selectedStatus}
                  onChange={(e) => handleStatusChangeInternal(e.target.value as EnquiryStatus)}
                  className="py-1 px-2 rounded border border-[#D8D5CB] bg-white text-xs font-semibold text-[#252A27] focus:outline-none focus:ring-1 focus:ring-[#246B45]"
                >
                  <option value="new">New</option>
                  <option value="in_review">In Review</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Customer Live Tracking View Indicator */}
            <div className="pt-2 border-t border-[#E6E4DD] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#5C635F] gap-1">
              <span>Customer Tracking View:</span>
              <span className="font-semibold text-[#246B45]">
                {getCustomerStatusInfo(selectedStatus).step} • {getCustomerStatusInfo(selectedStatus).label}
              </span>
            </div>
          </div>

          {/* Customer Profile Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#246B45] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Customer Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white border border-[#E6E4DD] rounded-md">
              <div>
                <span className="text-[#88918C] block text-[11px]">Customer Name</span>
                <span className="font-bold text-[#252A27] text-sm">{enquiry.customerName}</span>
              </div>

              <div>
                <span className="text-[#88918C] block text-[11px]">Business / Organization</span>
                <span className="font-medium text-[#252A27]">
                  {enquiry.businessName || '— (Individual Client)'}
                </span>
              </div>

              <div>
                <span className="text-[#88918C] block text-[11px]">Phone Number</span>
                <a
                  href={`tel:${enquiry.phone}`}
                  className="font-semibold text-[#246B45] hover:underline"
                >
                  {enquiry.phone}
                </a>
              </div>

              <div>
                <span className="text-[#88918C] block text-[11px]">Email Address</span>
                {enquiry.email ? (
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="font-semibold text-[#246B45] hover:underline truncate block"
                  >
                    {enquiry.email}
                  </a>
                ) : (
                  <span className="text-[#88918C]">— (Not provided)</span>
                )}
              </div>

              <div>
                <span className="text-[#88918C] block text-[11px]">Customer Type</span>
                <span className="capitalize text-[#252A27] font-semibold">
                  {enquiry.customerType.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <span className="text-[#88918C] block text-[11px]">Date Received</span>
                <span className="text-[#252A27]">
                  {new Date(enquiry.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Requested Order Specifications / Items */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#246B45] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Packaging Item Requirements ({items.length})</span>
            </h3>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="p-4 bg-white border border-[#E6E4DD] rounded-md space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-[#88918C] uppercase font-bold tracking-wider block">
                        Item #{idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-[#252A27]">
                        {item.productName}
                      </h4>
                    </div>
                    {item.quantity && (
                      <span className="px-2.5 py-1 bg-[#FAF9F6] border border-[#E6E4DD] rounded text-xs font-bold text-[#246B45]">
                        {item.quantity.toLocaleString()} {item.unit || 'units'}
                      </span>
                    )}
                  </div>

                  {/* Item technical specifications */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#F0EFEA] text-[11px]">
                    {item.size && (
                      <div className="p-2 bg-[#FAF9F6] rounded border border-[#E6E4DD]">
                        <span className="text-[10px] text-[#88918C] block">Size</span>
                        <span className="font-semibold text-[#252A27]">{item.size}</span>
                      </div>
                    )}
                    {item.gauge && (
                      <div className="p-2 bg-[#FAF9F6] rounded border border-[#E6E4DD]">
                        <span className="text-[10px] text-[#88918C] block">Gauge / Thickness</span>
                        <span className="font-semibold text-[#252A27]">{item.gauge}</span>
                      </div>
                    )}
                    {item.color && (
                      <div className="p-2 bg-[#FAF9F6] rounded border border-[#E6E4DD]">
                        <span className="text-[10px] text-[#88918C] block">Colour</span>
                        <span className="font-semibold text-[#252A27]">{item.color}</span>
                      </div>
                    )}
                    {item.customPrinting && (
                      <div className="p-2 bg-[#FAF9F6] rounded border border-[#E6E4DD]">
                        <span className="text-[10px] text-[#88918C] block">Printing</span>
                        <span className="font-semibold text-[#252A27] capitalize">{item.customPrinting}</span>
                      </div>
                    )}
                  </div>

                  {item.specifications && Object.keys(item.specifications).length > 0 && (
                    <div className="pt-2 text-[11px] text-[#5C635F]">
                      {item.specifications.intendedUse && (
                        <div><span className="font-semibold text-[#252A27]">Application:</span> {item.specifications.intendedUse}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Customer Notes */}
              <div className="p-4 bg-white border border-[#E6E4DD] rounded-md space-y-1">
                <span className="text-[#88918C] block text-[11px] font-semibold">Customer Message / Delivery Notes:</span>
                <p className="p-3 bg-[#FAF9F6] rounded text-[#252A27] text-xs leading-relaxed border border-[#E6E4DD]">
                  {enquiry.customerNotes || 'No additional message provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* Real Internal Staff Notes (Database Persisted) */}
          <div className="space-y-3 pt-2 border-t border-[#E6E4DD]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#246B45] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Internal Staff Notes ({notes.length})</span>
              </h3>
              <span className="text-[10px] text-[#88918C]">
                *Restricted to authenticated staff
              </span>
            </div>

            {noteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{noteError}</span>
              </div>
            )}

            {/* Note Creation Form */}
            <form onSubmit={handleCreateNote} className="space-y-2">
              <textarea
                rows={3}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Add production feasibility notes, machine scheduling notes, or customer contact log..."
                className="w-full p-3 rounded border border-[#D8D5CB] text-xs text-[#252A27] focus:outline-none focus:ring-1 focus:ring-[#246B45] focus:border-[#246B45]"
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isAddingNote || !newNoteContent.trim()}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  {isAddingNote ? 'Saving...' : 'Add Internal Note'}
                </Button>
              </div>
            </form>

            {/* Note List */}
            <div className="space-y-2 pt-2">
              {notesLoading && (
                <div className="p-3 text-center text-xs text-[#88918C]">
                  Loading staff notes...
                </div>
              )}

              {!notesLoading && notes.length === 0 && (
                <div className="p-3 text-center text-xs text-[#88918C] bg-[#FAF9F6] border border-[#E6E4DD] rounded">
                  No internal notes recorded yet.
                </div>
              )}

              {notes.map((note) => (
                <div key={note.id} className="p-3 bg-[#FAF9F6] border border-[#E6E4DD] rounded-md space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-[#88918C]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#252A27]">
                        {note.author?.name || 'Staff Member'}
                      </span>
                      {note.author?.role && (
                        <span className="px-1.5 py-0.2 bg-[#EAF3ED] text-[#246B45] font-semibold text-[10px] rounded">
                          {note.author.role}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px]">
                        <Clock className="w-3 h-3" />
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-[#88918C] hover:text-red-600 p-0.5 rounded cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[#252A27] whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E4DD] flex items-center justify-between bg-[#FAF9F6] rounded-b-lg">
          <span className="text-[11px] text-[#88918C] font-mono">
            {enquiry.reference ? `Reference: ${enquiry.reference}` : `ID: ${enquiry.id}`}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
              onClick={() => {
                navigate(`/admin/orders?convertEnquiryId=${enquiry.id}`);
                onClose();
              }}
            >
              Convert to Order
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close Record
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
