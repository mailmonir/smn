import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor") ?? undefined;

    const pageSize = 10;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = session.user as { id: string };

    const posts = await prisma.post.findMany({
      include: getPostDataInclude(user.id),
      take: pageSize + 1,
      orderBy: {
        createdAt: "desc",
      },
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
    return new Response("Internal Server Error", { status: 500 });
  }
}
