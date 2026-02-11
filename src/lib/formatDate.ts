const MONTHS_PL = [
  "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia",
];

export function formatDatePL(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${parseInt(day)} ${MONTHS_PL[parseInt(month) - 1]} ${year}`;
}
