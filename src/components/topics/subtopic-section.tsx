"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2 } from "lucide-react";
import type { SubTopicStoreItem, ProblemStoreItem, SubtopicViewModel } from "@/types/topics";
import { ProblemRow } from "@/components/topics/problem-row";

interface SubtopicSectionProps {
  subtopic: SubTopicStoreItem;
  viewModel: SubtopicViewModel;
  onEdit: (subtopic: SubTopicStoreItem) => void;
  onDelete: (subtopic: SubTopicStoreItem) => void;
  onProblemStatusChange: (problemId: string, status: ProblemStoreItem["status"]) => void;
  onProblemReviewCountChange: (problemId: string, count: number) => void;
  onProblemMoveUp: (problemId: string) => void;
  onProblemMoveDown: (problemId: string) => void;
  onProblemEdit: (problem: ProblemStoreItem) => void;
  onProblemDelete: (problem: ProblemStoreItem) => void;
}

export function SubtopicSection({
  subtopic,
  viewModel,
  onEdit,
  onDelete,
  onProblemStatusChange,
  onProblemReviewCountChange,
  onProblemMoveUp,
  onProblemMoveDown,
  onProblemEdit,
  onProblemDelete,
}: SubtopicSectionProps) {
  const hasProblems = subtopic.problems.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium">{subtopic.name}</h3>
            <div className="flex gap-0.5">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onEdit(subtopic)}
                aria-label="Edit sub-topic"
              >
                <Pencil className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onDelete(subtopic)}
                aria-label="Delete sub-topic"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
          {subtopic.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {subtopic.description}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>
            {viewModel.solvedProblems}/{viewModel.totalProblems}
          </span>
        </div>
        <Progress value={viewModel.progressPercent} />
      </div>

      {hasProblems ? (
        <div className="space-y-2">
          {subtopic.problems.map((problem, idx) => (
            <ProblemRow
              key={problem.id}
              problem={problem}
              isFirst={idx === 0}
              isLast={idx === subtopic.problems.length - 1}
              onStatusChange={onProblemStatusChange}
              onReviewCountChange={onProblemReviewCountChange}
              onMoveUp={onProblemMoveUp}
              onMoveDown={onProblemMoveDown}
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
  );
}
