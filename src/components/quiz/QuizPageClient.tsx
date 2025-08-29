// src/components/quiz/QuizPageClient.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuizInterface from "./QuizInterface";
import { QuizCategory, QuizAttempt } from "@/lib/types";

interface QuizPageClientProps {
  categories: QuizCategory[];
  attempt: QuizAttempt | null;
  passedAttempt: any;
  existingCertificate: any;
  userId: string;
}

export default function QuizPageClient({
  categories,
  attempt,
  passedAttempt,
  existingCertificate,
  userId,
}: QuizPageClientProps) {
  if (categories.length === 0) {
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

  if (passedAttempt && !existingCertificate) {
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
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() =>
                (window.location.href = `/payment?attemptId=${passedAttempt.id}`)
              }
            >
              Get Certificate & Badge - $29.99
            </Button>
            <Button
              variant="outline"
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

  if (existingCertificate) {
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
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizInterface
        categories={categories}
        attempt={attempt}
        userId={userId}
      />
    </div>
  );
}
