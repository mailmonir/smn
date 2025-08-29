// src/app/api/quiz/answers/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface AnswerData {
  questionId: string;
  selectedOption: string;
}

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId, answers }: { attemptId: string; answers: AnswerData[] } =
      await request.json();

    console.log(
      "Saving answers:",
      answers.length,
      "answers for attempt:",
      attemptId
    );

    // Verify attempt belongs to user
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        id: attemptId,
        userId: session.user.id,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Save answers with score calculation
    const results = await Promise.all(
      answers.map(async (answer: AnswerData) => {
        // Get question to check correct answer
        const question = await prisma.question.findUnique({
          where: { id: answer.questionId },
        });

        if (!question) {
          console.log("Question not found:", answer.questionId);
          return null;
        }

        // Parse options and check if answer is correct
        const options = question.options as unknown as QuestionOption[];

        const selectedOption = options.find(
          (opt) => opt.id === answer.selectedOption
        );
        const isCorrect = selectedOption?.isCorrect || false;
        const marksEarned = isCorrect ? question.marks : 0;

        console.log(
          `Question ${answer.questionId}: selected=${answer.selectedOption}, correct=${isCorrect}, marks=${marksEarned}`
        );

        return prisma.userAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId,
              questionId: answer.questionId,
            },
          },
          update: {
            selectedOption: answer.selectedOption,
            isCorrect,
            marksEarned,
          },
          create: {
            attemptId,
            questionId: answer.questionId,
            selectedOption: answer.selectedOption,
            isCorrect,
            marksEarned,
          },
        });
      })
    );

    console.log("Saved", results.filter((r) => r !== null).length, "answers");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving answers:", error);
    return NextResponse.json(
      { error: "Failed to save answers" },
      { status: 500 }
    );
  }
}
