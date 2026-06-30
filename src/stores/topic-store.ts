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
} from "@/lib/topic-service";

interface TopicStoreState {
  topics: TopicStoreItem[];
}

interface TopicStoreActions {
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

export const useTopicStore = create<TopicStore>((set) => ({
  topics: [],

  addTopic: (input) => {
    const newTopic = createTopicService(input);
    set((state) => ({ topics: [...state.topics, newTopic] }));
    return newTopic;
  },

  updateTopic: (id, input) => {
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === id ? updateTopicService(t, input) : t
      ),
    }));
  },

  removeTopic: (id) => {
    set((state) => ({
      topics: state.topics.filter((t) => t.id !== id),
    }));
  },

  addSubTopic: (topicId, input) => {
    const newSubTopic = createSubTopicService({ ...input, topicId });
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === topicId
          ? { ...t, subtopics: [...t.subtopics, newSubTopic] }
          : t
      ),
    }));
    return newSubTopic;
  },

  updateSubTopic: (topicId, subTopicId, input) => {
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
  },

  removeSubTopic: (topicId, subTopicId) => {
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === topicId
          ? { ...t, subtopics: t.subtopics.filter((s) => s.id !== subTopicId) }
          : t
      ),
    }));
  },

  addProblem: (topicId, input) => {
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
    return newProblem;
  },

  updateProblem: (topicId, problemId, input) => {
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
  },

  removeProblem: (topicId, problemId) => {
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
  },

  updateProblemStatus: (topicId, problemId, status) => {
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
                p.id === problemId ? { ...p, status } : p
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
                      p.id === problemId ? { ...p, status } : p
                    ),
                  }
            ),
          };
        }),
      };
    });
  },

  updateProblemReviewCount: (topicId, problemId, reviewCount) => {
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
