"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RecentActivityEntry } from "@/lib/dashboard-data";

interface RecentActivityProps {
  data: RecentActivityEntry[];
}

const STATUS_CLASSES: Record<string, string> = {
  SOLVED:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400",
  ATTEMPTED:
    "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400",
  MARKED_FOR_REVIEW:
    "bg-violet-500/10 text-violet-600 border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-400",
  TODO: "border-dashed text-muted-foreground",
};

const DIFFICULTY_CLASSES: Record<string, string> = {
  EASY:
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400",
  MEDIUM:
    "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400",
  HARD:
    "bg-red-500/10 text-red-600 border-red-500/30 dark:bg-red-500/15 dark:text-red-400",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function RecentActivity({ data }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Last 10 solved problems</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Problem</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                <th className="px-4 py-3 font-medium">Difficulty</th>
                <th className="px-4 py-3 font-medium">Solved At</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, index) => (
                <tr
                  key={entry.id}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                  <td
                    className="max-w-0 truncate px-4 py-3 font-medium"
                    title={`${entry.title} (${entry.topic})`}
                  >
                    {entry.title}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <Badge
                      variant="outline"
                      className={cn(STATUS_CLASSES[entry.status] ?? "")}
                    >
                      {entry.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(DIFFICULTY_CLASSES[entry.difficulty] ?? "")}
                    >
                      {entry.difficulty}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {timeAgo(entry.solvedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
