"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filters?: {
    page: number;
    search: string;
    platform: string;
    country: string;
    version: string;
    identified: boolean;
  };
  setFilters?: (filters: Partial<{
    page: number;
    search: string;
    platform: string;
    country: string;
    version: string;
    identified: boolean;
  }>) => void;
  filterOptions?: {
    countries: string[];
    versions: string[];
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filters,
  setFilters,
  filterOptions,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      filters,
      setFilters,
      filterOptions,
    },
  });

  return (
    <div className="border">
      <Table className="table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const width = header.getSize();
                return (
                  <TableHead
                    key={header.id}
                    className="text-muted-foreground"
                    style={width !== 150 ? { width: `${width}px` } : undefined}
                  >
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => {
                  const width = cell.column.getSize();
                  return (
                    <TableCell
                      key={cell.id}
                      style={width !== 150 ? { width: `${width}px` } : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
