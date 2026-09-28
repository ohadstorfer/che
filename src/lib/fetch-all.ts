/**
 * Every row of a query, past PostgREST's page size (1,000 rows). The query
 * must order on something unique (an id), or rows can repeat or go missing
 * between pages. The first page goes alone (most queries fit in it); past it,
 * pages are asked for a few at a time rather than one after another, so a
 * 27-page table is 8 round trips, not 27.
 */
const PAGE = 1000;
const IN_FLIGHT = 4;

type Query = () => { range: (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }> };

async function page<T>(query: Query, n: number): Promise<T[]> {
  const { data, error } = await query().range(n * PAGE, n * PAGE + PAGE - 1);
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export async function all<T>(query: Query) {
  const out = await page<T>(query, 0);
  if (out.length < PAGE) return out;
  for (let next = 1; ; next += IN_FLIGHT) {
    const pages = await Promise.all(Array.from({ length: IN_FLIGHT }, (_, k) => page<T>(query, next + k)));
    for (const rows of pages) {
      out.push(...rows);
      if (rows.length < PAGE) return out;
    }
  }
}
