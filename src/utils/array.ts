/**
 * Map and drop in one pass: `f` returns `null` for items that shouldn't appear
 * in the result.
 *
 * Written as an explicit wrap rather than `flatMap(x => f(x) ?? [])` so that a
 * mapper legitimately returning an array yields that array as one element
 * instead of being silently flattened into the output.
 */
export function compactMap<T, U>(
  items: readonly T[],
  f: (item: T, index: number) => U | null,
): U[] {
  return items.flatMap((item, index) => {
    const mapped = f(item, index);
    return mapped === null ? [] : [mapped];
  });
}
