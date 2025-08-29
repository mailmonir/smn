"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ResultsModalProps {
  attemptId: string;
  onClose: () => void;
}

interface QuizResults {
  totalScore: number;
  maxScore: number;
  passScore: number;
  passed: boolean;
  percentage: number;
}

export default function ResultsModal({
  attemptId,
  onClose,
}: ResultsModalProps) {
  const [results, setResults] = useState<QuizResults | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
    const response = await fetch(`/api/quiz/results/${attemptId}`);
    const data = await response.json();
    setResults(data);
  };

  const handleProceedToPayment = async () => {
    setIsProcessingPayment(true);

    try {
      const response = await fetch("/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Payment error:", error);
      setIsProcessingPayment(false);
    }
  };

  if (!results) {
    return (
      <Modal isOpen onClose={onClose}>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Calculating results...</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={onClose}>
      <div className="p-6 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div
            className={`text-6xl mb-4 ${
              results.passed ? "text-green-500" : "text-red-500"
            }`}
          >
            {results.passed ? "🎉" : "😞"}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {results.passed ? "Congratulations!" : "Keep Trying!"}
          </h2>
          <p className="text-gray-600">
            {results.passed
              ? "You passed the quiz!"
              : "You did not meet the pass mark this time."}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {results.totalScore}
              </div>
              <div className="text-sm text-gray-600">Your Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {results.maxScore}
              </div>
              <div className="text-sm text-gray-600">Total Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {results.percentage}%
              </div>
              <div className="text-sm text-gray-600">Percentage</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {results.passScore}
              </div>
              <div className="text-sm text-gray-600">Pass Mark</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {results.passed ? (
            <Button
              onClick={handleProceedToPayment}
              disabled={isProcessingPayment}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessingPayment
                ? "Processing..."
                : "Proceed to Payment ($29.99)"}
            </Button>
          ) : (
            <Button onClick={() => window.location.reload()} className="w-full">
              Retake Quiz
            </Button>
          )}

          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
