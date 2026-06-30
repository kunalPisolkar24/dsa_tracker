"use client";

import { create } from "zustand";
import type { TopicStoreItem } from "@/types/topics";
import type { CreateTopicInput, UpdateTopicInput } from "@/lib/schemas";
import {
  createTopicService,
  updateTopicService,
} from "@/lib/topic-service";

interface TopicStoreState {
  topics: TopicStoreItem[];
}

interface TopicStoreActions {
  addTopic: (input: CreateTopicInput) => TopicStoreItem;
  updateTopic: (id: string, input: UpdateTopicInput) => void;
  removeTopic: (id: string) => void;
}

type TopicStore = TopicStoreState & TopicStoreActions;

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
}));
