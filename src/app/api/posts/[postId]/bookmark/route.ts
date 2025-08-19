import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { BookmarkInfo } from "@/lib/types";

type Params = Promise<{ postId: string }>;

export async function GET(request: Request, segmentData: { params: Params }) {
  try {
    const params = await segmentData.params;
    const postId = params.postId;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const loggedInUser = session?.user as { id: string };

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: loggedInUser.id,
          postId,
        },
      },
    });

    const data: BookmarkInfo = {
      isBookmarkedByUser: !!bookmark,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, segmentData: { params: Params }) {
  try {
    const params = await segmentData.params;
    const postId = params.postId;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const loggedInUser = session?.user as { id: string };

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.bookmark.upsert({
      where: {
        userId_postId: {
          userId: loggedInUser.id,
          postId,
        },
      },
      create: {
        userId: loggedInUser.id,
        postId,
      },
      update: {},
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params;
    const postId = params.postId;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const loggedInUser = session?.user as { id: string };

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.bookmark.deleteMany({
      where: {
        userId: loggedInUser.id,
        postId,
      },
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
