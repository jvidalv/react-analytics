"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useMe } from "@/domains/user/me.api";
import { useUsersList } from "@/domains/app/users/users-list.api";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTitle } from "@/hooks/use-title";

const TableSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-full max-w-sm" />
    <div className="rounded-md border">
      <div className="p-4">
        <Skeleton className="h-10 w-full" />
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-t p-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
    <div className="flex justify-end gap-2">
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-9 w-20" />
    </div>
  </div>
);

export default function UsersPage() {
  useTitle("Users");
  const params = useParams();
  const appSlug = params.slug as string;
  const { me } = useMe();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { usersList, isLoading } = useUsersList(
    appSlug,
    me?.devModeEnabled,
    page,
    debouncedSearch
  );

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearch(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  };

  if (isLoading && !usersList) {
    return (
      <div className="mx-auto max-w-7xl">
        <TableSkeleton />
      </div>
    );
  }

  const users = usersList?.users ?? [];
  const pagination = usersList?.pagination;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-sm"
          />
          {pagination && (
            <div className="ml-auto text-sm text-muted-foreground">
              Showing {((page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} users
            </div>
          )}
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <DataTable columns={columns} data={users} />

            {/* Server-side pagination controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
