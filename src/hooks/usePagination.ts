import { useMemo, useState } from "react";

export type Pagination<T> = {
  page: number;
  pageCount: number;
  pageItems: T[];
  setPage: (page: number) => void;
  next: () => void;
  prev: () => void;
  canPrev: boolean;
  canNext: boolean;
};

/** Slices `items` into pages of `pageSize` and tracks the current page. */
export function usePagination<T>(items: T[], pageSize = 10): Pagination<T> {
  const [page, setPageState] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  const setPage = (next: number) =>
    setPageState(Math.min(pageCount - 1, Math.max(0, next)));

  const pageItems = useMemo(
    () => items.slice(page * pageSize, page * pageSize + pageSize),
    [items, page, pageSize]
  );

  return {
    page,
    pageCount,
    pageItems,
    setPage,
    next: () => setPage(page + 1),
    prev: () => setPage(page - 1),
    canPrev: page > 0,
    canNext: page < pageCount - 1,
  };
}
