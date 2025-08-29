// src/app/api/quiz/progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId, currentTab } = await request.json();

    await prisma.quizAttempt.update({
      where: {
        id: attemptId,
        userId: session.user.id,
      },
      data: {
        currentTab,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
