"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Pencil, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useTopicStore } from "@/stores/topic-store";
import {
  computeTopicCardViewModel,
  computeSubtopicViewModel,
  computeBatchChanges,
  updateProblemInDraft,
} from "@/lib/topic-utils";
import type {
  SubTopicStoreItem,
  ProblemStoreItem,
} from "@/types/topics";
import type { TopicStoreItem } from "@/types/topics";
import * as topicService from "@/lib/services/topic-service";
import * as subTopicService from "@/lib/services/subtopic-service";
import * as problemService from "@/lib/services/problem-service";
import { SubtopicSection } from "@/components/topics/subtopic-section";
import { ProblemRow } from "@/components/topics/problem-row";
import { SubtopicFormDialog } from "@/components/topics/subtopic-form-dialog";
import { ProblemFormDialog } from "@/components/topics/problem-form-dialog";
import { DeleteConfirmationDialog } from "@/components/topics/delete-confirmation-dialog";
import { UnsavedChangesDialog } from "@/components/topics/unsaved-changes-dialog";
import { TopicDetailSkeleton } from "@/components/topics/topic-skeleton";

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
  const hydrated = useTopicStore((s) => s.hydrated);
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
    replaceTopic,
  } = useTopicStore();

  const [dialog, setDialog] = useState<DialogState>({ type: "idle" });
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TopicStoreItem | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const displayTopic = isEditing && draft ? draft : topic;

  const topicViewModel = useMemo(
    () => (displayTopic ? computeTopicCardViewModel(displayTopic) : null),
    [displayTopic]
  );

  const displayDirectProblems = displayTopic?.problems ?? [];
  const subtopicViewModels = useMemo(
    () => displayTopic?.subtopics.map(computeSubtopicViewModel) ?? [],
    [displayTopic?.subtopics]
  );

  if (!hydrated) {
    return <TopicDetailSkeleton />;
  }

  if (!topic || !topicViewModel) {
    return (
      <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
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

  async function handleCreateSubTopic(input: { name: string; description?: string }): Promise<boolean> {
    return addSubTopic(topicId, input);
  }

  async function handleEditSubTopic(input: { name: string; description?: string }): Promise<boolean> {
    if (dialog.type !== "editSubTopic") return false;
    if (isEditing) {
      handleDraftSubTopicEdit(dialog.target.id, input);
      return true;
    }
    updateSubTopic(topicId, dialog.target.id, input);
    toast.success("Sub-topic updated successfully");
    return true;
  }

  function handleDeleteSubTopic() {
    if (dialog.type !== "delete" || dialog.entityType !== "subtopic") return;
    if (isEditing) {
      setDraft((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subtopics: prev.subtopics.filter((st) => st.id !== dialog.target.id),
        };
      });
      setHasChanges(true);
      setDialog({ type: "idle" });
      return;
    }
    removeSubTopic(topicId, dialog.target.id);
    setDialog({ type: "idle" });
    toast.success("Sub-topic deleted successfully");
  }

  async function handleCreateProblem(input: {
    title: string;
    url?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    subTopicId?: string | null;
    notes?: string;
  }): Promise<boolean> {
    return addProblem(topicId, {
      ...input,
      subTopicId: input.subTopicId ?? undefined,
    });
  }

  async function handleEditProblem(input: {
    title: string;
    url?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    subTopicId?: string | null;
    notes?: string;
  }): Promise<boolean> {
    if (dialog.type !== "editProblem") return false;
    if (isEditing) {
      handleDraftProblemEdit(dialog.target.id, input);
      return true;
    }
    updateProblem(topicId, dialog.target.id, input);
    toast.success("Problem updated successfully");
    return true;
  }

  function handleDeleteProblem() {
    if (dialog.type !== "delete" || dialog.entityType !== "problem") return;
    if (isEditing) {
      setDraft((prev) => {
        if (!prev) return prev;
        const removeFromList = (problems: ProblemStoreItem[]) =>
          problems.filter((p) => p.id !== dialog.target.id);
        return {
          ...prev,
          problems: removeFromList(prev.problems),
          subtopics: prev.subtopics.map((st) => ({
            ...st,
            problems: removeFromList(st.problems),
          })),
        };
      });
      setHasChanges(true);
      setDialog({ type: "idle" });
      return;
    }
    removeProblem(topicId, dialog.target.id);
    setDialog({ type: "idle" });
    toast.success("Problem deleted successfully");
  }

  function handleProblemStatusChange(
    problemId: string,
    status: ProblemStoreItem["status"]
  ) {
    updateProblemStatus(topicId, problemId, status);
    if (isEditing && draft) {
      setDraft((prev) => {
        if (!prev) return prev;
        return updateProblemInDraft(prev, problemId, { status });
      });
    }
  }

  function handleProblemReviewCountChange(problemId: string, count: number) {
    updateProblemReviewCount(topicId, problemId, count);
    if (isEditing && draft) {
      setDraft((prev) => {
        if (!prev) return prev;
        return updateProblemInDraft(prev, problemId, { reviewCount: count });
      });
    }
  }

  function handleProblemMoveUp(problemId: string) {
    if (isEditing) {
      moveProblemInDraft(problemId, "up");
      return;
    }
    moveProblem(topicId, problemId, "up");
  }

  function handleProblemMoveDown(problemId: string) {
    if (isEditing) {
      moveProblemInDraft(problemId, "down");
      return;
    }
    moveProblem(topicId, problemId, "down");
  }

  function handleEnterEditMode() {
    if (!topic) return;
    setDraft(structuredClone(topic));
    setHasChanges(false);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    if (hasChanges) {
      setShowUnsavedDialog(true);
    } else {
      setIsEditing(false);
      setDraft(null);
    }
  }

  function handleDiscardChanges() {
    setShowUnsavedDialog(false);
    setIsEditing(false);
    setDraft(null);
    setHasChanges(false);
  }

  async function handleSave() {
    if (!topic || !draft) return;

    const changes = computeBatchChanges(topic, draft);
    if (!changes.hasAny) {
      setIsEditing(false);
      setDraft(null);
      setHasChanges(false);
      return;
    }

    setIsSaving(true);
    try {
      const operations: Promise<unknown>[] = [];

      for (const st of changes.subtopicUpdates) {
        operations.push(subTopicService.updateSubTopic(st.id, st.input));
      }
      for (const id of changes.subtopicDeletes) {
        operations.push(subTopicService.deleteSubTopic(id));
      }
      for (const p of changes.problemUpdates) {
        operations.push(problemService.updateProblem(p.id, p.input));
      }
      for (const id of changes.problemDeletes) {
        operations.push(problemService.deleteProblem(id));
      }
      for (const ids of changes.problemReorders) {
        operations.push(problemService.reorderProblems(ids));
      }

      const results = await Promise.allSettled(operations);
      const allOk = results.every(
        (r) => r.status === "fulfilled" && r.value !== null && r.value !== false
      );

      const dbTopics = await topicService.getTopics();
      const updatedTopic = dbTopics.find((t: TopicStoreItem) => t.id === topicId);
      if (updatedTopic) {
        replaceTopic(topicId, updatedTopic);
      }

      if (allOk) {
        setIsEditing(false);
        setDraft(null);
        setHasChanges(false);
        toast.success("Changes saved successfully");
      } else {
        toast.error("Some changes failed to save");
      }
    } catch {
      const dbTopics = await topicService.getTopics();
      const updatedTopic = dbTopics.find((t: TopicStoreItem) => t.id === topicId);
      if (updatedTopic) {
        replaceTopic(topicId, updatedTopic);
      }
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  }

  function moveProblemInDraft(problemId: string, direction: "up" | "down") {
    setDraft((prev) => {
      if (!prev) return prev;
      const moveInList = (problems: ProblemStoreItem[]) => {
        const idx = problems.findIndex((p) => p.id === problemId);
        if (idx === -1) return problems;
        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= problems.length) return problems;
        const copy = [...problems];
        [copy[idx], copy[targetIdx]] = [copy[targetIdx], copy[idx]];
        return copy;
      };
      const directMoved = moveInList(prev.problems);
      if (directMoved !== prev.problems) {
        return { ...prev, problems: directMoved };
      }
      for (let i = 0; i < prev.subtopics.length; i++) {
        const moved = moveInList(prev.subtopics[i].problems);
        if (moved !== prev.subtopics[i].problems) {
          const subtopics = prev.subtopics.map((st, si) =>
            si === i ? { ...st, problems: moved } : st
          );
          return { ...prev, subtopics };
        }
      }
      return prev;
    });
    setHasChanges(true);
  }

  function handleDraftSubTopicEdit(
    subtopicId: string,
    input: { name: string; description?: string }
  ) {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        subtopics: prev.subtopics.map((st) =>
          st.id === subtopicId ? { ...st, ...input } : st
        ),
      };
    });
    setHasChanges(true);
  }

  function handleDraftProblemEdit(
    problemId: string,
    input: {
      title: string;
      url?: string;
      difficulty: "EASY" | "MEDIUM" | "HARD";
      subTopicId?: string | null;
      notes?: string;
    }
  ) {
    setDraft((prev) => {
      if (!prev) return prev;
      const updateInList = (problems: ProblemStoreItem[]) =>
        problems.map((p) =>
          p.id === problemId
            ? {
                ...p,
                title: input.title,
                url: input.url,
                difficulty: input.difficulty,
                subTopicId: input.subTopicId ?? null,
                notes: input.notes,
              }
            : p
        );
      return {
        ...prev,
        problems: updateInList(prev.problems),
        subtopics: prev.subtopics.map((st) => ({
          ...st,
          problems: updateInList(st.problems),
        })),
      };
    });
    setHasChanges(true);
  }

  const hasSubtopics = (displayTopic?.subtopics.length ?? 0) > 0;
  const hasDirectProblems = (displayDirectProblems?.length ?? 0) > 0;
  const hasAnyContent = hasSubtopics || hasDirectProblems;

  return (
    <div className="mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
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

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isEditing}
          onClick={() => setDialog({ type: "createSubTopic" })}
        >
          <Plus />
          Add Sub-topic
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isEditing}
          onClick={() => setDialog({ type: "createProblem" })}
        >
          <Plus />
          Add Problem
        </Button>
        <div className="ml-auto flex gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="default"
                disabled={isSaving || !hasChanges}
                onClick={handleSave}
              >
                {isSaving && <Loader2 className="size-3 animate-spin" />}
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isSaving}
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleEnterEditMode}
            >
              <Pencil className="size-3" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      <div className="flex-1 space-y-8">
        {hasSubtopics &&
          displayTopic!.subtopics.map((subtopic) => {
            const vm = subtopicViewModels.find((v) => v.id === subtopic.id);
            if (!vm) return null;
            return (
              <SubtopicSection
                key={subtopic.id}
                subtopic={subtopic}
                viewModel={vm}
                isEditing={isEditing}
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
          <div className="overflow-x-auto">
            <div className="flex w-max min-w-full flex-col gap-3">
            <h2 className="text-base font-medium">Direct Problems</h2>
            {displayDirectProblems.map((problem, idx) => (
              <ProblemRow
                key={problem.id}
                problem={problem}
                isEditing={isEditing}
                isFirst={idx === 0}
                isLast={idx === displayDirectProblems.length - 1}
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
                disabled={isEditing}
                onClick={() => setDialog({ type: "createSubTopic" })}
              >
                <Plus />
                Add Sub-topic
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isEditing}
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
        subtopics={displayTopic?.subtopics ?? []}
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

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={(open) => {
          if (!open) setShowUnsavedDialog(false);
        }}
        onDiscard={handleDiscardChanges}
      />
    </div>
  );
}
