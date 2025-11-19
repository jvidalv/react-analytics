"use client";

import { useParams } from "next/navigation";
import { useMe } from "@/domains/user/me.api";
import { useUsersList } from "@/domains/app/users/users-list.api";
import { useUsersFilters } from "@/domains/app/users/users-filters.api";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTitle } from "@/hooks/use-title";
import {
  useQueryStates,
  parseAsInteger,
  parseAsString,
  parseAsBoolean,
} from "nuqs";
import { countryCodeToFlag, getCountryName } from "@/lib/country-utils";

const FiltersSkeleton = () => (
  <div className="flex items-center gap-2">
    <Skeleton className="h-9 w-[100px]" />
    <Skeleton className="h-9 w-full max-w-32" />
    <Skeleton className="h-9 w-[150px]" />
    <Skeleton className="h-9 w-[150px]" />
    <Skeleton className="h-9 w-[150px]" />
    <div className="ml-auto">
      <Skeleton className="h-4 w-[200px]" />
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="border">
      {/* Table header */}
      <div className="flex items-center border-b px-4 h-12">
        <div className="flex-1">
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="w-[110px]">
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="w-[130px]">
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="w-[90px]">
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="w-[120px]">
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="w-[100px] flex justify-end">
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Table rows */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center border-t px-4 h-16">
          {/* Name column */}
          <div className="flex-1 flex items-center gap-3">
            <Skeleton className="size-10" />
            <div>
              <Skeleton className="h-4 w-32 mb-1.5" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          {/* Platform column */}
          <div className="w-[110px]">
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Country column */}
          <div className="w-[130px]">
            <Skeleton className="h-4 w-20" />
          </div>
          {/* Version column */}
          <div className="w-[90px]">
            <Skeleton className="h-4 w-12" />
          </div>
          {/* Last Seen column */}
          <div className="w-[120px]">
            <Skeleton className="h-4 w-20" />
          </div>
          {/* Actions column */}
          <div className="w-[100px] flex justify-end gap-2">
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function UsersPage() {
  useTitle("Users");
  const params = useParams();
  const appSlug = params.slug as string;
  const { me } = useMe();

  const [filters, setFilters] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      search: parseAsString.withDefault(""),
      platform: parseAsString.withDefault(""),
      country: parseAsString.withDefault(""),
      version: parseAsString.withDefault(""),
      identified: parseAsBoolean.withDefault(true),
    },
    {
      history: "push",
      shallow: false,
    },
  );

  const { usersList, isLoading } = useUsersList(
    appSlug,
    me?.devModeEnabled,
    filters.page,
    filters.search,
    filters.platform,
    filters.country,
    filters.version,
    filters.identified,
  );

  const { filters: filterOptions } = useUsersFilters(
    appSlug,
    me?.devModeEnabled,
  );

  if (isLoading && !usersList) {
    return (
      <div className="mx-auto max-w-7xl space-y-4">
        <FiltersSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  const users = usersList?.users ?? [];
  const pagination = usersList?.pagination;

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex items-center gap-2">
        <Tabs
          value={filters.identified ? "identified" : "anonymous"}
          onValueChange={(value) => {
            void setFilters({ identified: value === "identified", page: 1 });
          }}
        >
          <TabsList>
            <TabsTrigger value="identified" className="px-4">
              🪪
            </TabsTrigger>
            <TabsTrigger value="anonymous" className="px-4">
              🤖
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
          className="max-w-32"
        />

        <Select
          value={filters.platform || "all"}
          onValueChange={(value) => {
            setFilters({ platform: value === "all" ? "" : value, page: 1 });
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="iOS">iOS</SelectItem>
            <SelectItem value="Android">Android</SelectItem>
            <SelectItem value="Web">Web</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.country || "all"}
          onValueChange={(value) => {
            setFilters({ country: value === "all" ? "" : value, page: 1 });
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {filterOptions?.countries?.map((country) => (
              <SelectItem key={country} value={country}>
                <div className="flex w-full items-center justify-between gap-2">
                  <span>{getCountryName(country)}</span>
                  <span>{countryCodeToFlag(country)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.version || "all"}
          onValueChange={(value) => {
            setFilters({ version: value === "all" ? "" : value, page: 1 });
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Version" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Versions</SelectItem>
            {filterOptions?.versions?.map((version) => (
              <SelectItem key={version} value={version}>
                {version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {pagination && (
          <div className="ml-auto text-sm text-muted-foreground">
            <span className="text-foreground">
              {(filters.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="text-foreground">
              {Math.min(filters.page * pagination.limit, pagination.total)}
            </span>{" "}
            of {pagination.total} users
          </div>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={users}
            filters={filters}
            setFilters={setFilters}
            filterOptions={filterOptions}
          />

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
