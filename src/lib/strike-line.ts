// The hand-drawn rosa line that crosses a textbook word out: on the welcome
// screen's word swaps, and on the onboarding's "Make it Argentine" card.

/**
 * The hand-drawn line through a word `w` wide: two gentle curves, and its
 * length (sampled, a few pixels over) so a dash of that length can draw it from
 * nothing to whole without a stub showing at either end.
 */
export function strikeLine(w: number) {
  const p0 = [2, 11];
  const c1 = [w * 0.18, 6];
  const c2 = [w * 0.3, 13];
  const p1 = [w * 0.48, 9];
  const c3 = [w * 0.78, 6];
  const p2 = [w + 10, 10];
  const c2r = [2 * p1[0] - c2[0], 2 * p1[1] - c2[1]]; // what `S` reflects
  const at = (a: number[], b: number[], c: number[], d: number[], t: number, i: number) =>
    (1 - t) ** 3 * a[i] + 3 * (1 - t) ** 2 * t * b[i] + 3 * (1 - t) * t ** 2 * c[i] + t ** 3 * d[i];
  let length = 0;
  for (const [a, b, c, d] of [
    [p0, c1, c2, p1],
    [p1, c2r, c3, p2],
  ]) {
    for (let k = 1; k <= 24; k++) {
      const t0 = (k - 1) / 24;
      const t1 = k / 24;
      length += Math.hypot(at(a, b, c, d, t1, 0) - at(a, b, c, d, t0, 0), at(a, b, c, d, t1, 1) - at(a, b, c, d, t0, 1));
    }
  }
  return { d: `M ${p0} C ${c1} ${c2} ${p1} S ${c3} ${p2}`, length: length + 4 };
}
