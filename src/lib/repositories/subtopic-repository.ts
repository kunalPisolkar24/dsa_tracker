import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const subTopicInclude = {
  problems: true,
} satisfies Prisma.SubTopicInclude;

export type SubTopicWithRelations = Prisma.SubTopicGetPayload<{ include: typeof subTopicInclude }>;

export async function createSubTopic(
  topicId: string,
  data: { name: string; description?: string | null }
): Promise<SubTopicWithRelations> {
  return prisma.subTopic.create({
    data: { topicId, name: data.name, description: data.description ?? null },
    include: subTopicInclude,
  });
}

export async function updateSubTopic(
  id: string,
  data: { name?: string; description?: string | null }
): Promise<SubTopicWithRelations> {
  return prisma.subTopic.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    },
    include: subTopicInclude,
  });
}

export async function deleteSubTopic(id: string): Promise<void> {
  await prisma.subTopic.delete({ where: { id } });
}
