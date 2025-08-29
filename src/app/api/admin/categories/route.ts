import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Fetch categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, order } = await request.json();

    // Validate required fields
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category with same name already exists
    const existingCategory = await prisma.category.findFirst({
      where: { name: name.trim() },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    if (order !== undefined) {
      const existingOrder = await prisma.category.findFirst({
        where: { order },
      });
      if (existingOrder) {
        return NextResponse.json(
          { error: "Category with this order already exists" },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        order: order || 0,
      },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
