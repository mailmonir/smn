"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import QuestionForm, { Question, Category } from "./QuestionForm";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ButtonLoader from "../ButtonLoader";
import { toast } from "sonner";

export default function QuestionManager() {
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const { ref, inView } = useInView();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      return data || [];
    },
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["questions", selectedCategoryId],
      queryFn: async ({ pageParam = 0 }) => {
        const params = new URLSearchParams({
          page: pageParam.toString(),
          limit: "10",
          ...(selectedCategoryId !== "all" && {
            categoryId: selectedCategoryId,
          }),
        });
        const res = await fetch(`/api/admin/questions?${params}`);
        const data = await res.json();
        return data;
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: 0,
    });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete question");
      return id;
    },
    onSuccess: () => {
      toast.success("Question deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allQuestions = data?.pages.flatMap((page) => page.questions) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Questions</h2>
        <Button
          onClick={() => {
            setEditingQuestion(null);
            setShowModal(true);
          }}
          disabled={categories.length === 0}
        >
          Add Question
        </Button>
      </div>

      {/* --- Filter --- */}
      <div className="mb-6">
        <Select
          value={selectedCategoryId}
          onValueChange={setSelectedCategoryId}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category: Category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* --- Questions List --- */}
      <div className="space-y-4">
        {allQuestions.map((question: Question) => (
          <Card key={question.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {question.category?.name || "Unknown Category"}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {question.marks} {question.marks === 1 ? "mark" : "marks"}
                  </span>
                  <span className="text-xs text-gray-500">
                    Order: {question.order}
                  </span>
                </div>

                <h3 className="text-lg font-medium mb-3">
                  {question.question}
                </h3>

                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div
                      key={option.id}
                      className={`p-2 rounded border ${
                        option.isCorrect
                          ? "border-green-500 bg-green-50 text-green-800"
                          : "border-gray-200"
                      }`}
                    >
                      <span className="font-medium">
                        {String.fromCharCode(65 + index)}.
                      </span>{" "}
                      {option.text}
                      {option.isCorrect && (
                        <span className="ml-2 text-xs font-medium">
                          ✓ Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingQuestion(question);
                    setShowModal(true);
                  }}
                >
                  Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                    >
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this question? You
                        cannot undo this operation.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteQuestion.mutate(question.id)}
                        disabled={deleteQuestion.isPending}
                      >
                        Continue{" "}
                        <ButtonLoader isSubmitting={deleteQuestion.isPending} />
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}

        {/* Loading indicator for infinite scroll */}
        {hasNextPage && (
          <div ref={ref} className="flex justify-center py-4">
            {isFetchingNextPage && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            )}
          </div>
        )}

        {allQuestions.length === 0 && (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">
              {selectedCategoryId === "all"
                ? "No questions yet"
                : "No questions in this category"}
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first question to get started.
            </p>
            <Button onClick={() => setShowModal(true)}>Add Question</Button>
          </Card>
        )}
      </div>

      <Dialog
        open={showModal}
        onOpenChange={(open) => {
          setShowModal(open);
        }}
      >
        <DialogTrigger asChild />
        {showModal && (
          <QuestionForm
            categories={categories}
            editingQuestion={editingQuestion}
            onClose={() => setShowModal(false)}
          />
        )}
      </Dialog>
    </div>
  );
}
