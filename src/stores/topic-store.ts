"use client";

import { create } from "zustand";
import type { TopicStoreItem, SubTopicStoreItem, ProblemStoreItem } from "@/types/topics";
import type {
  CreateTopicInput,
  UpdateTopicInput,
  CreateSubTopicInput,
  UpdateSubTopicInput,
  CreateProblemInput,
  UpdateProblemInput,
} from "@/lib/schemas";
import {
  createTopicService,
  updateTopicService,
  createSubTopicService,
  updateSubTopicService,
  createProblemService,
  updateProblemService,
  moveProblemInArray,
} from "@/lib/topic-utils";
import * as topicService from "@/lib/services/topic-service";
import * as subTopicService from "@/lib/services/subtopic-service";
import * as problemService from "@/lib/services/problem-service";

interface TopicStoreState {
  topics: TopicStoreItem[];
  hydrated: boolean;
  hydrating: boolean;
  hydrationError: boolean;
}

interface TopicStoreActions {
  hydrate: () => Promise<void>;
  addTopic: (input: CreateTopicInput) => TopicStoreItem;
  updateTopic: (id: string, input: UpdateTopicInput) => void;
  removeTopic: (id: string) => void;
  addSubTopic: (topicId: string, input: Omit<CreateSubTopicInput, "topicId">) => SubTopicStoreItem;
  updateSubTopic: (topicId: string, subTopicId: string, input: UpdateSubTopicInput) => void;
  removeSubTopic: (topicId: string, subTopicId: string) => void;
  addProblem: (topicId: string, input: Omit<CreateProblemInput, "topicId">) => ProblemStoreItem;
  updateProblem: (topicId: string, problemId: string, input: UpdateProblemInput) => void;
  removeProblem: (topicId: string, problemId: string) => void;
  updateProblemStatus: (topicId: string, problemId: string, status: ProblemStoreItem["status"]) => void;
  updateProblemReviewCount: (topicId: string, problemId: string, reviewCount: number) => void;
  moveProblem: (topicId: string, problemId: string, direction: "up" | "down") => void;
}

type TopicStore = TopicStoreState & TopicStoreActions;

function findProblemContainer(
  topics: TopicStoreItem[],
  topicId: string,
  problemId: string
): { topicIdx: number; subTopicIdx: number | null; problemIdx: number } | null {
  const topicIdx = topics.findIndex((t) => t.id === topicId);
  if (topicIdx === -1) return null;

  const topic = topics[topicIdx];
  const directIdx = topic.problems.findIndex((p) => p.id === problemId);
  if (directIdx !== -1) return { topicIdx, subTopicIdx: null, problemIdx: directIdx };

  for (let s = 0; s < topic.subtopics.length; s++) {
    const pIdx = topic.subtopics[s].problems.findIndex((p) => p.id === problemId);
    if (pIdx !== -1) return { topicIdx, subTopicIdx: s, problemIdx: pIdx };
  }

  return null;
}

