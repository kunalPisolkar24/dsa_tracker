import {
  createTopicSchema,
  updateTopicSchema,
  type CreateTopicInput,
  type UpdateTopicInput,
} from "@/lib/schemas";
import type { TopicStoreItem, TopicCardViewModel } from "@/types/topics";

function generateId(): string {
  return crypto.randomUUID();
}

export function createTopicService(input: CreateTopicInput): TopicStoreItem {
  const parsed = createTopicSchema.parse(input);
  return {
    id: generateId(),
    name: parsed.name,
    description: parsed.description,
    subtopics: [],
    problems: [],
  };
}

export function updateTopicService(
  topic: TopicStoreItem,
  input: UpdateTopicInput
): TopicStoreItem {
  const parsed = updateTopicSchema.parse(input);
  return {
    ...topic,
    ...(parsed.name !== undefined && { name: parsed.name }),
    ...(parsed.description !== undefined && { description: parsed.description }),
  };
}

export function filterTopics(
  topics: TopicStoreItem[],
  query: string
): TopicStoreItem[] {
  if (!query.trim()) return topics;
  const lowerQuery = query.toLowerCase();
  return topics.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      (t.description?.toLowerCase().includes(lowerQuery) ?? false)
  );
}

export function paginateTopics<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const start = (clampedPage - 1) * pageSize;
  const paginatedItems = items.slice(start, start + pageSize);
  return { items: paginatedItems, totalPages, currentPage: clampedPage };
}

export function computeTopicCardViewModel(
  topic: TopicStoreItem
): TopicCardViewModel {
  const allProblems = [...topic.problems];
  for (const subtopic of topic.subtopics) {
    allProblems.push(...subtopic.problems);
  }
  const totalProblems = allProblems.length;
  const solvedProblems = allProblems.filter(
    (p) => p.status === "SOLVED"
  ).length;
  const progressPercent = totalProblems > 0
    ? Math.round((solvedProblems / totalProblems) * 100)
    : 0;

  return {
    id: topic.id,
    name: topic.name,
    description: topic.description,
    totalProblems,
    solvedProblems,
    progressPercent,
  };
}
