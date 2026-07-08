"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Cancel01Icon, Edit03Icon, SaveIcon } from "@hugeicons/core-free-icons";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useTopicStore } from "@/stores/topic-store";
import {
  filterTopics,
  paginateTopics,
} from "@/lib/topic-utils";
import { computeTopicCardViewModel } from "@/lib/topic-view-models";
import { LAYOUT } from "@/lib/constants";
import type { CreateTopicInput } from "@/lib/schemas";
import { TopicCard } from "@/components/topics/topic-card";
import { TopicSearch } from "@/components/topics/topic-search";
import { TopicFormDialog } from "@/components/topics/topic-form-dialog";
import { DeleteTopicDialog } from "@/components/topics/delete-topic-dialog";
import { TopicCardSkeleton } from "@/components/topics/topic-skeleton";

export function TopicsPageClient() {
  const router = useRouter();
  const { topics, addTopic, updateTopic, removeTopic } = useTopicStore();
  const hydrated = useTopicStore((s) => s.hydrated);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    id: string;
    name: string;
    description?: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, LAYOUT.DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredTopics = filterTopics(topics, debouncedQuery);
  const { items: paginatedTopics, totalPages, currentPage } = paginateTopics(
    filteredTopics,
    page,
    LAYOUT.PAGE_SIZE
  );

  const allFilteredSelected =
    filteredTopics.length > 0 && selectedIds.size === filteredTopics.length;

  const visibleSelectedCount = paginatedTopics.filter((t) =>
    selectedIds.has(t.id)
  ).length;

  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = new Set(topics.map((t) => t.id));
      const next = new Set(Array.from(prev).filter((id) => validIds.has(id)));
      if (next.size === prev.size) return prev;
      return next;
    });
  }, [topics]);

  function handleEnterEditMode() {
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setSelectedIds(new Set());
  }

  function handleSave() {
    setIsEditing(false);
    setSelectedIds(new Set());
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSelectAll() {
    const allIds = new Set(filteredTopics.map((t) => t.id));
    setSelectedIds(allIds);
  }

  function handleDeselectAll() {
    setSelectedIds(new Set());
  }

  function handleToggleSelectAll() {
    if (allFilteredSelected) {
      handleDeselectAll();
    } else {
      handleSelectAll();
    }
  }

  const handleBatchDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    for (const id of ids) {
      removeTopic(id);
    }
    setSelectedIds(new Set());
    setShowBatchDeleteConfirm(false);
    toast.success(`${ids.length} topic(s) deleted successfully`);
  }, [selectedIds, removeTopic]);

  async function handleCreate(input: CreateTopicInput): Promise<boolean> {
    return addTopic(input);
  }

  async function handleEdit(input: CreateTopicInput): Promise<boolean> {
    if (!editTarget) return false;
    updateTopic(editTarget.id, input);
    toast.success("Topic updated successfully");
    return true;
  }

  function handleDelete() {
    if (!deleteTarget) return;
    removeTopic(deleteTarget.id);
    setDeleteTarget(null);
    toast.success("Topic deleted successfully");
  }

  function handleContinue(id: string) {
    router.push(`/topics/${id}`);
  }

  const hasTopics = topics.length > 0;
  const hasFilteredResults = paginatedTopics.length > 0;

  return (
    <div className="mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4 sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Topics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and manage your DSA topics here.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <HugeiconsIcon icon={SaveIcon} />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                onClick={() => setIsCreateOpen(true)}
              >
                <HugeiconsIcon icon={Add01Icon} />
                Create
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEnterEditMode}
              >
                <HugeiconsIcon icon={Edit03Icon} />
                Edit
              </Button>
            </>
          )}
        </div>
      </div>

      <Separator className="my-6" />

      {isEditing && hasFilteredResults && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2">
          <Checkbox
            checked={allFilteredSelected}
            onCheckedChange={handleToggleSelectAll}
            aria-label={
              allFilteredSelected ? "Deselect all topics" : "Select all topics"
            }
          />
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} of {filteredTopics.length} selected
            {visibleSelectedCount < selectedIds.size &&
              selectedIds.size > 0 && (
                <span className="text-xs">
                  {" "}
                  ({visibleSelectedCount} on this page)
                </span>
              )}
          </span>
          <div className="ml-auto">
            <Button
              size="sm"
              variant="destructive"
              disabled={selectedIds.size === 0}
              onClick={() => setShowBatchDeleteConfirm(true)}
            >
              <HugeiconsIcon icon={Cancel01Icon} />
              Delete Selected ({selectedIds.size})
            </Button>
          </div>
        </div>
      )}

      {hasTopics && (
        <div className="mb-6">
          <TopicSearch value={searchQuery} onChange={setSearchQuery} />
        </div>
      )}

      <div className="flex-1">
        {!hydrated && (
          <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            role="status"
            aria-busy="true"
          >
            <span className="sr-only">Loading topics...</span>
            {Array.from({ length: 6 }, (_, i) => (
              <TopicCardSkeleton key={i} />
            ))}
          </div>
        )}

        {hydrated && !hasTopics && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-lg font-medium">No topics yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first topic to start tracking your DSA progress.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
            >
              <HugeiconsIcon icon={Add01Icon} />
              Create your first topic
            </Button>
          </div>
        )}

        {hydrated && hasTopics && !hasFilteredResults && (
          <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
            <p className="text-lg font-medium">No results found</p>
            <p className="text-sm text-muted-foreground">
              No topics match your search. Try a different query.
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          </div>
        )}

        {hydrated && hasFilteredResults && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={computeTopicCardViewModel(topic)}
                  isEditing={isEditing}
                  isSelected={selectedIds.has(topic.id)}
                  onToggleSelect={handleToggleSelect}
                  onContinue={handleContinue}
                  onEdit={(id) => {
                    const t = topics.find((x) => x.id === id);
                    if (t) setEditTarget({ id: t.id, name: t.name, description: t.description });
                  }}
                  onDelete={(id) => {
                    const t = topics.find((x) => x.id === id);
                    if (t) setDeleteTarget({ id: t.id, name: t.name });
                  }}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        setPage((p) => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <PaginationItem key={p}>
                        <Button
                          variant={p === currentPage ? "outline" : "ghost"}
                          size="sm"
                          className="min-w-8"
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        setPage((p) => Math.min(totalPages, p + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      <TopicFormDialog
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
      />

      <TopicFormDialog
        key={editTarget?.id ?? "no-edit"}
        mode="edit"
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        onSubmit={handleEdit}
        initialValues={
          editTarget
            ? { name: editTarget.name, description: editTarget.description }
            : undefined
        }
      />

      <DeleteTopicDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        topicName={deleteTarget?.name ?? ""}
        onConfirm={handleDelete}
      />

      <AlertDialog
        open={showBatchDeleteConfirm}
        onOpenChange={setShowBatchDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topics</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} topic(s)? This
              will also remove all subtopics and problems within them. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleBatchDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
