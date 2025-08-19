import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

type Params = Promise<{ userId: string }>;

export async function GET(
  request: NextRequest,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params;
    const userId = params.userId;

    const cursor = request.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 10;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const user = session?.user as { id: string };

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      where: { userId },
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
