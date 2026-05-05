export function greeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h >= 5 && h < 13) return "buen día";
  if (h >= 13 && h < 20) return "buenas tardes";
  return "buenas noches";
}
