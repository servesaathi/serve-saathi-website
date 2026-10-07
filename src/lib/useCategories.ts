"use client";

import { useEffect, useState } from "react";
import { categoryService, type Category } from "@/lib/api/services/category.service";
import { getErrorMessage } from "@/lib/api/types";

// Active top-level service categories from GET /categories, in the admin's
// sortOrder. The Sidebar, the Explore Services icon row and the provider
// results all need this list on the same page, so the request is shared
// module-wide: one fetch per page load, retried on the next mount if it failed.

let pending: Promise<Category[]> | null = null;

function fetchCategories(): Promise<Category[]> {
  pending ??= categoryService
    .getCategories({ isActive: true, sortBy: "sortOrder", sortOrder: "ASC", limit: 100 })
    .then(({ items }) =>
      items.filter((c) => c.isActive && c.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder)
    )
    .catch((err) => {
      pending = null;
      throw err;
    });
  return pending;
}

export function useCategories(): { categories: Category[] | undefined; error?: string } {
  const [state, setState] = useState<{ categories?: Category[]; error?: string }>({});

  useEffect(() => {
    let alive = true;
    fetchCategories().then(
      (categories) => alive && setState({ categories }),
      (err) => alive && setState({ error: getErrorMessage(err) })
    );
    return () => {
      alive = false;
    };
  }, []);

  return { categories: state.categories, error: state.error };
}
