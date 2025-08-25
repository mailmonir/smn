import prisma from "./prisma";

export async function generateUniqueUsername(email: string) {
  // base username from email (before @, strip invalid chars)
  const base = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

  let username = base;
  let counter = 1;

  // check if username exists in DB
  let existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser && existingUser.username) {
    return existingUser.username;
  }

  // keep incrementing until we find a free one
  while (existingUser) {
    username = `${base}${counter}`;
    existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser?.username === username) {
      counter++;
    }
  }

  return username;
}
