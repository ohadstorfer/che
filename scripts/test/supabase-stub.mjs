// Stands in for src/lib/supabase.ts under node tests. Every query resolves
// empty; tests exercise the pure parts of the libs, never the loading.
const empty = () => {
  const q = new Proxy(() => {}, {
    get: (_t, prop) => (prop === 'then' ? (ok) => Promise.resolve({ data: null, error: null }).then(ok) : () => q),
    apply: () => q,
  });
  return q;
};
export const supabase = { from: empty, rpc: empty, functions: { invoke: empty } };
