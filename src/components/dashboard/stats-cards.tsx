"use client";

import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  solvedToday: number;
  streak: number;
}

export function StatsCards({ solvedToday, streak }: StatsCardsProps) {
  return (
    <>
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-chart-2/15">
            <span className="text-lg font-bold text-chart-2">✓</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Solved Today</p>
            <p className="text-3xl font-bold tracking-tight">{solvedToday}</p>
            <p className="text-xs text-muted-foreground">problems</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-orange-500/15">
            <span className="text-lg">🔥</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
            <p className="text-3xl font-bold tracking-tight">{streak}</p>
            <p className="text-xs text-muted-foreground">consecutive days</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
