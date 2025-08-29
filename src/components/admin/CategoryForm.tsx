"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ButtonLoader from "../ButtonLoader";

interface FormValues {
  name: string;
  description?: string;
  order: number;
}

export default function CategoryForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  defaultValues: FormValues;
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<FormValues>(defaultValues);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          type="text"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          required
          placeholder="Category name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={values.description || ""}
          onChange={(e) =>
            setValues({ ...values, description: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Category description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Order</label>
        <Input
          type="number"
          value={values.order}
          onChange={(e) =>
            setValues({ ...values, order: parseInt(e.target.value) || 0 })
          }
          min="0"
          placeholder="Display order"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Save <ButtonLoader isSubmitting={isSubmitting} />
        </Button>
      </div>
    </form>
  );
}
