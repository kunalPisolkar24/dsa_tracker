import { prisma } from "@/lib/prisma";

export interface ProblemScalarFields {
  id: string;
  topicId: string;
  subTopicId: string | null;
  title: string;
  url: string | null;
  difficulty: string;
  status: string;
  reviewCount: number;
  notes: string | null;
  lastSolvedAt: Date | null;
  lastReviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function createProblem(
  topicId: string,
  data: {
    subTopicId?: string | null;
    title: string;
    url?: string | null;
    difficulty: string;
    notes?: string | null;
  }
): Promise<ProblemScalarFields> {
  return prisma.problem.create({
    data: {
      topicId,
      subTopicId: data.subTopicId ?? null,
      title: data.title,
      url: data.url ?? null,
      difficulty: data.difficulty as any,
      notes: data.notes ?? null,
    },
  });
}

export async function updateProblem(
  id: string,
  data: {
    title?: string;
    url?: string | null;
    difficulty?: string;
    subTopicId?: string | null;
    notes?: string | null;
  }
): Promise<ProblemScalarFields> {
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.url !== undefined) updateData.url = data.url || null;
  if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
  if (data.subTopicId !== undefined) updateData.subTopicId = data.subTopicId;
  if (data.notes !== undefined) updateData.notes = data.notes || null;

  return prisma.problem.update({ where: { id }, data: updateData });
}

export async function deleteProblem(id: string): Promise<void> {
  await prisma.problem.delete({ where: { id } });
}

export async function updateProblemStatus(
  id: string,
  status: string,
  lastSolvedAt?: Date | null
): Promise<ProblemScalarFields> {
  const data: Record<string, unknown> = { status };
  if (lastSolvedAt !== undefined) data.lastSolvedAt = lastSolvedAt;
  return prisma.problem.update({ where: { id }, data });
}

export async function updateProblemReviewCount(
  id: string,
  reviewCount: number
): Promise<ProblemScalarFields> {
  return prisma.problem.update({
    where: { id },
    data: { reviewCount, lastReviewedAt: new Date() },
  });
}
