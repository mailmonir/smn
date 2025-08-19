import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";
import { NextResponse } from "next/server";

type Params = Promise<{ userId: string }>;

// GET followers info
export async function GET(request: Request, segmentData: { params: Params }) {
  try {
    const params = await segmentData.params;
    const userId = params.userId;

    const session = await auth.api.getSession({ headers: await headers() });
    const loggedInUser = session?.user as { id: string };

    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: { followerId: loggedInUser.id },
          select: { followerId: true },
        },
        _count: { select: { followers: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST follow a user
export async function POST(request: Request, segmentData: { params: Params }) {
  try {
    const params = await segmentData.params;
    const userId = params.userId;

    const session = await auth.api.getSession({ headers: await headers() });
    const loggedInUser = session?.user as { id: string };

    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.id,
            followingId: userId,
          },
        },
        create: { followerId: loggedInUser.id, followingId: userId },
        update: {},
      }),
      prisma.notification.create({
        data: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW",
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE unfollow a user
export async function DELETE(
  request: Request,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params;
    const userId = params.userId;

    const session = await auth.api.getSession({ headers: await headers() });
    const loggedInUser = session?.user as { id: string };

    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: { followerId: loggedInUser.id, followingId: userId },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW",
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
