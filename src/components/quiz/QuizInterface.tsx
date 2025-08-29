"use client";

import { useState, useEffect } from "react";
import { QuizCategory, QuizAttempt } from "@/lib/types";
import QuestionCard from "./QuestionCard";
import ResultsModal from "./ResultsModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QuizInterfaceProps {
  categories: QuizCategory[];
  attempt: QuizAttempt;
  userId: string;
}

export default function QuizInterface({
  categories,
  attempt,
  userId,
}: QuizInterfaceProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(
    attempt.currentTab
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  // Load existing answers
  useEffect(() => {
    const existingAnswers: Record<string, string> = {};
    attempt.answers?.forEach((answer) => {
      existingAnswers[answer.questionId] = answer.selectedOption;
    });
    setAnswers(existingAnswers);
    setQuizStarted(true);
  }, [attempt.answers]);

  // Timer functionality (optional - 2 hours limit)
  useEffect(() => {
    if (!quizStarted || timeRemaining === 0) return;

    const startTime = new Date(attempt.startedAt).getTime();
    const maxDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const elapsed = Date.now() - startTime;
    const remaining = maxDuration - elapsed;

    if (remaining <= 0) {
      handleTimeUp();
      return;
    }

    setTimeRemaining(remaining);

    const timer = setInterval(() => {
      const currentElapsed = Date.now() - startTime;
      const currentRemaining = maxDuration - currentElapsed;

      if (currentRemaining <= 0) {
        handleTimeUp();
      } else {
        setTimeRemaining(currentRemaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted]);

  const handleTimeUp = async () => {
    alert("Time is up! The quiz will be automatically submitted.");
    await handleCompleteQuiz();
  };

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const currentCategory = categories[currentCategoryIndex];
  const currentQuestion = currentCategory?.questions[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === (currentCategory?.questions.length || 0) - 1;
  const isLastCategory = currentCategoryIndex === categories.length - 1;

  // Calculate progress
  const totalQuestions = categories.reduce(
    (sum, cat) => sum + cat.questions.length,
    0
  );
  const answeredQuestions = Object.keys(answers).length;
  const currentQuestionNumber =
    categories
      .slice(0, currentCategoryIndex)
      .reduce((sum, cat) => sum + cat.questions.length, 0) +
    currentQuestionIndex +
    1;

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1);
      const prevCategory = categories[currentCategoryIndex - 1];
      setCurrentQuestionIndex(prevCategory.questions.length - 1);
    }
  };

  const handleNextQuestion = async () => {
    // Auto-save current answer
    if (answers[currentQuestion.id]) {
      await saveCurrentAnswer();
    }

    if (isLastQuestion) {
      if (isLastCategory) {
        // Check if all questions are answered
        const unansweredQuestions: string[] = [];
        categories.forEach((cat, catIndex) => {
          cat.questions.forEach((q, qIndex) => {
            if (!answers[q.id]) {
              unansweredQuestions.push(`${cat.name} - Question ${qIndex + 1}`);
            }
          });
        });

        if (unansweredQuestions.length > 0) {
          const proceed = confirm(
            `You have ${
              unansweredQuestions.length
            } unanswered questions:\n\n${unansweredQuestions.join(
              "\n"
            )}\n\nDo you want to submit anyway?`
          );
          if (!proceed) return;
        }

        handleCompleteQuiz();
      } else {
        handleNextCategory();
      }
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleNextCategory = async () => {
    setIsLoading(true);

    try {
      // Save answers for current category
      await saveAnswers(currentCategory.id);

      // Move to next category
      const nextCategoryIndex = currentCategoryIndex + 1;
      setCurrentCategoryIndex(nextCategoryIndex);
      setCurrentQuestionIndex(0);

      // Update attempt progress
      await updateAttemptProgress(nextCategoryIndex);
    } catch (error) {
      console.error("Error moving to next category:", error);
      alert("Failed to save progress. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteQuiz = async () => {
    setIsLoading(true);

    try {
      // Save final answers
      await saveAnswers(currentCategory.id);

      // Complete quiz and calculate results
      const response = await fetch("/api/quiz/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attempt.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete quiz");
      }

      const results = await response.json();
      setShowResults(true);
    } catch (error) {
      console.error("Error completing quiz:", error);
      alert("Failed to complete quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentAnswer = async () => {
    if (!answers[currentQuestion.id]) return;

    try {
      await fetch("/api/quiz/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: attempt.id,
          answers: [
            {
              questionId: currentQuestion.id,
              selectedOption: answers[currentQuestion.id],
            },
          ],
        }),
      });
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  const saveAnswers = async (categoryId: string) => {
    const categoryAnswers = Object.entries(answers)
      .filter(([questionId]) =>
        currentCategory.questions.some((q) => q.id === questionId)
      )
      .map(([questionId, optionId]) => ({
        questionId,
        selectedOption: optionId,
      }));

    if (categoryAnswers.length === 0) return;

    const response = await fetch("/api/quiz/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId: attempt.id,
        answers: categoryAnswers,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save answers");
    }
  };

  const updateAttemptProgress = async (tabIndex: number) => {
    const response = await fetch("/api/quiz/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId: attempt.id,
        currentTab: tabIndex,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update progress");
    }
  };

  const jumpToQuestion = (categoryIndex: number, questionIndex: number) => {
    setCurrentCategoryIndex(categoryIndex);
    setCurrentQuestionIndex(questionIndex);
  };

  if (!quizStarted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Quiz Assessment</h1>
          {timeRemaining && (
            <div
              className={`text-lg font-mono ${
                timeRemaining < 10 * 60 * 1000
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              Time Remaining: {formatTime(timeRemaining)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {currentQuestionNumber}
            </div>
            <div className="text-sm text-gray-600">Current Question</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {answeredQuestions}
            </div>
            <div className="text-sm text-gray-600">Answered</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {totalQuestions}
            </div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`flex-1 text-center py-3 px-2 rounded-lg mx-1 cursor-pointer transition-colors ${
                index < currentCategoryIndex
                  ? "bg-green-100 text-green-800"
                  : index === currentCategoryIndex
                  ? "bg-primary/20 text-blue-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setCurrentCategoryIndex(index)}
            >
              <div className="font-medium">{category.name}</div>
              <div className="text-xs mt-1">
                {category.questions.filter((q) => answers[q.id]).length}/
                {category.questions.length}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${(answeredQuestions / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Navigator Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4 sticky top-6">
            <h3 className="font-semibold mb-3">Questions</h3>
            <div className="space-y-2">
              {categories.map((category, catIndex) => (
                <div key={category.id}>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {category.name}
                  </div>
                  <div className="grid grid-cols-5 gap-1 mb-3">
                    {category.questions.map((question, qIndex) => (
                      <button
                        key={question.id}
                        onClick={() => jumpToQuestion(catIndex, qIndex)}
                        className={`w-8 h-8 text-xs rounded-full border-2 transition-colors ${
                          answers[question.id]
                            ? "bg-chart-2 text-white border-green-500"
                            : catIndex === currentCategoryIndex &&
                              qIndex === currentQuestionIndex
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-600 border-border hover:border-border/80"
                        }`}
                      >
                        {qIndex + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t text-xs text-gray-600">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 bg-chart-2 rounded-full"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 bg-primary rounded-full"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-full"></div>
                <span>Unanswered</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Question Area */}
        <div className="lg:col-span-3">
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold">
                  {currentCategory.name}
                </h2>
                <p className="text-gray-600">
                  Question {currentQuestionIndex + 1} of{" "}
                  {currentCategory.questions.length}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Category Progress</div>
                <div className="text-lg font-semibold">
                  {
                    currentCategory.questions.filter((q) => answers[q.id])
                      .length
                  }
                  /{currentCategory.questions.length}
                </div>
              </div>
            </div>

            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                selectedOption={answers[currentQuestion.id]}
                onAnswerSelect={handleAnswerSelect}
                // questionNumber={currentQuestionNumber}
              />
            )}
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={
                currentCategoryIndex === 0 && currentQuestionIndex === 0
              }
            >
              ← Previous
            </Button>

            <div className="text-sm text-gray-600">
              Question {currentQuestionNumber} of {totalQuestions}
            </div>

            <Button
              onClick={handleNextQuestion}
              disabled={isLoading}
              className={`${
                isLastCategory && isLastQuestion
                  ? "bg-chart-2/80 hover:bg-chart-2/60"
                  : "bg-primary hover:bg-primary/80"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : isLastCategory && isLastQuestion ? (
                "Complete Quiz"
              ) : isLastQuestion ? (
                `Next: ${categories[currentCategoryIndex + 1]?.name} →`
              ) : (
                "Next →"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showResults && (
        <ResultsModal
          attemptId={attempt.id}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
