export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  _count: {
    questions: number;
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/admin/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function createCategory(data: Partial<Category>) {
  const res = await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

export async function updateCategory(id: string, data: Partial<Category>) {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update category");
  return res.json();
}

export async function deleteCategory(id: string) {
  const res = await fetch(`/api/admin/categories/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete category");
  return res.json();
}
