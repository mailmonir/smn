import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: "2024-06-20",
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId } = await request.json();

    // Verify quiz was passed
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || !attempt.passed) {
      return NextResponse.json({ error: "Quiz not passed" }, { status: 400 });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: 29.99,
        currency: "USD",
        status: "PENDING",
      },
    });

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Quiz Certificate & Badge",
              description: "Official certification for quiz completion",
            },
            unit_amount: 2999, // $29.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/quiz`,
      metadata: {
        paymentId: payment.id,
        attemptId,
      },
    });

    // Update payment with Stripe ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Payment session error:", error);
    return NextResponse.json(
      { error: "Failed to create payment session" },
      { status: 500 }
    );
  }
}
