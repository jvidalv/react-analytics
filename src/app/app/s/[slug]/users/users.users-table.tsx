import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAnalyticsUsers } from "@/domains/app/users/users.api";
import { getUserName } from "@/domains/app/users/users.utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TooltipWrapper } from "@/components/custom/tooltip-wrapper";
import AndroidIcon from "@/components/custom/android-icon";
import IosIcon from "@/components/custom/ios-icon";
import { cn } from "@/lib/utils";
import { useDebouncedQueryParam } from "@/hooks/use-debounce-query-param";
import countries from "@/lib/countries";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { getColor } from "@/lib/colors";
import { SearchFilterInput } from "@/components/custom/input-search";

const pageSize = 10;

export function UsersUsersTable({ apiKey }: { apiKey?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const query = searchParams.get("query") || "";
  const identifyId = searchParams.get("identifyId");

  const analyticsUsers = useAnalyticsUsers(apiKey, page, pageSize, { query });
  const setQueryParamDebounced = useDebouncedQueryParam(300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQueryParamDebounced("query", value, searchParams, (url) =>
      router.push(`${pathname}${url}`, { scroll: false }),
    );
  };

  const totalPages = analyticsUsers?.totalCount
    ? Math.ceil(analyticsUsers?.totalCount / pageSize)
    : 1;

  const createPageHref = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", targetPage.toString());
    return `?${params.toString()}`;
  };

  const baseSize = (page - 1) * pageSize + 1;

  return (
    <div className="divide-y overflow-hidden rounded-lg border">
      <div className="flex items-center py-1.5 pl-2 pr-4">
        <SearchFilterInput
          defaultValue={query}
          placeholder="Search by name, email, actions, errors..."
          className="focus-active:border-none w-full rounded-none border-none focus:outline-none focus:ring-0 focus-visible:ring-0"
          onChange={handleInputChange}
        />
        <div className="flex gap-1 text-xs text-muted-foreground">
          <span className="whitespace-nowrap text-foreground">
            {baseSize} to {baseSize - 1 + (analyticsUsers?.pageSize || 0)}
          </span>
          <span>of</span>
          <span>{analyticsUsers.totalCount}</span>
        </div>
      </div>
      {!analyticsUsers?.data?.length &&
        !!query &&
        !analyticsUsers?.isLoading && (
          <div className="p-4 text-muted-foreground">
            No results for given search.
          </div>
        )}
      {analyticsUsers?.data?.map((user) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("identifyId", user.identifyId);

        const name = getUserName(user);
        const email = user?.userInformation?.email;
        const emailEqualsName = email === name;
        const lastSeen = formatDistanceToNow(new Date(user.lastUpdate), {
          addSuffix: true,
        });

        const isSelected = identifyId === user.identifyId;
        const identified = user.userId;

        const isApple = user.deviceInformation.platform === "ios";
        const isAndroid = user.deviceInformation.platform === "android";

        const country = countries.find(
          (c) => c.code === user.deviceInformation?.requestMetadata?.country,
        );

        return (
          <Link
            href={`?${params.toString()}`}
            scroll={false}
            key={user.identifyId}
            className={cn(
              "flex items-center justify-between p-4 transition-all hover:bg-neutral-900",
              isSelected && "bg-neutral-900",
            )}
          >
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={user?.userInformation?.avatarUrl} />
                <AvatarFallback className={getColor(user?.identifyId)}>
                  {identified ? name?.[0] || "U" : "🥷"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="sensitive">{name}</div>
                {email && !emailEqualsName && (
                  <div className="sensitive text-sm text-muted-foreground">
                    {email}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user.active ? (
                <Badge className="border-0 bg-green-500 font-bold text-green-900">
                  Online
                </Badge>
              ) : (
                <time className="text-sm text-muted-foreground">
                  {lastSeen}
                </time>
              )}
              <div className="flex items-center justify-between gap-2 rounded border px-2 py-px">
                {isAndroid && <AndroidIcon className="size-4" />}
                {isApple && <IosIcon className="size-4" />}
                <div className="-my-2 h-[28px] w-px bg-border" />
                {country && (
                  <TooltipWrapper content={country.name} asChild>
                    <span className="">{country.emoji}</span>
                  </TooltipWrapper>
                )}
              </div>

              <Badge variant="outline">
                <span className="mr-1 text-muted-foreground">Version</span>
                <span className="mt-0.5 font-mono">{user.appVersion}</span>
              </Badge>
            </div>
          </Link>
        );
      })}
      {totalPages > 1 && (
        <Pagination className="py-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={createPageHref(page - 1)}
                aria-disabled={page <= 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;
              const isActive = pageNumber === page;
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                Math.abs(pageNumber - page) <= 1
              ) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href={createPageHref(pageNumber)}
                      isActive={isActive}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              if (
                Math.abs(pageNumber - page) === 2 &&
                (pageNumber === 2 || pageNumber === totalPages - 1)
              ) {
                return (
                  <PaginationItem key={`ellipsis-${pageNumber}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}
            <PaginationItem>
              <PaginationNext
                href={createPageHref(page + 1)}
                aria-disabled={page >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
