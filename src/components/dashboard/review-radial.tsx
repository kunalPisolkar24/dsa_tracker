"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewRadialProps {
  solved: number;
  markedForReview: number;
}

const COLORS = {
  solved: "#3b82f6",
  review: "#93c5fd",
} as const;

const LABELS: Record<string, string> = {
  solved: "Solved",
  review: "Review",
};

export function ReviewRadial({ solved, markedForReview }: ReviewRadialProps) {
  const total = solved + markedForReview;
  const chartData = [{ name: "review", solved, review: markedForReview }];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Review Status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center pb-0">
        <div className="w-full max-w-[250px]">
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart
              data={chartData}
              endAngle={180}
              innerRadius={80}
              outerRadius={110}
            >
              <RadialBar
                dataKey="solved"
                fill={COLORS.solved}
                stackId="a"
                cornerRadius={1}
              />
              <RadialBar
                dataKey="review"
                fill={COLORS.review}
                stackId="a"
                cornerRadius={1}
              />
              <Tooltip
                cursor={false}
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const entry = payload[0];
                  const key = entry.dataKey as string;
                  return (
                    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: COLORS[key as keyof typeof COLORS] }}
                        />
                        <span className="font-medium">{LABELS[key]}</span>
                        <span className="text-muted-foreground">{entry.value as number}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 4}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {total}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 16}
                            className="fill-muted-foreground text-sm"
                          >
                            {`${markedForReview} review`}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
