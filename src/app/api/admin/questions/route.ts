import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Update the GET function in src/app/api/admin/questions/route.ts
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = page * limit;

    // Build where clause
    const whereClause = categoryId ? { categoryId } : {};

    // Get total count for pagination
    const totalCount = await prisma.question.count({
      where: whereClause,
    });

    // Fetch questions with pagination
    const questions = await prisma.question.findMany({
      where: whereClause,
      orderBy: [
        { category: { order: "asc" } },
        { order: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            order: true,
          },
        },
      },
      skip,
      take: limit,
    });

    const hasMore = skip + limit < totalCount;
    const nextCursor = hasMore ? page + 1 : null;

    return NextResponse.json({
      questions,
      nextCursor,
      total: totalCount,
    });
  } catch (error) {
    console.error("Fetch questions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
