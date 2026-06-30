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
import { STATUS_STYLES, DIFFICULTY_STYLES } from "@/lib/constants";
import { timeAgo } from "@/lib/date-utils";
import type { RecentActivityEntry } from "@/lib/dashboard-data";

interface RecentActivityProps {
  data: RecentActivityEntry[];
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
                      className={cn(STATUS_STYLES[entry.status]?.className ?? "")}
                    >
                      {STATUS_STYLES[entry.status]?.label ?? entry.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(DIFFICULTY_STYLES[entry.difficulty]?.className ?? "")}
                    >
                      {DIFFICULTY_STYLES[entry.difficulty]?.label ?? entry.difficulty}
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
