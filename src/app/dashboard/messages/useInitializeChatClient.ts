import kyInstance from "@/lib/ky";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useSession } from "../SessionProvider";

export default function useInitializeChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  if (!user) {
    return null;
  }

  useEffect(() => {
    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

    client
      .connectUser(
        {
          id: user.email,
          name: user.displayName || user.name,
          image: user.image || "/user-avatar.png",
        },
        async () =>
          kyInstance
            .get("/api/get-token")
            .json<{ token: string }>()
            .then((data) => data.token)
      )
      .catch((error) => console.error("Failed to connect user", error))
      .then(() => setChatClient(client));

    return () => {
      setChatClient(null);
      client
        .disconnectUser()
        .catch((error) => console.error("Failed to disconnect user", error))
        .then(() => console.log("Connection closed"));
    };
  }, [user.id, user.displayName, user.name, user.image]);

  return chatClient;
}

// import kyInstance from "@/lib/ky";
// import { useEffect, useState } from "react";
// import { StreamChat } from "stream-chat";
// import { useSession } from "../SessionProvider";

// export default function useInitializeChatClient() {
//   const { user } = useSession();
//   const [chatClient, setChatClient] = useState<StreamChat | null>(null);

//   useEffect(() => {
//     if (!user) {
//       setChatClient(null);
//       return;
//     }
//     const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

//     client
//       .connectUser(
//         {
//           id: user.id,
//           name: user.displayName || user.name,
//           image: user.image || "",
//         },
//         async () =>
//           kyInstance
//             .get("/api/get-token")
//             .json<{ token: string }>()
//             .then((data) => data.token)
//       )
//       .then(() => setChatClient(client))
//       .catch((error) => console.error("Failed to connect user", error));

//     return () => {
//       setChatClient(null);
//       client
//         .disconnectUser()
//         .then(() => console.log("Connection closed"))
//         .catch((error) => console.error("Failed to disconnect user", error));
//     };
//   }, [user?.id, user?.displayName || user?.name, user?.image]);

//   return chatClient;
// }
