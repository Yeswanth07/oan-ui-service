// src/components/common/Pagination.tsx
import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  // Optional features:
  showFirstLast?: boolean; // show First / Last buttons
  pageSize?: number; // current page size (for display)
  pageSizeOptions?: number[]; // if provided, render page-size selector
  onPageSizeChange?: (size: number) => void;
  siblingCount?: number; // how many pages to show on either side (default 1)
  className?: string;
  showQuickJump?: boolean; // show small "go to page" input
  compact?: boolean;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  showFirstLast = true,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  siblingCount = 1,
  className,
  showQuickJump = false,
  compact = false,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState<string>('');

  // Build visible pages with 'left'/'right' placeholders
  const visiblePages = useMemo(() => {
    const total = totalPages;
    const current = page;
    const siblings = Math.max(0, siblingCount);

    if (total <= 5 + siblings * 2) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | 'left' | 'right')[] = [];

    pages.push(1);

    const left = Math.max(2, current - siblings);
    const right = Math.min(total - 1, current + siblings);

    if (left > 2) pages.push('left');

    for (let p = left; p <= right; p++) pages.push(p);

    if (right < total - 1) pages.push('right');

    pages.push(total);

    return pages;
  }, [totalPages, page, siblingCount]);

  const handleGo = (p: number) => {
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    if (p === page) return;
    onPageChange(p);
  };

  const sizeClass = compact ? 'h-8 px-2 text-xs' : 'h-8 px-3 text-sm';
  const btnBase = `rounded-md ${sizeClass}`;

  return (
    <div
      className={cn('flex items-center gap-3 p-2 justify-center', className)}
    >
      {/* First */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            btnBase,
            'border-gray-200 text-gray-400 hover:bg-gray-50'
          )}
          onClick={() => handleGo(1)}
          disabled={page <= 1}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Prev */}
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => handleGo(page - 1)}
        className={cn(
          btnBase,
          'border-gray-200 text-gray-400 hover:bg-gray-50'
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Pages */}
      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
        {visiblePages.map((p, i) =>
          p === 'left' ? (
            // left ellipsis — open dropdown with pages between 2..left-1
            <DropdownMenu key={`left-${i}`}>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'px-3 text-sm h-8 flex items-center justify-center min-w-[40px] text-gray-500',
                    'hover:bg-gray-50'
                  )}
                  aria-label="More pages"
                >
                  ...
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-52 overflow-y-auto w-32">
                {/* Compute the range to display */}
                {(() => {
                  // find next numeric after this 'left' placeholder
                  const index = visiblePages.indexOf('left');
                  // leftRange: 2 .. visiblePages[index+1]-1
                  const next = visiblePages[index + 1];
                  const end =
                    typeof next === 'number'
                      ? next - 1
                      : Math.min(5, totalPages - 1);
                  const start = 2;
                  const items = [];
                  for (let x = start; x <= end; x++) items.push(x);
                  return items.map((pg) => (
                    <DropdownMenuItem
                      key={`left-page-${pg}`}
                      onSelect={(e: any) => {
                        e.preventDefault();
                        handleGo(pg);
                      }}
                    >
                      {pg}
                    </DropdownMenuItem>
                  ));
                })()}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : p === 'right' ? (
            // right ellipsis — dropdown with pages between previous+1 .. total-1
            <DropdownMenu key={`right-${i}`}>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'px-3 text-sm h-8 flex items-center justify-center min-w-[40px] text-gray-500',
                    'hover:bg-gray-50'
                  )}
                  aria-label="More pages"
                >
                  ...
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-52 overflow-y-auto w-32">
                {(() => {
                  const idx = visiblePages.indexOf('right');
                  const prev = visiblePages[idx - 1];
                  const start =
                    typeof prev === 'number' ? prev + 1 : Math.max(2, page + 2);
                  const items = [];
                  for (let x = start; x <= totalPages - 1; x++) items.push(x);
                  return items.map((pg) => (
                    <DropdownMenuItem
                      key={`right-page-${pg}`}
                      onSelect={(e: any) => {
                        e.preventDefault();
                        handleGo(pg);
                      }}
                    >
                      {pg}
                    </DropdownMenuItem>
                  ));
                })()}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              key={p}
              size="sm"
              variant={page === p ? 'default' : 'outline'}
              onClick={() => handleGo(Number(p))}
              className={cn(
                'h-8 w-8 p-0 text-xs border-0 shadow-none rounded-none',
                Number(p) !== 1 && 'border-l border-gray-200',
                page === p && 'text-primary bg-primary/20'
              )}
              aria-current={page === p ? 'page' : undefined}
              aria-label={`Go to page ${p}`}
            >
              {p}
            </Button>
          )
        )}
      </div>

      {/* Next */}
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => handleGo(page + 1)}
        className={cn(
          btnBase,
          'border-gray-200 text-gray-400 hover:bg-gray-50'
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Last */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          className={cn(
            btnBase,
            'border-gray-200 text-gray-400 hover:bg-gray-50'
          )}
          onClick={() => handleGo(totalPages)}
          disabled={page >= totalPages}
          aria-label="Go to last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}

      {/* Page size selector (optional) */}
      {pageSizeOptions && pageSizeOptions.length > 0 && onPageSizeChange && (
        <div className="flex items-center gap-2 ml-2">
          <div className="text-xs text-gray-500">Rows</div>
          <select
            aria-label="Select page size"
            className="h-8 px-2 rounded-md border border-gray-200 bg-white text-sm"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quick jump (optional) */}
      {showQuickJump && (
        <div className="flex items-center gap-2 ml-2">
          <span className="text-sm text-gray-600">Page</span>
          <div className="relative">
            <Input
              value={jumpValue}
              onChange={(e: any) =>
                setJumpValue(e.target.value.replace(/[^0-9]/g, ''))
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter' && jumpValue) {
                  const v = Number(jumpValue);
                  if (!Number.isNaN(v)) handleGo(v);
                  setJumpValue('');
                }
              }}
              placeholder={`${page}/${totalPages}`}
              className="w-20 h-8 text-sm"
              aria-label="Go to page"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const v = Number(jumpValue);
              if (!Number.isNaN(v)) {
                handleGo(v);
                setJumpValue('');
              }
            }}
            className="h-8 text-sm"
          >
            Go
          </Button>
        </div>
      )}
    </div>
  );
}
