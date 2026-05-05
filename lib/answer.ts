function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¡¿!?.,;:"'`´]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function isAnswerCorrect(
  user: string,
  correct: string,
  acceptable: string[] = []
): boolean {
  const u = normalize(user);
  if (!u) return false;
  if (u === normalize(correct)) return true;
  return acceptable.some((a) => normalize(a) === u);
}

export function containsHebrew(text: string): boolean {
  return /[֐-׿יִ-ﭏ]/.test(text || "");
}
