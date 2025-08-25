import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { sendEmail } from "./send-email";
import { createAuthMiddleware } from "better-auth/api";
import { generateUniqueUsername } from "./unique-username";
import streamServerClient from "@/lib/stream";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 1 hour
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      updateUserInfoOnLink: true,
    },
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      displayName: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path.startsWith("/verify-email") ||
        ctx.path.startsWith("/callback/")
      ) {
        const newSession = ctx.context.newSession;
        if (newSession?.user) {
          await streamServerClient.upsertUser({
            id: newSession.user.id,
            username: newSession?.user.email,
            name: newSession?.user.name,
            image: newSession?.user.image || "/user-avatar.png",
          });
        }
      }
    }),
  },
});
