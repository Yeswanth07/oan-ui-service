import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

type ConfirmDeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => Promise<void> | void;
  /**
   * Optional: show a smaller layout (for dropdowns / small screens)
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Icon type: 'trash' (red) or 'alert' (orange)
   */
  iconType?: 'trash' | 'alert';
};

export default function ConfirmDeleteModal({
  open,
  onOpenChange,
  title = 'Confirm Delete',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  size = 'md',
  iconType = 'trash',
}: ConfirmDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await Promise.resolve(onConfirm());
      onOpenChange(false);
    } catch (err) {
      console.error('ConfirmDeleteModal error:', err);
      setIsDeleting(false);
    }
  };

  const maxWidth =
    size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-md';

  const iconBgColor = iconType === 'trash' ? 'bg-red-50' : 'bg-orange-50';
  const iconColor = iconType === 'trash' ? 'text-red-600' : 'text-orange-600';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={`w-full ${maxWidth} bg-white rounded-[24px] border-0 p-6 shadow-lg`}
        aria-label="Confirm delete dialog"
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`p-2.5 rounded-lg ${iconBgColor} flex-shrink-0`}>
              {iconType === 'trash' ? (
                <svg
                  className={`w-5 h-5 ${iconColor}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              ) : (
                <AlertCircle className={`w-5 h-5 ${iconColor}`} />
              )}
            </div>

            {/* Title */}
            <div className="flex-1">
              <DialogTitle className="text-[18px] font-semibold text-gray-900">
                {title}
              </DialogTitle>
            </div>
          </div>

          {/* Description */}
          <DialogDescription className="text-[14px] text-[#6D6D6D] ml-10 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-8">
          <Button
            variant="outline"
            onClick={() => !isDeleting && onOpenChange(false)}
            className="border-[#ECEAFD] bg-[#ECEAFD] text-[#683BD4] text-[14px] font-medium rounded-[12px] h-[42px] px-6 hover:bg-[#ddd6f3] transition-colors disabled:opacity-60"
            disabled={isDeleting || loading}
          >
            {cancelLabel}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={isDeleting || loading}
            className={`bg-[#683BD4] hover:bg-[#5a3db8] text-[14px] font-medium text-white rounded-[12px] h-[42px] px-6 transition-all duration-200 ${
              isDeleting || loading
                ? 'cursor-not-allowed opacity-80'
                : 'cursor-pointer'
            }`}
          >
            {isDeleting || loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Deleting...
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
