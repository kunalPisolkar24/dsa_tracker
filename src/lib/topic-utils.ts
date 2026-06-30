import {
  createTopicSchema,
  updateTopicSchema,
  createSubTopicSchema,
  updateSubTopicSchema,
  createProblemSchema,
  updateProblemSchema,
  type CreateTopicInput,
  type UpdateTopicInput,
  type CreateSubTopicInput,
  type UpdateSubTopicInput,
  type CreateProblemInput,
  type UpdateProblemInput,
} from "@/lib/schemas";
import type {
  TopicStoreItem,
  SubTopicStoreItem,
  ProblemStoreItem,
  TopicCardViewModel,
  SubtopicViewModel,
} from "@/types/topics";

function generateId(): string {
  return crypto.randomUUID();
}

export function getAllProblems(topic: TopicStoreItem): ProblemStoreItem[] {
  const all = [...topic.problems];
  for (const subtopic of topic.subtopics) {
    all.push(...subtopic.problems);
  }
  return all;
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
  const allProblems = getAllProblems(topic);
  const totalProblems = allProblems.length;
  const solvedProblems = allProblems.filter(
    (p) => p.status === "SOLVED"
  ).length;
  const progressPercent =
    totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  return {
    id: topic.id,
    name: topic.name,
    description: topic.description,
    totalProblems,
    solvedProblems,
    progressPercent,
  };
}

export function computeSubtopicViewModel(
  subtopic: SubTopicStoreItem
): SubtopicViewModel {
  const totalProblems = subtopic.problems.length;
  const solvedProblems = subtopic.problems.filter(
    (p) => p.status === "SOLVED"
  ).length;
  const progressPercent =
    totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  return {
    id: subtopic.id,
    name: subtopic.name,
    description: subtopic.description,
    totalProblems,
    solvedProblems,
    progressPercent,
  };
}

export function createSubTopicService(
  input: CreateSubTopicInput
): SubTopicStoreItem {
  const parsed = createSubTopicSchema.parse(input);
  return {
    id: generateId(),
    name: parsed.name,
    description: parsed.description,
    problems: [],
  };
}

export function updateSubTopicService(
  subTopic: SubTopicStoreItem,
  input: UpdateSubTopicInput
): SubTopicStoreItem {
  const parsed = updateSubTopicSchema.parse(input);
  return {
    ...subTopic,
    ...(parsed.name !== undefined && { name: parsed.name }),
    ...(parsed.description !== undefined && {
      description: parsed.description,
    }),
  };
}

export function createProblemService(input: CreateProblemInput): ProblemStoreItem {
  const parsed = createProblemSchema.parse(input);
  return {
    id: generateId(),
    title: parsed.title,
    url: parsed.url || undefined,
    difficulty: parsed.difficulty,
    status: "TODO",
    subTopicId: parsed.subTopicId || null,
    notes: parsed.notes,
    reviewCount: 0,
  };
}

export function updateProblemService(
  problem: ProblemStoreItem,
  input: UpdateProblemInput
): ProblemStoreItem {
  const parsed = updateProblemSchema.parse(input);
  return {
    ...problem,
    ...(parsed.title !== undefined && { title: parsed.title }),
    ...(parsed.url !== undefined && { url: parsed.url || undefined }),
    ...(parsed.difficulty !== undefined && { difficulty: parsed.difficulty }),
    ...(parsed.subTopicId !== undefined && { subTopicId: parsed.subTopicId }),
    ...(parsed.notes !== undefined && { notes: parsed.notes }),
  };
}

export function moveProblemInArray(
  problems: ProblemStoreItem[],
  problemId: string,
  direction: "up" | "down"
): ProblemStoreItem[] {
  const idx = problems.findIndex((p) => p.id === problemId);
  if (idx === -1) return problems;
  const targetIdx = direction === "up" ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= problems.length) return problems;
  const copy = [...problems];
  [copy[idx], copy[targetIdx]] = [copy[targetIdx], copy[idx]];
  return copy;
}
