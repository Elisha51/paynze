
'use client';
import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  TableState,
  RowSelectionState,
  Row,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTableFacetedFilter } from '../ui/data-table-faceted-filter';
import { X, Search } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { AnimatePresence, motion } from 'framer-motion';

interface DataTableFilter {
  columnId: string;
  title: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filters?: DataTableFilter[];
  isLoading: boolean;
  emptyState?: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    cta?: React.ReactNode;
  };
  initialState?: Partial<TableState>;
  columnFilters?: ColumnFiltersState;
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  rowSelection?: RowSelectionState;
  setRowSelection?: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  toolbarActions?: (selectedRows: TData[]) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filters,
  isLoading,
  emptyState,
  initialState,
  columnFilters: externalColumnFilters,
  setColumnFilters: setExternalColumnFilters,
  rowSelection: externalRowSelection,
  setRowSelection: setExternalRowSelection,
  toolbarActions,
}: DataTableProps<TData, TValue>) {
  const [internalRowSelection, setInternalRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [internalColumnFilters, setInternalColumnFilters] = React.useState<ColumnFiltersState>(
    initialState?.columnFilters || []
  )
  const [sorting, setSorting] = React.useState<SortingState>(initialState?.sorting || [])
  const [globalFilter, setGlobalFilter] = React.useState(initialState?.globalFilter || '');
  
  const columnFilters = externalColumnFilters ?? internalColumnFilters;
  const setColumnFilters = setExternalColumnFilters ?? setInternalColumnFilters;
  const rowSelection = externalRowSelection ?? internalRowSelection;
  const setRowSelection = setExternalRowSelection ?? setInternalRowSelection;

  const table = useReactTable({
    data,
    columns,
    initialState,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })
  
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);

  return (
    <div className="w-full space-y-4">
       <div className="flex flex-wrap items-center justify-between gap-4">
            <AnimatePresence mode="wait">
              {selectedRows.length > 0 ? (
                  <motion.div
                      key="actions"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-2"
                  >
                      {toolbarActions && toolbarActions(selectedRows)}
                  </motion.div>
              ) : (
                  <motion.div
                      key="filters"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-wrap items-center gap-2"
                  >
                     <div className="relative flex-1 min-w-[200px] sm:min-w-[250px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search table..."
                            value={globalFilter ?? ''}
                            onChange={(event) => setGlobalFilter(String(event.target.value))}
                            className="pl-8"
                        />
                    </div>
                    {filters && filters.length > 0 && (
                      <div className="flex items-center gap-2">
                          {filters.map(filter => {
                              const column = table.getColumn(filter.columnId);
                              return column ? (
                                  <DataTableFacetedFilter
                                      key={filter.columnId}
                                      column={column}
                                      title={filter.title}
                                      options={filter.options}
                                  />
                              ) : null;
                          })}
                          {isFiltered && (
                              <Button
                                  variant="ghost"
                                  onClick={() => table.resetColumnFilters()}
                                  className="h-8 px-2 lg:px-3"
                              >
                                  Reset
                                  <X className="ml-2 h-4 w-4" />
                              </Button>
                          )}
                      </div>
                    )}
                  </motion.div>
              )}
          </AnimatePresence>
        </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isActionsColumn = header.id === 'actions';
                  return (
                    <TableHead key={header.id} className={isActionsColumn ? 'sticky right-0 bg-card z-10' : ''}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
                [...Array(10)].map((_, i) => (
                    <TableRow key={i}>
                        {columns.map((col, colIndex) => (
                            <TableCell key={`skel-cell-${i}-${colIndex}`}>
                                <Skeleton className="h-6" />
                            </TableCell>
                        ))}
                    </TableRow>
                ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isActionsColumn = cell.column.id === 'actions';
                    return (
                        <TableCell key={cell.id} className={isActionsColumn ? 'sticky right-0 bg-background z-10' : ''}>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                        </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-auto"
                >
                  {isFiltered ? (
                    <EmptyState
                      icon={<Search className="h-12 w-12 text-muted-foreground" />}
                      title="No Results Found"
                      description="No records match your current search query or filters. Try adjusting them to find what you're looking for."
                    />
                  ) : (emptyState ? (
                    <EmptyState 
                      icon={React.createElement(emptyState.icon, { className: "h-12 w-12 text-primary" })}
                      title={emptyState.title}
                      description={emptyState.description}
                      cta={emptyState.cta}
                    />
                  ) : (
                     <div className="text-center p-8">No data available.</div>
                  ))}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col-reverse items-center justify-between gap-4 py-4 sm:flex-row sm:gap-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
