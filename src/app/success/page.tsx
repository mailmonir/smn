// src/app/success/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CertificatePage from "@/components/certificate/CertificatePage";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const sessionId = searchParams.session_id;
  if (!sessionId) {
    redirect("/quiz");
  }

  // Find payment by Stripe session ID
  const payment = await prisma.payment.findFirst({
    where: {
      stripeId: sessionId,
      userId: session.user.id,
    },
  });

  if (!payment) {
    redirect("/quiz");
  }

  // Update payment status to completed
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "COMPLETED" },
  });

  // Get the quiz attempt
  const attempt = await prisma.quizAttempt.findFirst({
    where: {
      userId: session.user.id,
      passed: true,
      completed: true,
    },
    orderBy: { completedAt: "desc" },
  });

  if (!attempt) {
    redirect("/quiz");
  }

  // Create certificate if it doesn't exist
  let certificate = await prisma.certificate.findFirst({
    where: { userId: session.user.id },
  });

  if (!certificate) {
    const certificateNumber = `CERT-${Date.now()}-${session.user.id.slice(-4)}`;

    certificate = await prisma.certificate.create({
      data: {
        userId: session.user.id,
        certificateNumber,
        score: attempt.totalScore,
        passScore: attempt.passScore,
      },
    });
  }

  return (
    <CertificatePage
      certificate={certificate}
      user={session.user}
      attempt={attempt}
    />
  );
}
