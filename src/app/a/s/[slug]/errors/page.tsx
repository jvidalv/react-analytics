"use client";

import { useParams } from "next/navigation";
import { useMe } from "@/domains/user/me.api";
import { useErrorsList } from "@/domains/app/errors/errors.api";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTitle } from "@/hooks/use-title";
import { Bug, CircleDot, Eye, Inbox } from "lucide-react";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";

const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="border">
      <div className="flex items-center border-b px-2 h-12">
        <div className="flex-1">
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="w-[100px]">
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="w-[100px]">
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="w-[120px]">
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="w-[120px] flex justify-end">
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center border-t px-2 h-16">
          <div className="flex-1">
            <Skeleton className="h-4 w-48 mb-1.5" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="w-[100px]">
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="w-[100px]">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="w-[120px]">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="w-[120px] flex justify-end gap-2">
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function ErrorsPage() {
  useTitle("Errors");
  const params = useParams();
  const appSlug = params.slug as string;
  const { me } = useMe();

  const [filters, setFilters] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      status: parseAsString.withDefault(""),
      errorId: parseAsString,
    },
    {
      history: "push",
      shallow: false,
    },
  );

  const { errorsList, isLoading } = useErrorsList(
    appSlug,
    me?.devModeEnabled,
    filters.page,
    filters.status,
  );

  const errors = errorsList?.errors ?? [];
  const pagination = errorsList?.pagination;

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex items-center gap-2">
        <Tabs
          value={filters.status || "all"}
          onValueChange={(value) => {
            void setFilters({ status: value === "all" ? "" : value, page: 1 });
          }}
        >
          <TabsList>
            <TabsTrigger value="all">
              <Inbox className="size-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="new">
              <CircleDot className="size-4" />
              New
            </TabsTrigger>
            <TabsTrigger value="seen">
              <Eye className="size-4" />
              Seen
            </TabsTrigger>
            <TabsTrigger value="fixed">
              <Bug className="size-4" />
              Fixed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {pagination && (
          <div className="ml-auto text-sm text-muted-foreground">
            {pagination.total} errors
          </div>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={errors}
            appSlug={appSlug}
            errorId={filters.errorId}
            onErrorIdChange={(id) => setFilters({ errorId: id })}
          />

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFilters({ page: Math.max(1, filters.page - 1) })
                  }
                  disabled={filters.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFilters({
                      page: Math.min(pagination.totalPages, filters.page + 1),
                    })
                  }
                  disabled={filters.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
