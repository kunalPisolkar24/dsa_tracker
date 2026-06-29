"use client";

import { useState, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DifficultyStats } from "@/lib/dashboard-data";

interface DifficultyDonutProps {
  breakdown: Record<"EASY" | "MEDIUM" | "HARD", DifficultyStats>;
}

const COLORS = {
  EASY: "#22c55e",
  MEDIUM: "#f59e0b",
  HARD: "#ef4444",
} as const;

const LABELS: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export function DifficultyDonut({ breakdown }: DifficultyDonutProps) {
  const totalSolved = Object.values(breakdown).reduce((acc, d) => acc + d.solved, 0);
  const totalProblems = Object.values(breakdown).reduce((acc, d) => acc + d.total, 0);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const pieData = (Object.entries(breakdown) as [string, DifficultyStats][]).map(
    ([key, val]) => ({
      name: key,
      value: val.solved,
      total: val.total,
      color: COLORS[key as keyof typeof COLORS],
    })
  );

  const handleMouseEnter = useCallback((_data: unknown, index: number) => {
    setActiveIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const centerLabel =
    activeIndex !== null
      ? {
          top: `Solved ${LABELS[pieData[activeIndex].name]}`,
          bottom: `${pieData[activeIndex].value} / ${pieData[activeIndex].total}`,
        }
      : {
          top: "Solved",
          bottom: `${totalSolved} / ${totalProblems}`,
        };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Problem Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                strokeWidth={0}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tracking-tight">
              {centerLabel.top}
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              {centerLabel.bottom}
            </span>
          </div>
        </div>
        <div className="mt-2 flex justify-center gap-4 text-xs">
          {pieData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{LABELS[entry.name]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
