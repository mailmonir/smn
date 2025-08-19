import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";

type Params = Promise<{ username: string }>;

export async function GET(request: Request, segmentData: { params: Params }) {
  try {
    const params = await segmentData.params;
    const username = params.username;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const loggedInUser = session?.user as { id: string };

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: getUserDataSelect(loggedInUser.id),
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
