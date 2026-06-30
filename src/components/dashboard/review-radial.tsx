"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewRadialProps {
  solved: number;
  markedForReview: number;
}

const SIZE = 320;
const STROKE = 28;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER_X = SIZE / 2;
const CENTER_Y = SIZE / 2;
const CAP = STROKE / 2 / RADIUS;

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = Math.abs(startAngle - endAngle) > Math.PI ? 1 : 0;
  const sweep = startAngle > endAngle ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

export function ReviewRadial({ solved, markedForReview }: ReviewRadialProps) {
  const [hovered, setHovered] = useState<"solved" | "review" | null>(null);

  const total = solved + markedForReview;
  const solvedFrac = total > 0 ? solved / total : 0;

  const splitAngle = Math.PI - solvedFrac * Math.PI;

  const solvedPath = describeArc(CENTER_X, CENTER_Y, RADIUS, Math.PI - CAP, splitAngle + CAP);
  const reviewPath = describeArc(CENTER_X, CENTER_Y, RADIUS, splitAngle - CAP, CAP);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Review Status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center">
        <div className="relative" style={{ width: SIZE, height: SIZE / 2 + 20 }}>
          <svg width={SIZE} height={SIZE / 2 + 20} viewBox={`0 0 ${SIZE} ${SIZE / 2 + 20}`}>
            {/* Background track */}
            <path
              d={describeArc(CENTER_X, CENTER_Y, RADIUS, Math.PI - CAP, CAP)}
              fill="none"
              stroke="#1e293b"
              strokeWidth={STROKE}
              strokeLinecap="butt"
            />

            {/* Solved arc - left */}
            <path
              d={solvedPath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={STROKE}
              strokeLinecap="butt"
              className="cursor-pointer transition-all duration-200"
              style={{ opacity: hovered && hovered !== "solved" ? 0.3 : 1 }}
              onMouseEnter={() => setHovered("solved")}
              onMouseLeave={() => setHovered(null)}
            />

            {/* Review arc - right */}
            <path
              d={reviewPath}
              fill="none"
              stroke="#93c5fd"
              strokeWidth={STROKE}
              strokeLinecap="butt"
              className="cursor-pointer transition-all duration-200"
              style={{ opacity: hovered && hovered !== "review" ? 0.3 : 1 }}
              onMouseEnter={() => setHovered("review")}
              onMouseLeave={() => setHovered(null)}
            />
          </svg>

          {/* Tooltip on hover */}
          {hovered && (
            <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: hovered === "solved" ? "#3b82f6" : "#93c5fd" }} />
                <span className="font-medium">{hovered === "solved" ? "Solved" : "Review"}</span>
                <span className="text-muted-foreground">{hovered === "solved" ? solved : markedForReview}</span>
              </div>
            </div>
          )}

          {/* Center text */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-2">
            <span className="text-4xl font-bold tracking-tight">{total}</span>
            <span className="text-sm text-muted-foreground">
              {hovered === "solved" ? `${solved} solved` : `${markedForReview} review`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
