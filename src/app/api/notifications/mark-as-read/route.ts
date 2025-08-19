import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function PATCH() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const user = session?.user as { id: string };

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: {
        recipientId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
