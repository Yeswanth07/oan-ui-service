import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface CopyableCellProps {
  value: string;
  toastMessage?: string;
  tooltipText?: string;
  className?: string;
  isMono?: boolean; // For monospace font (phone numbers)
  onCopySuccess?: () => void;
  onCopyError?: () => void;
}

export function CopyableCell({
  value,
  toastMessage = 'Copied to clipboard',
  tooltipText = 'Click to copy',
  className = '',
  isMono = false,
  onCopySuccess,
  onCopyError,
}: CopyableCellProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      toast.success( 'Copied!', {description: toastMessage});
      onCopySuccess?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Could not copy to clipboard');
      console.error(err);
      onCopyError?.();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Make button shrinkable and prevent it from overflowing the cell */}
          <button
            onClick={handleCopy}
            className={`group text-sm text-gray-700 hover:text-blue-600 flex items-center gap-2 transition-colors
              min-w-0 overflow-hidden text-left ${isMono ? 'font-mono' : ''} ${className}`}
            aria-label={`Copy ${value}`}
            title={value} // show full value on hover (native)
            // inline styles are optional but ensure correct shrink behaviour in tricky table layouts
            style={{ maxWidth: '100%' }}
          >
            {/* Truncate the value and force it to stay on single line */}
            <span className="truncate block max-w-full">{value}</span>

            {/* icon should not expand layout — keep it flex-shrink-0 */}
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            ) : (
              <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {tooltipText}: {value}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
interface TruncatedTextCellProps {
  value: string;
  maxWidth?: string;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  showTooltipAlways?: boolean;
}

export function TruncatedTextCell({
  value,
  maxWidth = 'max-w-xs',
  tooltipSide = 'top',
  className = '',
  showTooltipAlways = false,
}: TruncatedTextCellProps) {
  if (!value) {
    return <span className="text-sm text-gray-500">—</span>;
  }

  const shouldShowTooltip = showTooltipAlways || value.length > 30;

  if (!shouldShowTooltip) {
    return (
      <span className={`text-sm text-gray-700 ${className}`}>{value}</span>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`text-sm text-gray-700 truncate block ${maxWidth} cursor-help ${className}`}
          >
            {value}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side={tooltipSide}
          className="max-w-sm break-words text-xs"
        >
          {value}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface EmptyStateCellProps {
  message?: string;
  className?: string;
}

export function EmptyStateCell({
  message = 'N/A',
  className = '',
}: EmptyStateCellProps) {
  return (
    <span className={`text-sm text-gray-500 ${className}`}>{message}</span>
  );
}

interface AvatarTextCellProps {
  name: string;
  showUnassigned?: boolean;
  avatarColor?: 'primary' | 'purple' | 'blue' | 'pink' | 'green' | 'indigo';
  showTooltip?: boolean;
}

const avatarColorClasses = {
  purple: 'bg-purple-200 text-purple-700',
  blue: 'bg-blue-200 text-blue-700',
  pink: 'bg-pink-200 text-pink-700',
  green: 'bg-green-200 text-green-700',
  indigo: 'bg-indigo-200 text-indigo-700',
  primary: 'bg-primary/20 text-primary',
};

export function AvatarTextCell({
  name,
  showUnassigned = true,
  avatarColor = 'purple',
  showTooltip = true,
}: AvatarTextCellProps) {
  const displayName =
    !name || name === 'N/A' ? (showUnassigned ? 'Unassigned' : 'N/A') : name;
  const initial = name && name !== 'N/A' ? name.charAt(0).toUpperCase() : '-';

  const content = (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${avatarColorClasses[avatarColor]}`}
      >
        <span className="text-xs font-semibold">{initial}</span>
      </div>
      <span className="text-sm text-gray-700 truncate max-w-xs">
        {displayName}
      </span>
    </div>
  );

  if (!showTooltip || displayName.length < 10) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{content}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {displayName}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const InfoCell = ({
  value,
  width = '320px',
}: {
  value: string;
  width?: string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="max-w-[250px] cursor-help">
            <p
              className="text-sm text-gray-800 line-clamp-2 overflow-hidden"
              title={value}
            >
              {value}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-md p-0">
          <div
            className={`w-[${width}] max-h-44 overflow-y-auto p-3 bg-white rounded-md border border-gray-200 text-sm text-gray-800`}
          >
            {value}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
