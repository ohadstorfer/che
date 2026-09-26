/**
 * Every row of a query, past PostgREST's page size (1,000 rows). The query
 * must order on something unique (an id), or rows can repeat or go missing
 * between pages.
 */
export async function all<T>(
  query: () => { range: (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }> },
) {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await query().range(from, from + 999);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < 1000) return out;
  }
}
