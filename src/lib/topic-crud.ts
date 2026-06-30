"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import type {
  TopicStoreItem,
  SubTopicStoreItem,
  ProblemStoreItem,
} from "@/types/topics";
import type {
  CreateTopicInput,
  UpdateTopicInput,
  CreateSubTopicInput,
  UpdateSubTopicInput,
  CreateProblemInput,
  UpdateProblemInput,
} from "@/lib/schemas";

async function getUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

function mapPrismaProblem(p: {
  id: string;
  title: string;
  url: string | null;
  difficulty: string;
  status: string;
  reviewCount: number;
  notes: string | null;
  lastSolvedAt: Date | null;
  subTopicId: string | null;
}): ProblemStoreItem {
  return {
    id: p.id,
    title: p.title,
    url: p.url ?? undefined,
    difficulty: p.difficulty as ProblemStoreItem["difficulty"],
    status: p.status as ProblemStoreItem["status"],
    reviewCount: p.reviewCount,
    notes: p.notes ?? undefined,
    solvedAt: p.lastSolvedAt?.toISOString() ?? undefined,
    subTopicId: p.subTopicId,
  };
}

function mapPrismaTopic(t: {
  id: string;
  name: string;
  description: string | null;
  subTopics: Array<{
    id: string;
    name: string;
    description: string | null;
    problems: Array<{
      id: string;
      title: string;
      url: string | null;
      difficulty: string;
      status: string;
      reviewCount: number;
      notes: string | null;
      lastSolvedAt: Date | null;
      subTopicId: string | null;
    }>;
  }>;
  problems: Array<{
    id: string;
    title: string;
    url: string | null;
    difficulty: string;
    status: string;
    reviewCount: number;
    notes: string | null;
    lastSolvedAt: Date | null;
    subTopicId: string | null;
  }>;
}): TopicStoreItem {
  return {
    id: t.id,
    name: t.name,
    description: t.description ?? undefined,
    subtopics: t.subTopics.map((st) => ({
      id: st.id,
      name: st.name,
      description: st.description ?? undefined,
      problems: st.problems.map(mapPrismaProblem),
    })),
    problems: t.problems.map(mapPrismaProblem),
  };
}

