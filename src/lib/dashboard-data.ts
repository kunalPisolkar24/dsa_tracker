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

function generateWeeklySolvedData(): WeeklySolvedEntry[] {
  const data: WeeklySolvedEntry[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    data.push({
      date: `${y}-${m}-${day}`,
      count: Math.floor(Math.random() * 8) + 1,
    });
  }
  return data;
}

function generateHeatmapData(): HeatmapEntry[] {
  const data: HeatmapEntry[] = [];
  const now = new Date();
  const start = new Date(now.getFullYear() - 1, 0, 1);
  for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    data.push({
      date: `${y}-${m}-${day}`,
      count: Math.random() < 0.6 ? 0 : Math.floor(Math.random() * 5) + 1,
    });
  }
  return data;
}

export function getDashboardData(): DashboardData {
  return {
    solvedToday: 5,
    streak: 12,
    maxStreak: 24,
    weeklySolved: generateWeeklySolvedData(),
    difficultyBreakdown: {
      EASY: { solved: 25, total: 40 },
      MEDIUM: { solved: 14, total: 42 },
      HARD: { solved: 3, total: 15 },
    },
    totalSolved: 42,
    totalProblems: 97,
    topicRadar: [
      { topic: "Arrays", solved: 12 },
      { topic: "Trees", solved: 8 },
      { topic: "Dynamic Programming", solved: 6 },
      { topic: "Sorting", solved: 5 },
      { topic: "Strings", solved: 4 },
      { topic: "Graphs", solved: 3 },
    ],
    reviewStats: { solved: 42, markedForReview: 8 },
    heatmap: generateHeatmapData(),
    recentActivity: [
      { id: "1", title: "Two Sum", status: "SOLVED", difficulty: "EASY", solvedAt: new Date(Date.now() - 2 * 3600000).toISOString(), topic: "Arrays" },
      { id: "2", title: "Merge k Sorted Lists", status: "SOLVED", difficulty: "HARD", solvedAt: new Date(Date.now() - 5 * 3600000).toISOString(), topic: "Linked Lists" },
      { id: "3", title: "Reverse Linked List", status: "SOLVED", difficulty: "MEDIUM", solvedAt: new Date(Date.now() - 24 * 3600000).toISOString(), topic: "Linked Lists" },
      { id: "4", title: "Binary Tree Inorder Traversal", status: "SOLVED", difficulty: "MEDIUM", solvedAt: new Date(Date.now() - 28 * 3600000).toISOString(), topic: "Trees" },
      { id: "5", title: "Valid Parentheses", status: "SOLVED", difficulty: "EASY", solvedAt: new Date(Date.now() - 48 * 3600000).toISOString(), topic: "Stacks" },
      { id: "6", title: "LRU Cache", status: "SOLVED", difficulty: "MEDIUM", solvedAt: new Date(Date.now() - 52 * 3600000).toISOString(), topic: "Design" },
      { id: "7", title: "Maximum Subarray", status: "SOLVED", difficulty: "MEDIUM", solvedAt: new Date(Date.now() - 72 * 3600000).toISOString(), topic: "Arrays" },
      { id: "8", title: "Climbing Stairs", status: "SOLVED", difficulty: "EASY", solvedAt: new Date(Date.now() - 76 * 3600000).toISOString(), topic: "Dynamic Programming" },
      { id: "9", title: "Longest Palindromic Substring", status: "SOLVED", difficulty: "MEDIUM", solvedAt: new Date(Date.now() - 96 * 3600000).toISOString(), topic: "Strings" },
      { id: "10", title: "Serialize and Deserialize Binary Tree", status: "SOLVED", difficulty: "HARD", solvedAt: new Date(Date.now() - 100 * 3600000).toISOString(), topic: "Trees" },
    ],
  };
}
