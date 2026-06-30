"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { SubTopicStoreItem } from "@/types/topics";

interface ProblemFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: {
    title: string;
    url?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    subTopicId?: string | null;
    notes?: string;
  }) => void;
  subtopics: SubTopicStoreItem[];
  initialValues?: {
    title: string;
    url?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    subTopicId?: string | null;
    notes?: string;
  };
}

const DIFFICULTY_OPTIONS = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
] as const;

export function ProblemFormDialog({
  mode,
  open,
  onOpenChange,
  onSubmit,
  subtopics,
  initialValues,
}: ProblemFormDialogProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [url, setUrl] = useState(initialValues?.url ?? "");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    initialValues?.difficulty ?? "EASY"
  );
  const [subTopicId, setSubTopicId] = useState<string | null>(
    initialValues?.subTopicId ?? null
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = mode === "edit";

  function handleSubmit() {
    setErrors({});
    const fieldErrors: typeof errors = {};
    if (!title.trim()) fieldErrors.title = "Problem title is required";
    if (url.trim() && !/^https?:\/\/.+/.test(url.trim())) {
      fieldErrors.url = "Invalid URL (must start with http:// or https://)";
    }
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      onSubmit({
        title: title.trim(),
        url: url.trim() || undefined,
        difficulty,
        subTopicId: subTopicId || null,
        notes: notes.trim() || undefined,
      });
      if (!isEdit) {
        setTitle("");
        setUrl("");
        setDifficulty("EASY");
        setSubTopicId(null);
        setNotes("");
      }
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Problem" : "Create Problem"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the problem details below."
              : "Add a new problem to track your progress."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-title">Title</Label>
            <Input
              id="p-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Two Sum"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-url">URL</Label>
            <Input
              id="p-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/two-sum/"
              disabled={isSubmitting}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-difficulty">Difficulty</Label>
            <Select
              value={difficulty}
              onValueChange={(v) => setDifficulty(v as "EASY" | "MEDIUM" | "HARD")}
              disabled={isSubmitting}
            >
              <SelectTrigger id="p-difficulty" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-subtopic">Sub-topic</Label>
            <Select
              value={subTopicId ?? "none"}
              onValueChange={(v) => setSubTopicId(v === "none" ? null : v)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="p-subtopic" className="w-full">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (direct problem)</SelectItem>
                {subtopics.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-notes">Notes</Label>
            <Textarea
              id="p-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes or observations..."
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
