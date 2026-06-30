"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { HeatmapEntry } from "@/lib/dashboard-data";

interface HeatmapProps {
  data: HeatmapEntry[];
}

const LEVELS = [
  { threshold: 0, className: "bg-muted" },
  { threshold: 1, className: "bg-chart-2/25" },
  { threshold: 2, className: "bg-chart-2/50" },
  { threshold: 3, className: "bg-chart-2/75" },
  { threshold: 4, className: "bg-chart-2" },
] as const;

function getLevel(count: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (count >= LEVELS[i].threshold) return LEVELS[i];
  }
  return LEVELS[0];
}

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function Heatmap({ data }: HeatmapProps) {
  const years = useMemo(() => {
    const set = new Set<number>();
    data.forEach((d) => set.add(new Date(d.date).getFullYear()));
    return Array.from(set).sort();
  }, [data]);

  const [selectedYear, setSelectedYear] = useState<string>(
    String(Math.max(...years))
  );

  const { grid, monthLabels } = useMemo(() => {
    const year = Number(selectedYear);
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    const dayMap = new Map<string, number>();
    data.forEach((d) => {
      const date = new Date(d.date + "T00:00:00");
      if (date.getFullYear() === year) dayMap.set(d.date, d.count);
    });

    const startDow = (start.getDay() + 6) % 7;

    const cells: { date: string; count: number; level: string }[] = [];
    const current = new Date(start);
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;

    let dayIndex = 0;
    while (current <= end) {
      const dateStr = toLocalDateStr(current);
      const count = dayMap.get(dateStr) ?? 0;
      const level = getLevel(count);
      cells.push({ date: dateStr, count, level: level.className });

      if (current.getMonth() !== lastMonth) {
        labels.push({
          label: current.toLocaleString("default", { month: "short" }),
          col: Math.floor((dayIndex + startDow) / 7),
        });
        lastMonth = current.getMonth();
      }

      current.setDate(current.getDate() + 1);
      dayIndex++;
    }

    const paddedCells: ({ date: string; count: number; level: string } | null)[] = [
      ...Array(startDow).fill(null),
      ...cells,
    ];

    return { grid: paddedCells, monthLabels: labels };
  }, [data, selectedYear]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Contribution Heatmap</CardTitle>
          <CardDescription>Problems solved per day</CardDescription>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-1">
            <div className="flex flex-col gap-[3px] pt-5 pr-1">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="h-[14px] text-[10px] leading-[14px] text-muted-foreground">
                  {label}
                </div>
              ))}
            </div>
            <div className="flex-1">
              <div className="relative text-[10px] text-muted-foreground mb-1" style={{ height: 14 }}>
                {monthLabels.map((m, i) => (
                  <span
                    key={i}
                    className="absolute"
                    style={{ left: m.col * 17 }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>
              <div
                className="grid gap-[3px]"
                style={{
                  gridTemplateColumns: `repeat(${Math.ceil(grid.length / 7)}, 14px)`,
                  gridTemplateRows: "repeat(7, 14px)",
                  gridAutoFlow: "column",
                }}
              >
                {grid.map((cell, i) =>
                  cell ? (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div
                          suppressHydrationWarning
                          className={`rounded-sm ${cell.level} cursor-default`}
                          style={{ width: 14, height: 14 }}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        {cell.count} {cell.count === 1 ? "problem" : "problems"} solved on{" "}
                        {new Date(cell.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div key={i} style={{ width: 14, height: 14 }} />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-1 text-xs text-muted-foreground">
          <span>Less</span>
          {LEVELS.map((level, i) => (
            <div
              key={i}
              className={`size-3 rounded-sm ${level.className}`}
            />
          ))}
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
