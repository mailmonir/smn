import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import streamServerClient from "@/lib/stream";
import { MessageCountInfo } from "@/lib/types";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const user = session?.user as {
      id: string;
      email?: string;
      image?: string;
    };

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { total_unread_count } = await streamServerClient.getUnreadCount(
      user.id
    );

    const data: MessageCountInfo = {
      unreadCount: total_unread_count,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
