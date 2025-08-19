import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const f = createUploadthing();

export const fileRouter = {
  avatar: f({
    image: { maxFileSize: "512KB" },
  })
    .middleware(async () => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      const user = session?.user as { id: string; image: string };

      if (!user) throw new UploadThingError("Unauthorized");

      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldAvatarUrl = metadata.user.image;

      // Delete old file if exists
      if (oldAvatarUrl) {
        const key = oldAvatarUrl.split("/f/")[1]; // ✅ no appId needed
        if (key) {
          await new UTApi().deleteFiles(key);
        }
      }

      const newAvatarUrl = file.ufsUrl; // ✅ use directly

      await Promise.all([
        prisma.user.update({
          where: { id: metadata.user.id },
          data: { image: newAvatarUrl },
        }),
        streamServerClient.partialUpdateUser({
          id: metadata.user.id,
          set: { image: newAvatarUrl },
        }),
      ]);

      return { avatarUrl: newAvatarUrl };
    }),

  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) throw new UploadThingError("Unauthorized");

      return {};
    })
    .onUploadComplete(async ({ file }) => {
      const media = await prisma.media.create({
        data: {
          url: file.ufsUrl, // ✅ directly use UploadThing URL
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });

      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
