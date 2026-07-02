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

export function createProblemService(
  input: CreateProblemInput,
  existingProblems?: Pick<ProblemStoreItem, "sortOrder">[]
): ProblemStoreItem {
  const parsed = createProblemSchema.parse(input);
  const maxSortOrder = existingProblems && existingProblems.length > 0
    ? Math.max(...existingProblems.map((p) => p.sortOrder))
    : -1;
  return {
    id: generateId(),
    title: parsed.title,
    url: parsed.url || undefined,
    difficulty: parsed.difficulty,
    status: "TODO",
    subTopicId: parsed.subTopicId || null,
    notes: parsed.notes,
    reviewCount: 0,
    sortOrder: maxSortOrder + 1,
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

export function updateProblemInDraft(
  draft: TopicStoreItem,
  problemId: string,
  updates: Partial<Pick<ProblemStoreItem, "status" | "reviewCount">>
): TopicStoreItem {
  const updateInList = (problems: ProblemStoreItem[]) =>
    problems.map((p) => (p.id === problemId ? { ...p, ...updates } : p));

  return {
    ...draft,
    problems: updateInList(draft.problems),
    subtopics: draft.subtopics.map((st) => ({
      ...st,
      problems: updateInList(st.problems),
    })),
  };
}

export interface BatchChanges {
  subtopicUpdates: Array<{ id: string; input: UpdateSubTopicInput }>;
  subtopicDeletes: string[];
  problemUpdates: Array<{ id: string; input: UpdateProblemInput }>;
  problemDeletes: string[];
  problemReorders: string[][];
  hasAny: boolean;
}

export function computeBatchChanges(
  original: TopicStoreItem,
  draft: TopicStoreItem
): BatchChanges {
  const subtopicUpdates: BatchChanges["subtopicUpdates"] = [];
  const subtopicDeletes: BatchChanges["subtopicDeletes"] = [];
  const problemUpdates: BatchChanges["problemUpdates"] = [];
  const problemDeletes: BatchChanges["problemDeletes"] = [];
  const problemReorders: BatchChanges["problemReorders"] = [];

  // Subtopic deletes
  for (const origSt of original.subtopics) {
    if (!draft.subtopics.find((s) => s.id === origSt.id)) {
      subtopicDeletes.push(origSt.id);
    }
  }

  // Subtopic updates
  for (const draftSt of draft.subtopics) {
    const origSt = original.subtopics.find((s) => s.id === draftSt.id);
    if (origSt) {
      const changes: UpdateSubTopicInput = {};
      if (origSt.name !== draftSt.name) changes.name = draftSt.name;
      if (origSt.description !== draftSt.description) changes.description = draftSt.description;
      if (Object.keys(changes).length > 0) {
        subtopicUpdates.push({ id: draftSt.id, input: changes });
      }
    }
  }

  // Problem deletes (excluding cascaded from subtopic deletion)
  const deletedSubtopicIds = new Set(subtopicDeletes);
  const allOriginal = getAllProblems(original);
  const allDraft = getAllProblems(draft);

  for (const origP of allOriginal) {
    if (!allDraft.find((p) => p.id === origP.id)) {
      if (origP.subTopicId && deletedSubtopicIds.has(origP.subTopicId)) continue;
      problemDeletes.push(origP.id);
    }
  }

  // Problem updates
  for (const draftP of allDraft) {
    const origP = allOriginal.find((p) => p.id === draftP.id);
    if (origP) {
      const changes: UpdateProblemInput = {};
      if (origP.title !== draftP.title) changes.title = draftP.title;
      if (origP.url !== draftP.url) changes.url = draftP.url;
      if (origP.difficulty !== draftP.difficulty) changes.difficulty = draftP.difficulty;
      if (origP.subTopicId !== draftP.subTopicId) changes.subTopicId = draftP.subTopicId ?? null;
      if (origP.notes !== draftP.notes) changes.notes = draftP.notes;
      if (Object.keys(changes).length > 0) {
        problemUpdates.push({ id: draftP.id, input: changes });
      }
    }
  }

  // Problem reorders per container
  function checkContainer(origProblems: ProblemStoreItem[], draftProblems: ProblemStoreItem[]) {
    const origIds = origProblems.map((p) => p.id);
    const draftIds = draftProblems.map((p) => p.id);
    const changed =
      origIds.length !== draftIds.length ||
      origIds.some((id, i) => id !== draftIds[i]);
    if (changed && draftIds.length > 0) {
      problemReorders.push(draftIds);
    }
  }

  checkContainer(original.problems, draft.problems);

  for (const draftSt of draft.subtopics) {
    const origSt = original.subtopics.find((s) => s.id === draftSt.id);
    if (origSt) {
      checkContainer(origSt.problems, draftSt.problems);
    }
  }

  const hasAny =
    subtopicUpdates.length > 0 ||
    subtopicDeletes.length > 0 ||
    problemUpdates.length > 0 ||
    problemDeletes.length > 0 ||
    problemReorders.length > 0;

  return {
    subtopicUpdates,
    subtopicDeletes,
    problemUpdates,
    problemDeletes,
    problemReorders,
    hasAny,
  };
}
