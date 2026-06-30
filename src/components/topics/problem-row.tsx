"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { STATUS_CYCLE } from "@/lib/topic-service";
import type { ProblemStoreItem } from "@/types/topics";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<
  ProblemStoreItem["status"],
  { label: string; className: string }
> = {
  TODO: {
    label: "Todo",
    className:
      "border-dashed text-muted-foreground hover:bg-muted",
  },
  SOLVED: {
    label: "Solved",
    className:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20",
  },
  ATTEMPTED: {
    label: "Attempted",
    className:
      "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20",
  },
  MARKED_FOR_REVIEW: {
    label: "In Review",
    className:
      "bg-violet-500/10 text-violet-600 border-violet-500/30 hover:bg-violet-500/20 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/20",
  },
};

const DIFFICULTY_STYLES: Record<
  ProblemStoreItem["difficulty"],
  { className: string }
> = {
  EASY: {
    className:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  MEDIUM: {
    className:
      "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400",
  },
  HARD: {
    className:
      "bg-red-500/10 text-red-600 border-red-500/30 dark:bg-red-500/15 dark:text-red-400",
  },
};

function nextStatus(current: ProblemStoreItem["status"]): ProblemStoreItem["status"] {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

interface ProblemRowProps {
  problem: ProblemStoreItem;
  isFirst: boolean;
  isLast: boolean;
  onStatusChange: (problemId: string, status: ProblemStoreItem["status"]) => void;
  onReviewCountChange: (problemId: string, count: number) => void;
  onMoveUp: (problemId: string) => void;
  onMoveDown: (problemId: string) => void;
  onEdit: (problem: ProblemStoreItem) => void;
  onDelete: (problem: ProblemStoreItem) => void;
}

export function ProblemRow({
  problem,
  isFirst,
  isLast,
  onStatusChange,
  onReviewCountChange,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: ProblemRowProps) {
  const statusStyle = STATUS_STYLES[problem.status];
  const difficultyStyle = DIFFICULTY_STYLES[problem.difficulty];
  const isInReview = problem.status === "MARKED_FOR_REVIEW";

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
      <div className="flex shrink-0 flex-col gap-0.5">
        <Button
          variant="ghost"
          size="icon-xs"
          disabled={isFirst}
          onClick={() => onMoveUp(problem.id)}
          aria-label="Move up"
        >
          <ArrowUp className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          disabled={isLast}
          onClick={() => onMoveDown(problem.id)}
          aria-label="Move down"
        >
          <ArrowDown className="size-3" />
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {problem.url ? (
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-medium underline-offset-2 hover:underline"
          >
            {problem.title}
            <ExternalLink className="ml-1 inline size-3 text-muted-foreground" />
          </a>
        ) : (
          <span className="truncate font-medium">{problem.title}</span>
        )}
      </div>

      <Badge
        variant="outline"
        className={cn("cursor-pointer select-none", statusStyle.className)}
        onClick={() => onStatusChange(problem.id, nextStatus(problem.status))}
        title="Click to cycle status"
      >
        {statusStyle.label}
      </Badge>

      <Badge variant="outline" className={cn(difficultyStyle.className)}>
        {problem.difficulty === "EASY"
          ? "Easy"
          : problem.difficulty === "MEDIUM"
            ? "Medium"
            : "Hard"}
      </Badge>

      {isInReview ? (
        <div className="flex w-16 items-center gap-1">
          <Input
            type="number"
            min={0}
            value={problem.reviewCount}
            onChange={(e) =>
              onReviewCountChange(problem.id, Math.max(0, Number(e.target.value)))
            }
            className="h-7 w-12 px-1 text-center text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      ) : (
        <span className="flex w-16 items-center justify-center text-xs text-muted-foreground">
          —
        </span>
      )}

      <div className="flex shrink-0 gap-0.5">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onEdit(problem)}
          aria-label="Edit problem"
        >
          <Pencil className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onDelete(problem)}
          aria-label="Delete problem"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}