export async function getTopics(): Promise<TopicStoreItem[]> {
  try {
    const userId = await getUserId();
    const topics = await prisma.topic.findMany({
      where: { userId },
      include: {
        subTopics: {
          include: { problems: true },
        },
        problems: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return topics.map(mapPrismaTopic);
  } catch (error) {
    logger.error("Failed to fetch topics", {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

export async function createTopic(
  input: CreateTopicInput
): Promise<TopicStoreItem | null> {
  try {
    const userId = await getUserId();
    const topic = await prisma.topic.create({
      data: {
        userId,
        name: input.name,
        description: input.description,
      },
      include: {
        subTopics: { include: { problems: true } },
        problems: true,
      },
    });
    return mapPrismaTopic(topic);
  } catch (error) {
    logger.error("Failed to create topic", {
      input,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function updateTopic(
  id: string,
  input: UpdateTopicInput
): Promise<TopicStoreItem | null> {
  try {
    const userId = await getUserId();
    const topic = await prisma.topic.update({
      where: { id, userId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
      },
      include: {
        subTopics: { include: { problems: true } },
        problems: true,
      },
    });
    return mapPrismaTopic(topic);
  } catch (error) {
    logger.error("Failed to update topic", {
      id,
      input,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function deleteTopic(id: string): Promise<boolean> {
  try {
    const userId = await getUserId();
    await prisma.topic.delete({
      where: { id, userId },
    });
    return true;
  } catch (error) {
    logger.error("Failed to delete topic", {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export async function createSubTopic(
  topicId: string,
  input: Omit<CreateSubTopicInput, "topicId">
): Promise<SubTopicStoreItem | null> {
  try {
    const userId = await getUserId();
    const topic = await prisma.topic.findUnique({
      where: { id: topicId, userId },
    });
    if (!topic) return null;

    const subTopic = await prisma.subTopic.create({
      data: {
        topicId,
        name: input.name,
        description: input.description,
      },
      include: { problems: true },
    });
    return {
      id: subTopic.id,
      name: subTopic.name,
      description: subTopic.description ?? undefined,
      problems: subTopic.problems.map(mapPrismaProblem),
    };
  } catch (error) {
    logger.error("Failed to create sub topic", {
      topicId,
      input,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function updateSubTopic(
  subTopicId: string,
  input: UpdateSubTopicInput
): Promise<SubTopicStoreItem | null> {
  try {
    const subTopic = await prisma.subTopic.update({
      where: { id: subTopicId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
      },
      include: { problems: true },
    });
    return {
      id: subTopic.id,
      name: subTopic.name,
      description: subTopic.description ?? undefined,
      problems: subTopic.problems.map(mapPrismaProblem),
    };
  } catch (error) {
    logger.error("Failed to update sub topic", {
      subTopicId,
      input,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function deleteSubTopic(subTopicId: string): Promise<boolean> {
  try {
    await prisma.subTopic.delete({
      where: { id: subTopicId },
    });
    return true;
  } catch (error) {
    logger.error("Failed to delete sub topic", {
      subTopicId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export async function createProblem(
  topicId: string,
  input: Omit<CreateProblemInput, "topicId">
): Promise<ProblemStoreItem | null> {
  try {
    const problem = await prisma.problem.create({
      data: {
        topicId,
        subTopicId: input.subTopicId ?? null,
        title: input.title,
        url: input.url ?? null,
        difficulty: input.difficulty as any,
        notes: input.notes ?? null,
      },
    });
    return {
      id: problem.id,
      title: problem.title,
      url: problem.url ?? undefined,
      difficulty: problem.difficulty as ProblemStoreItem["difficulty"],
      status: problem.status as ProblemStoreItem["status"],
      reviewCount: problem.reviewCount,
      notes: problem.notes ?? undefined,
      solvedAt: problem.lastSolvedAt?.toISOString() ?? undefined,
      subTopicId: problem.subTopicId,
    };
  } catch (error) {
    logger.error("Failed to create problem", {
      topicId,
      input,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function updateProblem(
  problemId: string,
  input: UpdateProblemInput
): Promise<ProblemStoreItem | null> {
  try {
    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.url !== undefined) data.url = input.url || null;
    if (input.difficulty !== undefined) data.difficulty = input.difficulty;
    if (input.subTopicId !== undefined) data.subTopicId = input.subTopicId;
    if (input.notes !== undefined) data.notes = input.notes || null;

    const problem = await prisma.problem.update({
      where: { id: problemId },
      data,
    });
    return {
      id: problem.id,
      title: problem.title,
      url: problem.url ?? undefined,
      difficulty: problem.difficulty as ProblemStoreItem["difficulty"],
      status: problem.status as ProblemStoreItem["status"],
      reviewCount: problem.reviewCount,
      notes: problem.notes ?? undefined,
      solvedAt: problem.lastSolvedAt?.toISOString() ?? undefined,
      subTopicId: problem.subTopicId,
    };
  } catch (error) {
    logger.error("Failed to update problem", {
      problemId,
      input,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function deleteProblem(problemId: string): Promise<boolean> {
  try {
    await prisma.problem.delete({
      where: { id: problemId },
    });
    return true;
  } catch (error) {
    logger.error("Failed to delete problem", {
      problemId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export async function updateProblemStatus(
  problemId: string,
  status: ProblemStoreItem["status"]
): Promise<boolean> {
  try {
    const data: Record<string, unknown> = { status };
    if (status === "SOLVED") {
      data.lastSolvedAt = new Date();
    }
    await prisma.problem.update({
      where: { id: problemId },
      data,
    });
    return true;
  } catch (error) {
    logger.error("Failed to update problem status", {
      problemId,
      status,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export async function updateProblemReviewCount(
  problemId: string,
  reviewCount: number
): Promise<boolean> {
  try {
    await prisma.problem.update({
      where: { id: problemId },
      data: { reviewCount, lastReviewedAt: new Date() },
    });
    return true;
  } catch (error) {
    logger.error("Failed to update problem review count", {
      problemId,
      reviewCount,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
