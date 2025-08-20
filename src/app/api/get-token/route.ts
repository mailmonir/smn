import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import streamServerClient from "@/lib/stream";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const user = session?.user as { id: string };

    console.log("Calling get-token for user: ", user?.id);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;

    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    const token = streamServerClient.createToken(
      user.id,
      expirationTime,
      issuedAt
    );

    return Response.json({ token });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { StreamChat } from "stream-chat";

// const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY!;
// const apiSecret = process.env.STREAM_SECRET!;

// if (!apiKey || !apiSecret) {
//   throw new Error(
//     "Missing Stream credentials. Check NEXT_PUBLIC_STREAM_KEY and STREAM_SECRET."
//   );
// }

// const serverClient = StreamChat.getInstance(apiKey, apiSecret);

// export async function POST(req: NextRequest) {
//   try {
//     const { user_id } = await req.json();

//     // Stream user IDs must match this pattern: only a–z, A–Z, 0–9, @, _, -
//     // (prevents the 'invalid user id' error)
//     if (typeof user_id !== "string" || !/^[A-Za-z0-9@_-]+$/.test(user_id)) {
//       return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
//     }

//     // Optionally: upsert the user server-side so they exist with name/image
//     // await serverClient.upsertUser({ id: user_id, name: "Alice" });

//     const token = serverClient.createToken(user_id);
//     return NextResponse.json({ token });
//   } catch (e: any) {
//     return NextResponse.json(
//       { error: e?.message ?? "Token creation failed" },
//       { status: 500 }
//     );
//   }
// }
