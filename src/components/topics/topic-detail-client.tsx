"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useTopicStore } from "@/stores/topic-store";
import {
  computeTopicCardViewModel,
  computeSubtopicViewModel,
} from "@/lib/topic-service";
import { LAYOUT } from "@/lib/constants";
import type {
  SubTopicStoreItem,
  ProblemStoreItem,
} from "@/types/topics";
import { SubtopicSection } from "@/components/topics/subtopic-section";
import { ProblemRow } from "@/components/topics/problem-row";
import { SubtopicFormDialog } from "@/components/topics/subtopic-form-dialog";
import { ProblemFormDialog } from "@/components/topics/problem-form-dialog";
import { DeleteConfirmationDialog } from "@/components/topics/delete-confirmation-dialog";

interface TopicsDetailClientProps {
  topicId: string;
}

type DialogState =
  | { type: "idle" }
  | { type: "createSubTopic" }
  | { type: "editSubTopic"; target: SubTopicStoreItem }
  | { type: "createProblem"; subTopicId?: string }
  | { type: "editProblem"; target: ProblemStoreItem }
  | { type: "delete"; entityType: "subtopic" | "problem"; target: { id: string; name: string } };

export function TopicsDetailClient({ topicId }: TopicsDetailClientProps) {
  const topic = useTopicStore((s) => s.topics.find((t) => t.id === topicId));
  const {
    addSubTopic,
    updateSubTopic,
    removeSubTopic,
    addProblem,
    updateProblem,
    removeProblem,
    updateProblemStatus,
    updateProblemReviewCount,
    moveProblem,
  } = useTopicStore();

  const [dialog, setDialog] = useState<DialogState>({ type: "idle" });

  const topicViewModel = useMemo(
    () => (topic ? computeTopicCardViewModel(topic) : null),
    [topic]
  );

  const directProblems = topic?.problems ?? [];
  const subtopicViewModels = useMemo(
    () => topic?.subtopics.map(computeSubtopicViewModel) ?? [],
    [topic?.subtopics]
  );

  if (!topic || !topicViewModel) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <p className="text-lg font-medium">Topic not found</p>
        <p className="text-sm text-muted-foreground">
          The topic you are looking for does not exist.
        </p>
        <Button variant="outline" asChild>
          <Link href="/topics">
            <ArrowLeft />
            Back to Topics
          </Link>
        </Button>
      </div>
    );
  }

  function handleCreateSubTopic(input: { name: string; description?: string }) {
    addSubTopic(topicId, input);
    toast.success("Sub-topic created successfully");
  }

  function handleEditSubTopic(input: { name: string; description?: string }) {
    if (dialog.type !== "editSubTopic") return;
    updateSubTopic(topicId, dialog.target.id, input);
    setDialog({ type: "idle" });
    toast.success("Sub-topic updated successfully");
  }

  function handleDeleteSubTopic() {
    if (dialog.type !== "delete" || dialog.entityType !== "subtopic") return;
    removeSubTopic(topicId, dialog.target.id);
    setDialog({ type: "idle" });
    toast.success("Sub-topic deleted successfully");
  }

  function handleCreateProblem(input: {
    title: string;
    url?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    subTopicId?: string | null;
    notes?: string;
  }) {
    addProblem(topicId, {
      ...input,
      subTopicId: input.subTopicId ?? undefined,
    });
    toast.success("Problem created successfully");
  }

  function handleEditProblem(input: {
    title: string;
    url?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    subTopicId?: string | null;
    notes?: string;
  }) {
    if (dialog.type !== "editProblem") return;
    updateProblem(topicId, dialog.target.id, {
      ...input,
      subTopicId: input.subTopicId ?? undefined,
    });
    setDialog({ type: "idle" });
    toast.success("Problem updated successfully");
  }

  function handleDeleteProblem() {
    if (dialog.type !== "delete" || dialog.entityType !== "problem") return;
    removeProblem(topicId, dialog.target.id);
    setDialog({ type: "idle" });
    toast.success("Problem deleted successfully");
  }

  function handleProblemStatusChange(
    problemId: string,
    status: ProblemStoreItem["status"]
  ) {
    updateProblemStatus(topicId, problemId, status);
  }

  function handleProblemReviewCountChange(problemId: string, count: number) {
    updateProblemReviewCount(topicId, problemId, count);
  }

  function handleProblemMoveUp(problemId: string) {
    moveProblem(topicId, problemId, "up");
  }

  function handleProblemMoveDown(problemId: string) {
    moveProblem(topicId, problemId, "down");
  }

  const hasSubtopics = topic.subtopics.length > 0;
  const hasDirectProblems = directProblems.length > 0;
  const hasAnyContent = hasSubtopics || hasDirectProblems;

  return (
    <div className={`mx-auto flex w-full ${LAYOUT.DETAIL_MAX_WIDTH} flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight">{topic.name}</h1>
        {topic.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {topic.description}
          </p>
        )}
      </div>

      <div className="mb-6 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Overall Progress</span>
          <span>
            {topicViewModel.solvedProblems}/{topicViewModel.totalProblems}
          </span>
        </div>
        <Progress value={topicViewModel.progressPercent} />
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDialog({ type: "createSubTopic" })}
        >
          <Plus />
          Add Sub-topic
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDialog({ type: "createProblem" })}
        >
          <Plus />
          Add Problem
        </Button>
      </div>

      <Separator className="mb-6" />

      <div className="flex-1 space-y-8">
        {hasSubtopics &&
          topic.subtopics.map((subtopic) => {
            const vm = subtopicViewModels.find((v) => v.id === subtopic.id);
            if (!vm) return null;
            return (
              <SubtopicSection
                key={subtopic.id}
                subtopic={subtopic}
                viewModel={vm}
                onEdit={(st) => setDialog({ type: "editSubTopic", target: st })}
                onDelete={(st) =>
                  setDialog({
                    type: "delete",
                    entityType: "subtopic",
                    target: { id: st.id, name: st.name },
                  })
                }
                onProblemStatusChange={handleProblemStatusChange}
                onProblemReviewCountChange={handleProblemReviewCountChange}
                onProblemMoveUp={handleProblemMoveUp}
                onProblemMoveDown={handleProblemMoveDown}
                onProblemEdit={(p) =>
                  setDialog({ type: "editProblem", target: p })
                }
                onProblemDelete={(p) =>
                  setDialog({
                    type: "delete",
                    entityType: "problem",
                    target: { id: p.id, name: p.title },
                  })
                }
              />
            );
          })}

        {hasDirectProblems && (
          <div className="space-y-3">
            <h2 className="text-base font-medium">Direct Problems</h2>
            {directProblems.map((problem, idx) => (
              <ProblemRow
                key={problem.id}
                problem={problem}
                isFirst={idx === 0}
                isLast={idx === directProblems.length - 1}
                onStatusChange={handleProblemStatusChange}
                onReviewCountChange={handleProblemReviewCountChange}
                onMoveUp={handleProblemMoveUp}
                onMoveDown={handleProblemMoveDown}
                onEdit={(p) =>
                  setDialog({ type: "editProblem", target: p })
                }
                onDelete={(p) =>
                  setDialog({
                    type: "delete",
                    entityType: "problem",
                    target: { id: p.id, name: p.title },
                  })
                }
              />
            ))}
          </div>
        )}

        {!hasAnyContent && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-lg font-medium">No problems yet</p>
            <p className="text-sm text-muted-foreground">
              Add a sub-topic or a problem to get started.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialog({ type: "createSubTopic" })}
              >
                <Plus />
                Add Sub-topic
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialog({ type: "createProblem" })}
              >
                <Plus />
                Add Problem
              </Button>
            </div>
          </div>
        )}
      </div>

      <SubtopicFormDialog
        key={
          dialog.type === "editSubTopic" ? dialog.target.id : "create-subtopic"
        }
        mode={dialog.type === "editSubTopic" ? "edit" : "create"}
        open={dialog.type === "createSubTopic" || dialog.type === "editSubTopic"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "idle" });
        }}
        onSubmit={
          dialog.type === "editSubTopic"
            ? handleEditSubTopic
            : handleCreateSubTopic
        }
        initialValues={
          dialog.type === "editSubTopic"
            ? {
                name: dialog.target.name,
                description: dialog.target.description,
              }
            : undefined
        }
      />

      <ProblemFormDialog
        key={
          dialog.type === "editProblem" ? dialog.target.id : "create-problem"
        }
        mode={dialog.type === "editProblem" ? "edit" : "create"}
        open={dialog.type === "createProblem" || dialog.type === "editProblem"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "idle" });
        }}
        onSubmit={
          dialog.type === "editProblem"
            ? handleEditProblem
            : handleCreateProblem
        }
        subtopics={topic.subtopics}
        initialValues={
          dialog.type === "editProblem"
            ? {
                title: dialog.target.title,
                url: dialog.target.url,
                difficulty: dialog.target.difficulty,
                subTopicId: dialog.target.subTopicId,
                notes: dialog.target.notes,
              }
            : dialog.type === "createProblem"
              ? {
                  title: "",
                  difficulty: "EASY" as const,
                }
              : undefined
        }
      />

      <DeleteConfirmationDialog
        open={dialog.type === "delete"}
        onOpenChange={(open) => {
          if (!open) setDialog({ type: "idle" });
        }}
        title={
          dialog.type === "delete" && dialog.entityType === "subtopic"
            ? "Delete Sub-topic"
            : "Delete Problem"
        }
        description={
          dialog.type === "delete"
            ? dialog.entityType === "subtopic"
              ? `Are you sure you want to delete "${dialog.target.name}"? This will also remove all problems within this sub-topic.`
              : `Are you sure you want to delete "${dialog.target.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={
          dialog.type === "delete"
            ? dialog.entityType === "subtopic"
              ? handleDeleteSubTopic
              : handleDeleteProblem
            : () => {}
        }
      />
    </div>
  );
}
