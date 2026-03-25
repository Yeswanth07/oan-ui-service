import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';

import { TableBody, TableHead, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  loading?: boolean;
  emptyMessage?: string | React.ReactNode;
  maxHeight?: string;
  minTableWidth?: string;
}
function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <table
      data-slot="table"
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  );
}
function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('sticky top-0 z-20 bg-gray-50 [&_tr]:border-b', className)}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'p-2 align-middle whitespace-normal break-words [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  );
}

export function DynamicTable<TData>({
  data,
  columns,
  loading,
  emptyMessage = 'No records found',
  maxHeight = '50vh',
  minTableWidth = '900px',
}: DynamicTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden bg-white">
      {loading ? (
        <div
          className={cn(
            'flex items-center justify-center ',
            `h-[${maxHeight}]`
          )}
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : data.length === 0 ? (
        <div
          className={cn(
            'flex items-center justify-center text-gray-500 text-sm',
            `h-[${maxHeight}]`
          )}
        >
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto relative" style={{ maxHeight }}>
          <Table
            className="table-fixed w-full"
            style={{ minWidth: minTableWidth }}
          >
            <TableHeader className="sticky top-0 z-10 bg-gray-50">
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-normal break-words leading-tight bg-gray-50"
                      style={{
                        width: header.getSize()
                          ? `${header.getSize()}px`
                          : 'auto',
                        minWidth: header.getSize()
                          ? `${header.getSize()}px`
                          : 'auto',
                        wordBreak: 'break-word',
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-6 py-4 text-sm text-gray-700 align-top"
                      style={{
                        width: cell.column.columnDef.size
                          ? `${cell.column.columnDef.size}px`
                          : 'auto',
                        minWidth: cell.column.columnDef.size
                          ? `${cell.column.columnDef.size}px`
                          : 'auto',
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default DynamicTable;
