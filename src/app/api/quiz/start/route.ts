import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check for existing incomplete attempt
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId: session.user.id,
        completed: false,
      },
    });

    if (existingAttempt) {
      return NextResponse.json(existingAttempt);
    }

    // Calculate total marks
    const totalMarks = await prisma.question.aggregate({
      _sum: { marks: true },
    });

    const passScore = Math.ceil((totalMarks._sum.marks || 0) * 0.6); // 60% pass mark

    // Create new attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        maxScore: totalMarks._sum.marks || 0,
        passScore,
      },
    });

    return NextResponse.json(attempt);
  } catch (error) {
    console.error("Start quiz error:", error);
    return NextResponse.json(
      { error: "Failed to start quiz" },
      { status: 500 }
    );
  }
}
