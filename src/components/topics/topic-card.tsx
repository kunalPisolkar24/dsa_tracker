"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Edit03Icon } from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { TopicCardViewModel } from "@/types/topics";

interface TopicCardProps {
  topic: TopicCardViewModel;
  isEditing: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onContinue: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TopicCard({
  topic,
  isEditing,
  isSelected,
  onToggleSelect,
  onContinue,
  onEdit,
  onDelete,
}: TopicCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isEditing && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(topic.id)}
                aria-label={`Select ${topic.name}`}
                className="shrink-0 mt-0.5"
              />
            )}
            <CardTitle className="text-base truncate">{topic.name}</CardTitle>
          </div>
          {isEditing && (
            <div className="flex shrink-0 items-center rounded-xl border border-border bg-card p-0.5 gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(topic.id)}
                aria-label={`Edit ${topic.name}`}
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
                onClick={() => onDelete(topic.id)}
                aria-label={`Delete ${topic.name}`}
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
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {topic.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {topic.description}
          </p>
        )}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>
              {topic.solvedProblems}/{topic.totalProblems}
            </span>
          </div>
          <Progress value={topic.progressPercent} />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="sm"
          onClick={() => onContinue(topic.id)}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
