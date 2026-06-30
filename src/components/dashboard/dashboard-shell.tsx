"use client";

import { useMemo } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DifficultyDonut } from "@/components/dashboard/difficulty-donut";
import { TopicRadar } from "@/components/dashboard/topic-radar";
import { ReviewRadial } from "@/components/dashboard/review-radial";
import { Heatmap } from "@/components/dashboard/heatmap";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { useTopicStore } from "@/stores/topic-store";
import { computeDashboardData } from "@/lib/dashboard-data";

export function DashboardShell() {
  const topics = useTopicStore((s) => s.topics);
  const data = useMemo(() => computeDashboardData(topics), [topics]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 md:grid-cols-3">
        <StatsCards solvedToday={data.solvedToday} weeklySolved={data.weeklySolved} />
        <DifficultyDonut breakdown={data.difficultyBreakdown} />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <TopicRadar data={data.topicRadar} />
        <ReviewRadial
          solved={data.reviewStats.solved}
          markedForReview={data.reviewStats.markedForReview}
        />
      </div>

      <Heatmap data={data.heatmap} streak={data.streak} maxStreak={data.maxStreak} />

      <RecentActivity data={data.recentActivity} />
    </div>
  );
}
