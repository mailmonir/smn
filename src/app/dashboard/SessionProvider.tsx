"use client";

import { User, Session } from "@/generated/prisma";
import React, { createContext, useContext, ReactNode } from "react";

// Define the shape of your session context
interface SessionContextType {
  user: User;
  session?: Session;
}

const SessionContext = createContext<SessionContextType | null>(null);

interface SessionProviderProps {
  children: ReactNode;
  value: SessionContextType;
}

export default function SessionProvider({
  children,
  value,
}: SessionProviderProps) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

// Hook to use session
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
