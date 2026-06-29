import { create } from "zustand";

interface TrackerState {
  count: number;
  increment: () => void;
}

export const useTrackerStore = create<TrackerState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
