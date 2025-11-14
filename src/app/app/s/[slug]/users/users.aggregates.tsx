import { Fragment, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAnalyticsAggregates,
  AggregateType,
  useAnalyticsUserStats,
} from "@/domains/app/users/stats/users-stats.api";
import countries from "@/lib/countries";
import {
  Ban,
  ChartLineIcon,
  MousePointerClick,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import IosIcon from "@/components/ui/ios-icon";
import AndroidIcon from "@/components/ui/android-icon";
import { TooltipWrapper } from "@/components/ui/tooltip";

const aggregateTypeOptions = [
  {
    label: "Stats",
    value: "stats",
    icon: ChartLineIcon,
    color: "text-foreground border-foreground/50",
  },
  {
    label: "Navigation",
    value: "navigation",
    icon: Navigation,
    color: "text-muted-foreground",
  },
  {
    label: "Actions",
    value: "action",
    icon: MousePointerClick,
    color: "border-purple-500 text-purple-500",
  },
  {
    label: "Errors",
    value: "error",
    icon: Ban,
    color: "border-red-500 text-red-500",
  },
];

export function UsersAggregates({ apiKey }: { apiKey?: string }) {
  const [type, setType] = useState<AggregateType | "stats">("stats");

  return (
    <div className="rounded-lg border">
      <Select
        value={type}
        onValueChange={(val) => setType(val as AggregateType)}
      >
        <SelectTrigger className="w-full rounded-none border-x-0 border-b border-t-0 px-4 py-6">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
          {aggregateTypeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex items-center">
                <span
                  className={cn(option.color, "mr-1.5 rounded border p-0.5")}
                >
                  <option.icon className="size-4" />
                </span>
                {option.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="divide-y">
        {type === "stats" ? (
          <Stats apiKey={apiKey} />
        ) : (
          <AggregatesDisplay type={type} apiKey={apiKey} />
        )}
      </div>
    </div>
  );
}

const AggregatesDisplay = ({
  apiKey,
  type,
}: {
  apiKey?: string;
  type: AggregateType;
}) => {
  const { aggregates, isLoading } = useAnalyticsAggregates(apiKey, type);

  return (
    <>
      {isLoading && <Skeleton className="h-10 w-full" />}
      {aggregates.map((item, index) => {
        const country = countries.find((c) => c.code === item.value);
        const display =
          type === "country" ? (
            country ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">{country.emoji}</span>
                <span>{country.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">
                {item.value || "Unknown"}
              </span>
            )
          ) : (
            item.value || "Unknown"
          );

        return (
          <div
            key={item.value || index}
            className="flex items-center justify-between px-4 py-2 text-sm"
          >
            <span className="truncate font-medium">{display}</span>
            <Badge variant="outline" className="ml-2 border-0 text-sm">
              {item.count}
            </Badge>
          </div>
        );
      })}
      {!isLoading && aggregates.length === 0 && (
        <div className="p-4 text-sm text-muted-foreground">
          No data available
        </div>
      )}
    </>
  );
};

const Stats = ({ apiKey }: { apiKey?: string }) => {
  const { stats, isLoading } = useAnalyticsUserStats(apiKey);

  return (
    <>
      <div className="flex flex-col p-4 text-sm">
        <span className="truncate font-medium text-muted-foreground">
          Total users
        </span>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-medium">
            {isLoading ? "..." : stats?.total}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              <IosIcon className="mr-1.5" />
              {isLoading ? "..." : stats?.iosCount}
            </Badge>
            <Badge variant="outline" className="text-sm">
              <AndroidIcon className="mr-1.5" />
              {isLoading ? "..." : stats?.androidCount}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex divide-x">
        <div className="flex flex-1 items-center justify-between p-4 text-sm">
          <span className="truncate font-medium text-muted-foreground">
            Identified
          </span>
          <Badge variant="outline" className="ml-2 border-0 text-sm">
            {isLoading ? "..." : stats?.identifiedCount}
          </Badge>
        </div>
        <div className="flex flex-1 items-center justify-between p-4 text-sm">
          <span className="truncate font-medium text-muted-foreground">
            Anonymous
          </span>
          <Badge variant="outline" className="ml-2 border-0 text-sm">
            {isLoading ? "..." : stats?.anonymousCount}
          </Badge>
        </div>
      </div>
      <CountryAggregatesDisplay apiKey={apiKey} />
    </>
  );
};

const CountryAggregatesDisplay = ({ apiKey }: { apiKey?: string }) => {
  const { aggregates, isLoading } = useAnalyticsAggregates(apiKey, "country");

  if (isLoading) return <Skeleton className="h-10 w-full" />;

  if (!aggregates.length)
    return (
      <div className="p-4 text-sm text-muted-foreground">No data available</div>
    );

  const grouped = aggregates.reduce<Record<number, typeof aggregates>>(
    (acc, item) => {
      if (!acc[item.count]) acc[item.count] = [];
      acc[item.count].push(item);
      return acc;
    },
    {},
  );

  const sortedCounts = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <>
      {sortedCounts.map((count) => {
        const MAX_DISPLAYED = 8;
        const items = grouped[count];
        const hasLessThanThree = items?.length < 3;
        const hasMoreThanDisplayed = items?.length > MAX_DISPLAYED;

        return (
          <div
            key={count}
            className="flex items-center justify-between px-4 py-2 text-sm"
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex items-center gap-2">
                {items.slice(0, MAX_DISPLAYED).map((item, i) => {
                  const country = countries.find((c) => c.code === item.value);
                  return (
                    <Fragment key={item.value || i}>
                      {country ? (
                        <span className="flex items-center gap-1">
                          <TooltipWrapper content={country.name}>
                            <span className="text-lg">{country.emoji}</span>
                          </TooltipWrapper>
                          {hasLessThanThree && (
                            <span className="font-medium">{country.name}</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {item.value || "Unknown"}
                        </span>
                      )}
                    </Fragment>
                  );
                })}
              </div>
              {hasMoreThanDisplayed && (
                <TooltipWrapper
                  content={
                    <div className="grid w-full max-w-md grid-cols-3 flex-row flex-wrap gap-x-3 gap-y-1">
                      {items
                        .slice(MAX_DISPLAYED, items?.length - 1)
                        .map((item, i) => {
                          const country = countries.find(
                            (c) => c.code === item.value,
                          );
                          return (
                            <Fragment key={item.value || i}>
                              {country ? (
                                <span className="flex items-center gap-1">
                                  <TooltipWrapper content={country.name}>
                                    <span className="text-lg">
                                      {country.emoji}
                                    </span>
                                  </TooltipWrapper>
                                  <span className="font-medium">
                                    {country.name}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  {item.value || "Unknown"}
                                </span>
                              )}
                            </Fragment>
                          );
                        })}
                    </div>
                  }
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    +{items.length - 8}
                  </span>
                </TooltipWrapper>
              )}
            </div>
            <Badge variant="outline" className="ml-2 border-0 text-sm">
              {count}
            </Badge>
          </div>
        );
      })}
    </>
  );
};
