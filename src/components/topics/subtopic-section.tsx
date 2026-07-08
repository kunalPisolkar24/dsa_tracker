"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon, Delete02Icon, Edit03Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { SubTopicStoreItem, ProblemStoreItem, SubtopicViewModel } from "@/types/topics";
import { ProblemRow } from "@/components/topics/problem-row";

interface SubtopicSectionProps {
  subtopic: SubTopicStoreItem;
  viewModel: SubtopicViewModel;
  isEditing: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: (subTopicId: string) => void;
  onMoveDown: (subTopicId: string) => void;
  onEdit: (subtopic: SubTopicStoreItem) => void;
  onDelete: (subtopic: SubTopicStoreItem) => void;
  onProblemStatusChange: (problemId: string, status: ProblemStoreItem["status"]) => void;
  onProblemReviewCountChange: (problemId: string, count: number) => void;
  onProblemMoveUp: (problemId: string) => void;
  onProblemMoveDown: (problemId: string) => void;
  onProblemNotesClick: (problem: ProblemStoreItem) => void;
  onProblemEdit: (problem: ProblemStoreItem) => void;
  onProblemDelete: (problem: ProblemStoreItem) => void;
}

export function SubtopicSection({
  subtopic,
  viewModel,
  isEditing,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onProblemStatusChange,
  onProblemReviewCountChange,
  onProblemMoveUp,
  onProblemMoveDown,
  onProblemNotesClick,
  onProblemEdit,
  onProblemDelete,
}: SubtopicSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasProblems = subtopic.problems.length > 0;

  return (
    <div className="space-y-3">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-start justify-between gap-2">
          <CollapsibleTrigger asChild>
            <button
              className="group flex min-w-0 flex-1 cursor-pointer items-start gap-2 text-left"
              aria-expanded={isExpanded}
            >
              <HugeiconsIcon icon={ArrowDown01Icon} className={cn(
                                            "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
                                            isExpanded && "rotate-0",
                                            !isExpanded && "-rotate-90"
                                          )} />
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-medium group-hover:text-foreground/80 transition-colors">
                  {subtopic.name}
                </h3>
                {subtopic.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {subtopic.description}
                  </p>
                )}
              </div>
            </button>
          </CollapsibleTrigger>

          {isEditing && (
            <div className="flex shrink-0 items-center gap-1">
              <div className="flex shrink-0 items-center rounded-xl border border-border bg-card p-0.5 gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={isFirst}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp(subtopic.id);
                  }}
                  aria-label="Move up"
                >
                  <HugeiconsIcon icon={ArrowUp01Icon} className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={isLast}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown(subtopic.id);
                  }}
                  aria-label="Move down"
                >
                  <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
                </Button>
              </div>
              <div className="flex items-center rounded-xl border border-border bg-card p-0.5 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(subtopic);
                  }}
                  aria-label="Edit sub-topic"
                  className={cn(
                    "bg-primary border-primary/80 text-primary-foreground",
                    "sm:size-7",
                    "hover:bg-primary/80 hover:text-primary-foreground",
                    "dark:border-primary/50 dark:bg-primary/30 dark:text-white",
                    "dark:hover:bg-primary/40 dark:hover:text-white",
                    "transition-colors",
                  )}
                >
                  <HugeiconsIcon icon={Edit03Icon} className="size-5 sm:size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(subtopic);
                  }}
                  aria-label="Delete sub-topic"
                  className={cn(
                    "bg-destructive border-destructive/80 text-white",
                    "sm:size-7",
                    "hover:bg-destructive/80 hover:text-white",
                    "dark:border-destructive/50 dark:bg-destructive/30",
                    "dark:hover:bg-destructive/40",
                    "transition-colors",
                  )}
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-5 sm:size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1 pl-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>
              {viewModel.solvedProblems}/{viewModel.totalProblems}
            </span>
          </div>
          <Progress value={viewModel.progressPercent} />
        </div>

        <CollapsibleContent>
          <div className="overflow-x-auto pt-3 pl-6">
            {hasProblems ? (
              <div className="flex w-max min-w-full flex-col gap-2">
                {subtopic.problems.map((problem, idx) => (
                  <ProblemRow
                    key={problem.id}
                    problem={problem}
                    isEditing={isEditing}
                    isFirst={idx === 0}
                    isLast={idx === subtopic.problems.length - 1}
                    onStatusChange={onProblemStatusChange}
                    onReviewCountChange={onProblemReviewCountChange}
                    onMoveUp={onProblemMoveUp}
                    onMoveDown={onProblemMoveDown}
                    onNotesClick={onProblemNotesClick}
                    onEdit={onProblemEdit}
                    onDelete={onProblemDelete}
                  />
                ))}
              </div>
            ) : (
              <p className="py-2 text-center text-sm text-muted-foreground">
                No problems in this sub-topic yet.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
