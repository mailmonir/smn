"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
import {
  createCategory,
  updateCategory,
  deleteCategory,
  fetchCategories,
  Category,
} from "@/lib/categories";
import CategoryForm from "./CategoryForm";
//

export default function CategoryManager() {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Mutations with optimistic updates
  const createMutation = useMutation({
    mutationFn: createCategory,
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const previous = queryClient.getQueryData<Category[]>(["categories"]);
      queryClient.setQueryData<Category[]>(["categories"], (old = []) => [
        ...old,
        { id: "temp-id", ...newCategory, _count: { questions: 0 } } as Category,
      ]);
      return { previous };
    },
    onError: (_err, _newCategory, ctx) => {
      queryClient.setQueryData(["categories"], ctx?.previous);
      toast.error("Failed to create category");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowModal(false);
      setEditingCategory(null);
      toast.success("Category created successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      updateCategory(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const previous = queryClient.getQueryData<Category[]>(["categories"]);
      queryClient.setQueryData<Category[]>(["categories"], (old = []) =>
        old.map((cat) => (cat.id === id ? { ...cat, ...data } : cat))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(["categories"], ctx?.previous);
      toast.error("Failed to update category");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowModal(false);
      setEditingCategory(null);
      toast.success("Category updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const previous = queryClient.getQueryData<Category[]>(["categories"]);
      queryClient.setQueryData<Category[]>(["categories"], (old = []) =>
        old.filter((cat) => cat.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(["categories"], ctx?.previous);
      toast.error("Failed to delete category");
    },
    onSuccess: () => {
      toast.success("Category deleted successfully");
    },
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingCategory(null);
  };

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
        <h2 className="text-2xl font-semibold">Categories</h2>

        <Dialog
          open={showModal}
          onOpenChange={(open) => {
            setShowModal(open);
            if (!open) handleCloseModal();
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={handleCloseModal}>Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add Category"}
              </DialogTitle>
            </DialogHeader>

            <div className="">
              <CategoryForm
                key={editingCategory?.id ?? "new"}
                defaultValues={
                  editingCategory || { name: "", description: "", order: 0 }
                }
                onCancel={handleCloseModal}
                onSubmit={(values) => {
                  if (editingCategory) {
                    updateMutation.mutate({
                      id: editingCategory.id,
                      data: values,
                    });
                  } else {
                    createMutation.mutate(values);
                  }
                  handleCloseModal();
                }}
                isSubmitting={
                  createMutation.isPending || updateMutation.isPending
                }
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                {category.description && (
                  <p className="text-gray-600 mb-2">{category.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Order: {category.order}</span>
                  <span>Questions: {category._count.questions}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(category)}
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
                        Are you sure you want to delete this category? This will
                        also delete all questions in this category.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(category.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Continue{" "}
                        <ButtonLoader isSubmitting={deleteMutation.isPending} />
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}

        {categories.length === 0 && (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first category to get started.
            </p>
            <Button
              onClick={() => {
                setEditingCategory(null);
                setShowModal(true);
              }}
            >
              Add Category
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
