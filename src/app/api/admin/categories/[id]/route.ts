import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    const category = await prisma.category.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: { questions: true },
        },
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            question: true,
            marks: true,
            order: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Fetch category error:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// export async function GET(
//   request: NextRequest,
//   segmentData: { params: Params }
// ) {
//   const params = await segmentData.params;
//   const id = params.id;

//   const session = await auth.api.getSession({ headers: request.headers });

//   if (!session || session.user.role !== "ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const { name, description, order } = await request.json();

//     // Validate required fields
//     if (!name || name.trim() === "") {
//       return NextResponse.json(
//         { error: "Category name is required" },
//         { status: 400 }
//       );
//     }

//     // Check if category exists
//     const existingCategory = await prisma.category.findUnique({
//       where: { id: id },
//     });

//     if (!existingCategory) {
//       return NextResponse.json(
//         { error: "Category not found" },
//         { status: 404 }
//       );
//     }

//     // Check if another category with same name already exists (excluding current one)
//     const duplicateCategory = await prisma.category.findFirst({
//       where: {
//         name: name.trim(),
//         id: { not: id },
//       },
//     });

//     if (duplicateCategory) {
//       return NextResponse.json(
//         { error: "Category with this name already exists" },
//         { status: 400 }
//       );
//     }

//     const category = await prisma.category.update({
//       where: { id: id },
//       data: {
//         name: name.trim(),
//         description: description ? description.trim() : null,
//         order: order || 0,
//       },
//       include: {
//         _count: {
//           select: { questions: true },
//         },
//       },
//     });

//     return NextResponse.json(category);
//   } catch (error) {
//     console.error("Update category error:", error);
//     return NextResponse.json(
//       { error: "Failed to update category" },
//       { status: 500 }
//     );
//   }
// }

export async function DELETE(
  request: NextRequest,
  segmentData: { params: Params }
) {
  const params = await segmentData.params;
  const id = params.id;
  const session = await auth.api.getSession({ headers: request.headers });
  console.log(id);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if there are any quiz attempts in progress
    if (category._count.questions > 0) {
      const activeAttempts = await prisma.quizAttempt.findMany({
        where: {
          completed: false,
          answers: {
            some: {
              question: {
                categoryId: params.id,
              },
            },
          },
        },
      });

      if (activeAttempts.length > 0) {
        return NextResponse.json(
          {
            error:
              "Cannot delete category with questions while there are active quiz attempts",
          },
          { status: 400 }
        );
      }
    }

    // Delete the category (questions will be cascade deleted due to schema)
    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
