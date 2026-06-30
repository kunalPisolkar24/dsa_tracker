"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RecentActivityEntry } from "@/lib/dashboard-data";

interface RecentActivityProps {
  data: RecentActivityEntry[];
}

const DIFFICULTY_COLORS: Record<string, "default" | "secondary" | "destructive"> = {
  EASY: "default",
  MEDIUM: "secondary",
  HARD: "destructive",
} as const;

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "ghost"> = {
  SOLVED: "default",
  ATTEMPTED: "secondary",
  MARKED_FOR_REVIEW: "outline",
  TODO: "ghost",
} as const;

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
                  <td className="max-w-0 truncate px-4 py-3 font-medium" title={entry.title}>{entry.title}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <Badge variant={STATUS_VARIANTS[entry.status] ?? "outline"}>
                      {entry.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={DIFFICULTY_COLORS[entry.difficulty] ?? "outline"}>
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
