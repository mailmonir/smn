"use client";

import { QuizQuestion } from "@/lib/types";

interface QuestionCardProps {
  question: QuizQuestion;
  selectedOption?: string;
  onAnswerSelect: (questionId: string, optionId: string) => void;
}

export default function QuestionCard({
  question,
  selectedOption,
  onAnswerSelect,
}: QuestionCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium flex-1">{question.question}</h3>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm ml-4">
          {question.marks} {question.marks === 1 ? "mark" : "marks"}
        </span>
      </div>

      <div className="space-y-3">
        {question.options.map((option) => (
          <label
            key={option.id}
            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedOption === option.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name={question.id}
              value={option.id}
              checked={selectedOption === option.id}
              onChange={() => onAnswerSelect(question.id, option.id)}
              className="mr-3"
            />
            <span
              className={selectedOption === option.id ? "text-blue-700" : ""}
            >
              {option.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
