import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import QuizInterface from "@/components/quiz/QuizInterface";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionOption } from "@/lib/types";
import Link from "next/link";

export default async function QuizPage() {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return;
  }

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          question: true,
          options: true,
          marks: true,
          order: true,
          categoryId: true,
        },
      },
    },
  });

  // Filter out empty categories
  // const categoriesWithQuestions = categories.filter(
  //   (cat) => cat.questions.length > 0
  // );

  const categoriesWithQuestions = categories
    .filter((cat) => cat.questions.length > 0)
    .map((cat) => ({
      ...cat,
      description: cat.description || undefined,
      questions: cat.questions.map((q) => ({
        ...q,
        options: q.options as unknown as QuestionOption[],
      })),
    }));

  if (categoriesWithQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <div className="text-6xl mb-6">📚</div>
          <h1 className="text-3xl font-bold mb-4">Quiz Not Available</h1>
          <p className="text-gray-600 mb-6">
            No questions have been set up yet. Please check back later or
            contact the administrator.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </Card>
      </div>
    );
  }

  // Check for existing incomplete attempt
  let attempt = await prisma.quizAttempt.findFirst({
    where: {
      userId: session.user.id,
      completed: false,
    },
    include: {
      answers: {
        include: {
          question: {
            select: { categoryId: true },
          },
        },
      },
    },
  });

  // Check if user has already passed and needs to pay
  const passedAttempt = await prisma.quizAttempt.findFirst({
    where: {
      userId: session.user.id,
      completed: true,
      passed: true,
    },
    orderBy: { completedAt: "desc" },
  });

  // Check if user already has certificate
  const existingCertificate = await prisma.certificate.findFirst({
    where: { userId: session.user.id },
  });

  if (passedAttempt && !existingCertificate) {
    // User passed but hasn't paid for certificate yet
    const percentage = Math.round(
      (passedAttempt.totalScore / passedAttempt.maxScore) * 100
    );

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold mb-4 text-green-600">
            Congratulations!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            You have successfully passed the quiz with {percentage}% score!
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {passedAttempt.totalScore}
                </div>
                <div className="text-sm text-gray-600">Your Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {passedAttempt.maxScore}
                </div>
                <div className="text-sm text-gray-600">Total Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {passedAttempt.passScore}
                </div>
                <div className="text-sm text-gray-600">Pass Mark</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              To receive your official certificate and digital badge, please
              proceed with payment.
            </p>
            <Link href={`/payment?attemptId=${passedAttempt.id}`}>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                // onClick={() =>
                //   (window.location.href = `/payment?attemptId=${passedAttempt.id}`)
                // }
              >
                Get Certificate & Badge - $29.99
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="w-full"
                // onClick={() => (window.location.href = "/dashboard")}
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (existingCertificate) {
    // User already has certificate
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-3xl font-bold mb-4 text-blue-600">
            Certificate Earned!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            You have already completed the quiz and earned your certificate.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Your Certificate</h3>
            <div className="space-y-2">
              <p>
                <strong>Certificate Number:</strong>{" "}
                {existingCertificate.certificateNumber}
              </p>
              <p>
                <strong>Issue Date:</strong>{" "}
                {existingCertificate.issueDate.toLocaleDateString()}
              </p>
              <p>
                <strong>Score:</strong> {existingCertificate.score} (Pass Mark:{" "}
                {existingCertificate.passScore})
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="w-full">Download Certificate</Button>
            <Button variant="outline" className="w-full">
              View Digital Badge
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!attempt) {
    // Calculate total marks for new attempt
    const totalMarks = await prisma.question.aggregate({
      _sum: { marks: true },
    });

    const passScore = Math.ceil((totalMarks._sum.marks || 0) * 0.6); // 60% pass mark

    attempt = await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        maxScore: totalMarks._sum.marks || 0,
        passScore,
        // completedAt: undefined,
      },
      include: {
        answers: {
          include: {
            question: {
              select: { categoryId: true },
            },
          },
        },
      },
    });
  }

  const transformedAttempt = {
    ...attempt,
    completedAt: attempt.completedAt || undefined,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizInterface
        categories={categoriesWithQuestions}
        attempt={transformedAttempt}
        userId={session.user.id}
      />
    </div>
  );
}
