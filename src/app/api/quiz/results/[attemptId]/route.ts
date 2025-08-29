// src/app/api/quiz/results/[attemptId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type Params = Promise<{ attemptId: string }>;

export async function GET(
  request: NextRequest,
  segmentData: { params: Params }
) {
  const params = await segmentData.params;
  const attemptId = params.attemptId;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        id: params.attemptId,
        userId: session.user.id,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const percentage = Math.round(
      (attempt.totalScore / attempt.maxScore) * 100
    );

    return NextResponse.json({
      totalScore: attempt.totalScore,
      maxScore: attempt.maxScore,
      passScore: attempt.passScore,
      passed: attempt.passed,
      percentage,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
