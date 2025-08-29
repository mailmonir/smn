import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { UserAnswer } from "@/generated/prisma/client";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { attemptId } = await request.json();

  try {
    // Get attempt first to get passScore
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      select: { passScore: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Calculate total score
    const answers = await prisma.userAnswer.findMany({
      where: { attemptId },
      include: { question: true },
    });

    const totalScore = answers.reduce(
      (sum: number, answer: UserAnswer) => sum + answer.marksEarned,
      0
    );

    // Update attempt
    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        totalScore,
        completed: true,
        completedAt: new Date(),
        passed: totalScore >= attempt.passScore,
      },
    });

    return NextResponse.json(updatedAttempt);
  } catch (error) {
    console.error("Complete quiz error:", error);
    return NextResponse.json(
      { error: "Failed to complete quiz" },
      { status: 500 }
    );
  }
}
