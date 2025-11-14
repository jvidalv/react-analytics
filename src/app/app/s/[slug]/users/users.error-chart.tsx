"use client";

import { Bar, BarChart } from "recharts";
import { Card } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDailyErrors } from "@/domains/app/users/stats/users-stats.api";
import { ShieldX } from "lucide-react";

const redShades = [
  "hsl(0, 85%, 65%)",
  "hsl(0, 80%, 55%)",
  "hsl(0, 75%, 45%)",
  "hsl(0, 70%, 35%)",
  "hsl(0, 65%, 25%)",
];

export function UsersErrorChart({ apiKey }: { apiKey?: string }) {
  const { data = [], isLoading } = useDailyErrors(apiKey);

  const allMessages = Array.from(
    new Set(data.flatMap((d) => Object.keys(d).filter((k) => k !== "day"))),
  );

  const chartConfig: ChartConfig = Object.fromEntries(
    allMessages.map((message, i) => [
      message,
      {
        label: message,
        color: redShades[i % redShades.length],
      },
    ]),
  );

  return (
    <Card>
      <div className="flex w-full items-center gap-2 rounded-none border-x-0 border-b border-t-0 p-4 text-sm">
        <ShieldX className="text-muted-foreground" />
        Errors
        <span className="ml-auto text-muted-foreground">last 7 Days</span>
      </div>
      <div>
        {!isLoading && allMessages?.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={data}>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              {allMessages.map((msg, i) => {
                return (
                  <Bar
                    key={msg}
                    dataKey={msg}
                    stackId="a"
                    isAnimationActive={false}
                    fill={chartConfig[msg]?.color}
                    radius={
                      i === allMessages.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]
                    }
                  />
                );
              })}
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </Card>
  );
}
