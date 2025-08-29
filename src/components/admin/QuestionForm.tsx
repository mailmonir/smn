"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import ButtonLoader from "../ButtonLoader";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface Question {
  id: string;
  categoryId: string;
  question: string;
  options: QuestionOption[];
  marks: number;
  order: number;
  category: {
    name: string;
  };
}

interface QuestionFormProps {
  categories: Category[];
  editingQuestion?: Question | null;
  onClose: () => void;
}

export default function QuestionForm({
  categories,
  editingQuestion = null,
  onClose,
}: QuestionFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    categoryId: "",
    question: "",
    marks: 1,
    order: 0,
    options: [
      { id: "1", text: "", isCorrect: false },
      { id: "2", text: "", isCorrect: false },
      { id: "3", text: "", isCorrect: false },
      { id: "4", text: "", isCorrect: false },
    ] as QuestionOption[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (editingQuestion) {
      setFormData({
        categoryId: editingQuestion.categoryId,
        question: editingQuestion.question,
        marks: editingQuestion.marks,
        order: editingQuestion.order,
        options:
          editingQuestion.options.length > 0
            ? editingQuestion.options
            : [
                { id: "1", text: "", isCorrect: false },
                { id: "2", text: "", isCorrect: false },
                { id: "3", text: "", isCorrect: false },
                { id: "4", text: "", isCorrect: false },
              ],
      });
    }
  }, [editingQuestion]);

  const createOrUpdateQuestion = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const url = editingQuestion
        ? `/api/admin/questions/${editingQuestion.id}`
        : "/api/admin/questions";
      const method = editingQuestion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong");
      return result;
    },
    onMutate: async (newData) => {
      setIsSubmitting(true);
      await queryClient.cancelQueries({ queryKey: ["questions"] });
      const previousQuestions = queryClient.getQueryData<Question[]>([
        "questions",
      ]);

      if (editingQuestion) {
        queryClient.setQueryData<Question[]>(["questions"], (old = []) =>
          old.map((q) =>
            q.id === editingQuestion.id ? { ...q, ...newData } : q
          )
        );
      } else {
        const tempId = `temp-${Date.now()}`;
        queryClient.setQueryData<Question[]>(["questions"], (old = []) => [
          ...old,
          {
            ...newData,
            id: tempId,
            category: categories.find((c) => c.id === newData.categoryId)!,
          },
        ]);
      }

      return { previousQuestions };
    },
    onError: (err, newData, context) => {
      toast.error("Failed to save question");
      if (context?.previousQuestions) {
        queryClient.setQueryData(["questions"], context.previousQuestions);
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      onClose();
    },
    onSuccess: () => {
      toast.success(editingQuestion ? "Question updated" : "Question created");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.question.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const filledOptions = formData.options.filter((opt) => opt.text.trim());
    if (filledOptions.length < 2) {
      toast.error("Provide at least 2 options");
      return;
    }

    const correctOptions = filledOptions.filter((opt) => opt.isCorrect);
    if (correctOptions.length !== 1) {
      toast.error("Select exactly one correct answer");
      return;
    }

    createOrUpdateQuestion.mutate({ ...formData, options: filledOptions });
  };

  const handleOptionChange = (
    index: number,
    field: "text" | "isCorrect",
    value: string | boolean
  ) => {
    const newOptions = [...formData.options];
    if (field === "isCorrect" && value === true) {
      newOptions.forEach((opt, i) => (opt.isCorrect = i === index));
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    const newId = (formData.options.length + 1).toString();
    setFormData({
      ...formData,
      options: [...formData.options, { id: newId, text: "", isCorrect: false }],
    });
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return;
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <DialogContent className="sm:min-w-2xl md:min-w-3xl lg:min-w-4xl">
      <DialogHeader>
        <DialogTitle>
          {editingQuestion ? "Edit Question" : "Add Question"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category + Marks + Order */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <Select
              value={formData.categoryId}
              onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Marks</label>
              <Input
                type="number"
                value={formData.marks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    marks: parseInt(e.target.value) || 1,
                  })
                }
                min={1}
                max={10}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Order</label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                min={0}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div>
          <label className="block text-sm font-medium mb-1">Question *</label>
          <textarea
            value={formData.question}
            onChange={(e) =>
              setFormData({ ...formData, question: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter your question"
            required
          />
        </div>

        {/* Options */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium">Options *</label>
            {formData.options.length < 6 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                Add Option
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {formData.options.map((opt, i) => (
              <div key={opt.id} className="flex items-center space-x-3">
                <span className="font-medium text-sm w-6">
                  {String.fromCharCode(65 + i)}.
                </span>
                <Input
                  type="text"
                  value={opt.text}
                  onChange={(e) =>
                    handleOptionChange(i, "text", e.target.value)
                  }
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  className="flex-1"
                />
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={opt.isCorrect}
                    onChange={() => handleOptionChange(i, "isCorrect", true)}
                    className="text-green-600"
                  />
                  <span className="text-sm text-green-600">Correct</span>
                </label>
                {formData.options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(i)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            * Select exactly one correct answer. Minimum 2 options required.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {editingQuestion ? "Update Question" : "Create Question"}
            {isSubmitting && <ButtonLoader isSubmitting />}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
