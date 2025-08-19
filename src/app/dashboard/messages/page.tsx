import { Metadata } from "next";
import Chat from "./Chat";
import "stream-chat-react/dist/css/v2/index.css";
// import "./layout.css";

export const metadata: Metadata = {
  title: "Messages",
};

export default function Page() {
  return <Chat />;
}
