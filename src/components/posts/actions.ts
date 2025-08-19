"use server";

import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { authClient } from "@/lib/auth-client";

export async function deletePost(id: string) {
  const { data: session } = authClient.useSession();

  if (!session?.user) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) throw new Error("Post not found");

  if (post.userId !== session.user.id) throw new Error("Unauthorized");

  const deletedPost = await prisma.post.delete({
    where: { id },
    include: getPostDataInclude(session.user.id),
  });

  return deletedPost;
}
