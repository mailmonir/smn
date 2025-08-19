// app/api/stream/test/route.ts
import { StreamChat } from "stream-chat";

const serverClient = StreamChat.getInstance(
  process.env.STREAM_KEY!,
  process.env.STREAM_SECRET!
);

export async function GET() {
  const id = "test-user-vercel";

  await serverClient.upsertUser({ id, name: "Vercel Test" });

  const user = await serverClient.queryUsers({ id });
  console.log("✅ Found user in Stream:", user.users[0]);

  return Response.json(user);
}
