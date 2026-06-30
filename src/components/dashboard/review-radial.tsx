"use client";

import { useState, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewRadialProps {
  solved: number;
  markedForReview: number;
}

const COLORS = {
  solved: "#3b82f6",
  review: "#93c5fd",
} as const;

export function ReviewRadial({ solved, markedForReview }: ReviewRadialProps) {
  const total = solved + markedForReview;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const pieData = [
    { name: "Solved", value: solved, color: COLORS.solved },
    { name: "Review", value: markedForReview, color: COLORS.review },
  ];

  const handleMouseEnter = useCallback((_data: unknown, index: number) => {
    setActiveIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const centerLabel =
    activeIndex !== null
      ? {
          top: pieData[activeIndex].name,
          bottom: `${pieData[activeIndex].value} / ${total}`,
        }
      : {
          top: "Total",
          bottom: `${total}`,
        };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Review Status</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
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
                cornerRadius={3}
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
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
