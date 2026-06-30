import type { TopicStoreItem } from "@/types/topics";

export interface DifficultyStats {
  solved: number;
  total: number;
}

export interface TopicRadarEntry {
  topic: string;
  solved: number;
}

export interface RecentActivityEntry {
  id: string;
  title: string;
  status: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solvedAt: string;
  topic: string;
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

export interface WeeklySolvedEntry {
  date: string;
  count: number;
}

export interface DashboardData {
  solvedToday: number;
  streak: number;
  maxStreak: number;
  weeklySolved: WeeklySolvedEntry[];
  difficultyBreakdown: Record<"EASY" | "MEDIUM" | "HARD", DifficultyStats>;
  totalSolved: number;
  totalProblems: number;
  topicRadar: TopicRadarEntry[];
  reviewStats: { solved: number; markedForReview: number };
  heatmap: HeatmapEntry[];
  recentActivity: RecentActivityEntry[];
}

function getAllProblems(topic: TopicStoreItem) {
  const all = [...topic.problems];
  for (const st of topic.subtopics) {
    all.push(...st.problems);
  }
  return all;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function countConsecutiveDays(
  solveDates: Set<string>,
  from: Date,
  direction: "backward" | "forward"
): number {
  let count = 0;
  const current = new Date(from);
  while (true) {
    const key = toDateStr(current);
    if (!solveDates.has(key)) break;
    count++;
    if (direction === "backward") {
      current.setDate(current.getDate() - 1);
    } else {
      current.setDate(current.getDate() + 1);
    }
  }
  return count;
}

export function computeDashboardData(topics: TopicStoreItem[]): DashboardData {
  const now = new Date();
  const todayStr = toDateStr(now);

  const allProblems: { problem: (typeof topics)[number]["problems"][number]; topicName: string }[] = [];

  for (const topic of topics) {
    const problems = getAllProblems(topic);
    for (const p of problems) {
      allProblems.push({ problem: p, topicName: topic.name });
    }
  }

  const totalProblems = allProblems.length;

  const solvedProblems = allProblems.filter(({ problem }) => problem.status === "SOLVED");
  const totalSolved = solvedProblems.length;
  const markedForReview = allProblems.filter(
    ({ problem }) => problem.status === "MARKED_FOR_REVIEW"
  ).length;

  const solvedToday = solvedProblems.filter(
    ({ problem }) => problem.solvedAt && toDateStr(new Date(problem.solvedAt)) === todayStr
  ).length;

  const difficultyBreakdown: Record<"EASY" | "MEDIUM" | "HARD", DifficultyStats> = {
    EASY: { solved: 0, total: 0 },
    MEDIUM: { solved: 0, total: 0 },
    HARD: { solved: 0, total: 0 },
  };

  for (const { problem } of allProblems) {
    const bucket = difficultyBreakdown[problem.difficulty];
    bucket.total++;
    if (problem.status === "SOLVED") bucket.solved++;
  }

  const topicSolveCount = new Map<string, number>();
  for (const { problem, topicName } of solvedProblems) {
    topicSolveCount.set(topicName, (topicSolveCount.get(topicName) ?? 0) + 1);
  }
  const topicRadar: TopicRadarEntry[] = Array.from(topicSolveCount.entries())
    .map(([topic, solved]) => ({ topic, solved }))
    .sort((a, b) => b.solved - a.solved)
    .slice(0, 6);

  const solveDateCounts = new Map<string, number>();
  const allSolveDates: string[] = [];
  for (const { problem } of solvedProblems) {
    if (!problem.solvedAt) continue;
    const dateStr = toDateStr(new Date(problem.solvedAt));
    solveDateCounts.set(dateStr, (solveDateCounts.get(dateStr) ?? 0) + 1);
    allSolveDates.push(dateStr);
  }

  const solveDateSet = new Set(allSolveDates);

  const weeklySolved: WeeklySolvedEntry[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = toDateStr(d);
    weeklySolved.push({
      date: dateStr,
      count: solveDateCounts.get(dateStr) ?? 0,
    });
  }

  const streak = countConsecutiveDays(solveDateSet, now, "backward");

  let maxStreak = 0;
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const currentStreakStart = new Date(yearStart);
  while (currentStreakStart <= now) {
    const s = countConsecutiveDays(solveDateSet, currentStreakStart, "forward");
    if (s > maxStreak) maxStreak = s;
    currentStreakStart.setDate(currentStreakStart.getDate() + (s || 1));
  }

  const heatmap: HeatmapEntry[] = [];
  const heatmapStart = new Date(now.getFullYear(), 0, 1);
  heatmapStart.setFullYear(heatmapStart.getFullYear() - 1);
  for (let d = new Date(heatmapStart); d <= now; d.setDate(d.getDate() + 1)) {
    const dateStr = toDateStr(d);
    heatmap.push({
      date: dateStr,
      count: solveDateCounts.get(dateStr) ?? 0,
    });
  }

  const recentActivity: RecentActivityEntry[] = solvedProblems
    .map(({ problem, topicName }) => ({
      id: problem.id,
      title: problem.title,
      status: problem.status,
      difficulty: problem.difficulty,
      solvedAt: problem.solvedAt!,
      topic: topicName,
    }))
    .sort((a, b) => new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime())
    .slice(0, 10);

  return {
    solvedToday,
    streak,
    maxStreak,
    weeklySolved,
    difficultyBreakdown,
    totalSolved,
    totalProblems,
    topicRadar,
    reviewStats: { solved: totalSolved, markedForReview },
    heatmap,
    recentActivity,
  };
}
