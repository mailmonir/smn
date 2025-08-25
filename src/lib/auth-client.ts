import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  plugins: [],
});

export const {
  signIn,
  signUp,
  signOut,
  forgetPassword,
  resetPassword,
  verifyEmail,
  useSession,
  getSession,
  updateUser,
} = authClient;