export const useTopicStore = create<TopicStore>((set, get) => ({
  topics: [],
  hydrated: false,
  hydrating: false,
  hydrationError: false,

  hydrate: async () => {
    if (get().hydrated) return;
    set({ hydrating: true });
    try {
      const dbTopics = await topicService.getTopics();
      if (dbTopics.length > 0) {
        set({ topics: dbTopics, hydrated: true, hydrating: false, hydrationError: false });
      } else {
        set({ hydrated: true, hydrating: false, hydrationError: false });
      }
    } catch {
      set({ hydrated: true, hydrating: false, hydrationError: true });
    }
  },

  addTopic: (input) => {
    const snapshot = get().topics;
    const newTopic = createTopicService(input);
    set((state) => ({ topics: [...state.topics, newTopic] }));
    topicService.createTopic(input).then((dbTopic) => {
      if (dbTopic) {
        set((state) => ({
          topics: state.topics.map((t) => (t.id === newTopic.id ? dbTopic : t)),
        }));
      } else {
        set({ topics: snapshot });
      }
    });
    return newTopic;
  },

  updateTopic: (id, input) => {
    const snapshot = get().topics;
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === id ? updateTopicService(t, input) : t
      ),
    }));
    topicService.updateTopic(id, input).then((dbTopic) => {
      if (!dbTopic) set({ topics: snapshot });
    });
  },

  removeTopic: (id) => {
    const snapshot = get().topics;
    set((state) => ({
      topics: state.topics.filter((t) => t.id !== id),
    }));
    topicService.deleteTopic(id).then((success) => {
      if (!success) set({ topics: snapshot });
    });
  },

  addSubTopic: (topicId, input) => {
    const snapshot = get().topics;
    const newSubTopic = createSubTopicService({ ...input, topicId });
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === topicId
          ? { ...t, subtopics: [...t.subtopics, newSubTopic] }
          : t
      ),
    }));
    subTopicService.createSubTopic(topicId, input).then((dbSubTopic) => {
      if (dbSubTopic) {
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id === topicId
              ? {
                  ...t,
                  subtopics: t.subtopics.map((s) =>
                    s.id === newSubTopic.id ? dbSubTopic : s
                  ),
                }
              : t
          ),
        }));
      } else {
        set({ topics: snapshot });
      }
    });
    return newSubTopic;
  },

  updateSubTopic: (topicId, subTopicId, input) => {
    const snapshot = get().topics;
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id !== topicId
          ? t
          : {
              ...t,
              subtopics: t.subtopics.map((s) =>
                s.id === subTopicId ? updateSubTopicService(s, input) : s
              ),
            }
      ),
    }));
    subTopicService.updateSubTopic(subTopicId, input).then((dbSubTopic) => {
      if (!dbSubTopic) set({ topics: snapshot });
    });
  },

  removeSubTopic: (topicId, subTopicId) => {
    const snapshot = get().topics;
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === topicId
          ? { ...t, subtopics: t.subtopics.filter((s) => s.id !== subTopicId) }
          : t
      ),
    }));
    subTopicService.deleteSubTopic(subTopicId).then((success) => {
      if (!success) set({ topics: snapshot });
    });
  },

  addProblem: (topicId, input) => {
    const snapshot = get().topics;
    const newProblem = createProblemService({ ...input, topicId });
    set((state) => ({
      topics: state.topics.map((t) => {
        if (t.id !== topicId) return t;
        if (input.subTopicId) {
          return {
            ...t,
            subtopics: t.subtopics.map((s) =>
              s.id === input.subTopicId
                ? { ...s, problems: [...s.problems, newProblem] }
                : s
            ),
          };
        }
        return { ...t, problems: [...t.problems, newProblem] };
      }),
    }));
    problemService.createProblem(topicId, input).then((dbProblem) => {
      if (dbProblem) {
        set((state) => ({
          topics: state.topics.map((t) => {
            if (t.id !== topicId) return t;
            const updateProblemInList = (problems: ProblemStoreItem[]) =>
              problems.map((p) => (p.id === newProblem.id ? dbProblem : p));
            if (input.subTopicId) {
              return {
                ...t,
                subtopics: t.subtopics.map((s) =>
                  s.id === input.subTopicId
                    ? { ...s, problems: updateProblemInList(s.problems) }
                    : s
                ),
              };
            }
            return { ...t, problems: updateProblemInList(t.problems) };
          }),
        }));
      } else {
        set({ topics: snapshot });
      }
    });
    return newProblem;
  },

  updateProblem: (topicId, problemId, input) => {
    const snapshot = get().topics;
    set((state) => {
      const container = findProblemContainer(state.topics, topicId, problemId);
      if (!container) return state;

      return {
        topics: state.topics.map((t, ti) => {
          if (ti !== container.topicIdx) return t;
          if (container.subTopicIdx === null) {
            return {
              ...t,
              problems: t.problems.map((p) =>
                p.id === problemId ? updateProblemService(p, input) : p
              ),
            };
          }
          return {
            ...t,
            subtopics: t.subtopics.map((s, si) =>
              si !== container.subTopicIdx
                ? s
                : {
                    ...s,
                    problems: s.problems.map((p) =>
                      p.id === problemId ? updateProblemService(p, input) : p
                    ),
                  }
            ),
          };
        }),
      };
    });
    problemService.updateProblem(problemId, input).then((dbProblem) => {
      if (!dbProblem) set({ topics: snapshot });
    });
  },

  removeProblem: (topicId, problemId) => {
    const snapshot = get().topics;
    set((state) => {
      const container = findProblemContainer(state.topics, topicId, problemId);
      if (!container) return state;

      return {
        topics: state.topics.map((t, ti) => {
          if (ti !== container.topicIdx) return t;
          if (container.subTopicIdx === null) {
            return {
              ...t,
              problems: t.problems.filter((p) => p.id !== problemId),
            };
          }
          return {
            ...t,
            subtopics: t.subtopics.map((s, si) =>
              si !== container.subTopicIdx
                ? s
                : { ...s, problems: s.problems.filter((p) => p.id !== problemId) }
            ),
          };
        }),
      };
    });
    problemService.deleteProblem(problemId).then((success) => {
      if (!success) set({ topics: snapshot });
    });
  },

  updateProblemStatus: (topicId, problemId, status) => {
    const snapshot = get().topics;
    set((state) => {
      const container = findProblemContainer(state.topics, topicId, problemId);
      if (!container) return state;

      return {
        topics: state.topics.map((t, ti) => {
          if (ti !== container.topicIdx) return t;
          if (container.subTopicIdx === null) {
            return {
              ...t,
              problems: t.problems.map((p) =>
                p.id === problemId
                  ? {
                      ...p,
                      status,
                      ...(status === "SOLVED" ? { solvedAt: new Date().toISOString() } : {}),
                    }
                  : p
              ),
            };
          }
          return {
            ...t,
            subtopics: t.subtopics.map((s, si) =>
              si !== container.subTopicIdx
                ? s
                : {
                    ...s,
                    problems: s.problems.map((p) =>
                      p.id === problemId
                        ? {
                            ...p,
                            status,
                            ...(status === "SOLVED" ? { solvedAt: new Date().toISOString() } : {}),
                          }
                        : p
                    ),
                  }
            ),
          };
        }),
      };
    });
    problemService.updateProblemStatus(problemId, status).then((result) => {
      if (!result) set({ topics: snapshot });
    });
  },

  updateProblemReviewCount: (topicId, problemId, reviewCount) => {
    const snapshot = get().topics;
    set((state) => {
      const container = findProblemContainer(state.topics, topicId, problemId);
      if (!container) return state;

      return {
        topics: state.topics.map((t, ti) => {
          if (ti !== container.topicIdx) return t;
          if (container.subTopicIdx === null) {
            return {
              ...t,
              problems: t.problems.map((p) =>
                p.id === problemId ? { ...p, reviewCount } : p
              ),
            };
          }
          return {
            ...t,
            subtopics: t.subtopics.map((s, si) =>
              si !== container.subTopicIdx
                ? s
                : {
                    ...s,
                    problems: s.problems.map((p) =>
                      p.id === problemId ? { ...p, reviewCount } : p
                    ),
                  }
            ),
          };
        }),
      };
    });
    problemService.updateProblemReviewCount(problemId, reviewCount).then((result) => {
      if (!result) set({ topics: snapshot });
    });
  },

  moveProblem: (topicId, problemId, direction) => {
    set((state) => {
      const container = findProblemContainer(state.topics, topicId, problemId);
      if (!container) return state;

      return {
        topics: state.topics.map((t, ti) => {
          if (ti !== container.topicIdx) return t;
          if (container.subTopicIdx === null) {
            return {
              ...t,
              problems: moveProblemInArray(t.problems, problemId, direction),
            };
          }
          return {
            ...t,
            subtopics: t.subtopics.map((s, si) =>
              si !== container.subTopicIdx
                ? s
                : {
                    ...s,
                    problems: moveProblemInArray(s.problems, problemId, direction),
                  }
            ),
          };
        }),
      };
    });
  },
}));
