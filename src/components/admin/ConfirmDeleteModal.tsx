import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemIdentifier?: string;
  warningNote?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  message,
  itemIdentifier,
  warningNote,
  confirmLabel = 'Delete Record',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div
        className="bg-white border border-[#D8D5CB] rounded-lg shadow-xl max-w-md w-full p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 text-red-600">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 id="confirm-delete-title" className="text-base font-bold text-[#252A27]">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded text-[#88918C] hover:text-[#252A27] hover:bg-[#F5F4EF]"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-[#5C635F]">
          <p>{message}</p>
          {itemIdentifier && (
            <div className="p-2.5 bg-[#F5F4EF] rounded border border-[#E6E4DD] font-mono text-xs text-[#252A27] truncate">
              {itemIdentifier}
            </div>
          )}

          {warningNote && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{warningNote}</span>
            </div>
          )}

          <p className="text-[11px] text-[#88918C]">
            Notice: In this frontend demo, this action will remove the record from your current browser demonstration session.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
