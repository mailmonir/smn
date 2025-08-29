import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { QuestionOption } from "@/lib/types";

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  segmentData: { params: Params }
) {
  const params = await segmentData.params;
  const id = params.id;

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const question = await prisma.question.findUnique({
      where: { id: id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            order: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Fetch question error:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  segmentData: { params: Params }
) {
  const params = await segmentData.params;
  const id = params.id;

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { categoryId, question, options, marks, order } =
      await request.json();

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: id },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!categoryId || !question || !question.trim()) {
      return NextResponse.json(
        {
          error: "Category and question are required",
        },
        { status: 400 }
      );
    }

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Validate options
    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        {
          error: "At least 2 options are required",
        },
        { status: 400 }
      );
    }

    // Filter out empty options
    const validOptions = options.filter(
      (opt: QuestionOption) => opt.text && opt.text.trim()
    );

    if (validOptions.length < 2) {
      return NextResponse.json(
        {
          error: "At least 2 options with text are required",
        },
        { status: 400 }
      );
    }

    // Validate exactly one correct answer
    const correctOptions = validOptions.filter(
      (opt: QuestionOption) => opt.isCorrect
    );
    if (correctOptions.length !== 1) {
      return NextResponse.json(
        {
          error: "Exactly one correct answer must be selected",
        },
        { status: 400 }
      );
    }

    // Validate marks
    const questionMarks = marks && marks > 0 ? marks : 1;
    if (questionMarks > 10) {
      return NextResponse.json(
        {
          error: "Maximum 10 marks allowed per question",
        },
        { status: 400 }
      );
    }

    // Check if question is being used in any active quiz attempts
    const activeAttempts = await prisma.quizAttempt.findMany({
      where: {
        completed: false,
        answers: {
          some: {
            questionId: id,
          },
        },
      },
    });

    if (activeAttempts.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot modify question while it is being used in active quiz attempts",
        },
        { status: 400 }
      );
    }

    // Process options
    const processedOptions = validOptions.map(
      (opt: QuestionOption, index: number) => ({
        id: opt.id || `opt_${index + 1}`,
        text: opt.text.trim(),
        isCorrect: opt.isCorrect,
      })
    );

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: { id: id },
      data: {
        categoryId,
        question: question.trim(),
        options: processedOptions,
        marks: questionMarks,
        order: order || 0,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            order: true,
          },
        },
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("Update question error:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  segmentData: { params: Params }
) {
  const params = await segmentData.params;
  const id = params.id;

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: id },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Check if question is being used in any quiz attempts (completed or not)
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        answers: {
          some: {
            questionId: id,
          },
        },
      },
    });

    if (quizAttempts.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete question that has been used in quiz attempts",
        },
        { status: 400 }
      );
    }

    // Delete the question
    await prisma.question.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Delete question error:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
