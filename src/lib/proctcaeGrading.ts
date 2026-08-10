// PRO-CTCAE Composite Grading Algorithm
//
// Source: Basch E, Becker C, Rogak LJ, et al. "Composite grading algorithm for
// the National Cancer Institute's Patient-Reported Outcomes version of the
// Common Terminology Criteria for Adverse Events (PRO-CTCAE)." Clinical
// Trials. 2021;18(1):104-114. Supplemental Table S2 (parts A, B, C). Values
// below are transcribed verbatim from that table.
//
// Response scales (0-indexed):
//   frequency:    전혀 없다(0) 드물게 있다(1) 가끔 있다(2) 자주 있다(3) 거의 항상 있다(4)
//   severity:     전혀 없다(0) 약간 있다(1) 보통이다(2) 심하다(3) 매우 심하다(4)
//   interference: 전혀 없다(0) 약간 있다(1) 다소 있다(2) 많다(3) 매우 많다(4)
//   amount:       전혀 없다(0) 약간 있다(1) 다소 있다(2) 많다(3) 매우 많다(4)  (items 27, 59 only)
//
// Per protocol, only the 18 pre-specified items are entered into the primary
// exploratory factor analysis; the remaining gradable items are still graded
// here and reported descriptively. "none"-dimension items (binary / 6-7
// option items with non-numeric anchors such as "해당 사항 없다") are outside
// the scope of this algorithm and are reported as raw prevalence instead.

import type { SurveyItem } from "./questions";

export type GradeInputs = {
  frequency?: number;
  severity?: number;
  interference?: number;
};

function buildMap3(rows: [number, number, number, number][]): Map<string, number> {
  const map = new Map<string, number>();
  for (const [a, b, c, grade] of rows) map.set(`${a}-${b}-${c}`, grade);
  return map;
}

function buildMap2(rows: [number, number, number][]): Map<string, number> {
  const map = new Map<string, number>();
  for (const [a, b, grade] of rows) map.set(`${a}-${b}`, grade);
  return map;
}

function buildMap1(rows: [number, number][]): Map<number, number> {
  const map = new Map<number, number>();
  for (const [a, grade] of rows) map.set(a, grade);
  return map;
}

// Table S2-A: frequency x severity x interference -> grade
// (rows for frequency=0 "Never" omitted; see frequency===0 shortcut below)
const TABLE_3ITEM = buildMap3([
  [1, 0, 0, 0], [1, 0, 1, 1], [1, 0, 2, 1], [1, 0, 3, 2], [1, 0, 4, 2],
  [1, 1, 0, 1], [1, 1, 1, 1], [1, 1, 2, 1], [1, 1, 3, 2], [1, 1, 4, 2],
  [1, 2, 0, 1], [1, 2, 1, 2], [1, 2, 2, 2], [1, 2, 3, 2], [1, 2, 4, 3],
  [1, 3, 0, 2], [1, 3, 1, 2], [1, 3, 2, 2], [1, 3, 3, 3], [1, 3, 4, 3],
  [1, 4, 0, 2], [1, 4, 1, 2], [1, 4, 2, 3], [1, 4, 3, 3], [1, 4, 4, 3],

  [2, 0, 0, 0], [2, 0, 1, 1], [2, 0, 2, 1], [2, 0, 3, 2], [2, 0, 4, 2],
  [2, 1, 0, 1], [2, 1, 1, 1], [2, 1, 2, 1], [2, 1, 3, 2], [2, 1, 4, 2],
  [2, 2, 0, 2], [2, 2, 1, 2], [2, 2, 2, 2], [2, 2, 3, 3], [2, 2, 4, 3],
  [2, 3, 0, 2], [2, 3, 1, 2], [2, 3, 2, 2], [2, 3, 3, 3], [2, 3, 4, 3],
  [2, 4, 0, 2], [2, 4, 1, 2], [2, 4, 2, 3], [2, 4, 3, 3], [2, 4, 4, 3],

  [3, 0, 0, 1], [3, 0, 1, 1], [3, 0, 2, 1], [3, 0, 3, 2], [3, 0, 4, 2],
  [3, 1, 0, 1], [3, 1, 1, 1], [3, 1, 2, 1], [3, 1, 3, 2], [3, 1, 4, 2],
  [3, 2, 0, 2], [3, 2, 1, 2], [3, 2, 2, 2], [3, 2, 3, 3], [3, 2, 4, 3],
  [3, 3, 0, 2], [3, 3, 1, 2], [3, 3, 2, 3], [3, 3, 3, 3], [3, 3, 4, 3],
  [3, 4, 0, 2], [3, 4, 1, 2], [3, 4, 2, 3], [3, 4, 3, 3], [3, 4, 4, 3],

  [4, 0, 0, 1], [4, 0, 1, 1], [4, 0, 2, 1], [4, 0, 3, 2], [4, 0, 4, 2],
  [4, 1, 0, 1], [4, 1, 1, 1], [4, 1, 2, 2], [4, 1, 3, 2], [4, 1, 4, 3],
  [4, 2, 0, 2], [4, 2, 1, 2], [4, 2, 2, 2], [4, 2, 3, 3], [4, 2, 4, 3],
  [4, 3, 0, 2], [4, 3, 1, 2], [4, 3, 2, 3], [4, 3, 3, 3], [4, 3, 4, 3],
  [4, 4, 0, 2], [4, 4, 1, 2], [4, 4, 2, 3], [4, 4, 3, 3], [4, 4, 4, 3],
]);

// Table S2-B (frequency x severity); frequency=0 row omitted (shortcut).
const TABLE_FREQ_SEV = buildMap2([
  [1, 0, 1], [1, 1, 1], [1, 2, 1], [1, 3, 2], [1, 4, 2],
  [2, 0, 1], [2, 1, 1], [2, 2, 2], [2, 3, 2], [2, 4, 2],
  [3, 0, 1], [3, 1, 1], [3, 2, 2], [3, 3, 3], [3, 4, 3],
  [4, 0, 1], [4, 1, 1], [4, 2, 2], [4, 3, 3], [4, 4, 3],
]);

// Table S2-B (severity x interference); severity=0 row omitted (shortcut).
const TABLE_SEV_INT = buildMap2([
  [1, 0, 1], [1, 1, 1], [1, 2, 1], [1, 3, 2], [1, 4, 2],
  [2, 0, 1], [2, 1, 1], [2, 2, 2], [2, 3, 2], [2, 4, 3],
  [3, 0, 1], [3, 1, 2], [3, 2, 2], [3, 3, 3], [3, 4, 3],
  [4, 0, 2], [4, 1, 2], [4, 2, 2], [4, 3, 3], [4, 4, 3],
]);

// Table S2-B (frequency x interference); frequency=0 row omitted (shortcut).
const TABLE_FREQ_INT = buildMap2([
  [1, 0, 1], [1, 1, 1], [1, 2, 1], [1, 3, 2], [1, 4, 2],
  [2, 0, 1], [2, 1, 1], [2, 2, 1], [2, 3, 2], [2, 4, 2],
  [3, 0, 1], [3, 1, 1], [3, 2, 2], [3, 3, 3], [3, 4, 3],
  [4, 0, 1], [4, 1, 1], [4, 2, 2], [4, 3, 3], [4, 4, 3],
]);

// Table S2-C: single-dimension tables (frequency, severity, amount).
const TABLE_FREQ_ONLY = buildMap1([[0, 0], [1, 1], [2, 1], [3, 2], [4, 3]]);
const TABLE_SEV_ONLY = buildMap1([[0, 0], [1, 1], [2, 2], [3, 3], [4, 3]]);
const TABLE_AMOUNT_ONLY = buildMap1([[0, 0], [1, 1], [2, 1], [3, 2], [4, 2]]);

/**
 * Maps a PRO-CTCAE item's reported frequency/severity/interference to a
 * CTCAE-style composite grade (0-3), per Basch et al. 2021 Table S2.
 * Returns null when no gradable dimension was provided.
 */
export function computeCompositeGrade(inputs: GradeInputs): number | null {
  const { frequency, severity, interference } = inputs;
  const hasFreq = frequency !== undefined;
  const hasSev = severity !== undefined;
  const hasInt = interference !== undefined;

  if (hasFreq && hasSev && hasInt) {
    if (frequency === 0) return 0;
    return TABLE_3ITEM.get(`${frequency}-${severity}-${interference}`) ?? null;
  }
  if (hasFreq && hasSev) {
    if (frequency === 0) return 0;
    return TABLE_FREQ_SEV.get(`${frequency}-${severity}`) ?? null;
  }
  if (hasSev && hasInt) {
    if (severity === 0) return 0;
    return TABLE_SEV_INT.get(`${severity}-${interference}`) ?? null;
  }
  if (hasFreq && hasInt) {
    if (frequency === 0) return 0;
    return TABLE_FREQ_INT.get(`${frequency}-${interference}`) ?? null;
  }
  if (hasFreq) return TABLE_FREQ_ONLY.get(frequency as number) ?? null;
  if (hasSev) return TABLE_SEV_ONLY.get(severity as number) ?? null;
  return null;
}

/** Same as computeCompositeGrade, for a PRO-CTCAE "amount" question alone (items 27, 59). */
export function computeAmountOnlyGrade(amount: number): number | null {
  return TABLE_AMOUNT_ONLY.get(amount) ?? null;
}

/**
 * Resolves an item's composite grade from its question definitions and a
 * map of that item's answered values (keyed by sub-question key).
 * Returns null for items whose sub-questions are all grade:"none".
 */
export function computeItemGrade(
  item: Pick<SurveyItem, "questions">,
  valuesByKey: Record<string, number | undefined>
): number | null {
  const inputs: GradeInputs = {};
  let amount: number | undefined;
  for (const sq of item.questions) {
    const value = valuesByKey[sq.key];
    if (value === undefined) continue;
    if (sq.grade === "frequency") inputs.frequency = value;
    else if (sq.grade === "severity") inputs.severity = value;
    else if (sq.grade === "interference") inputs.interference = value;
    else if (sq.grade === "amount") amount = value;
    // "none" is intentionally ignored — not part of the grading algorithm
  }
  if (amount !== undefined) return computeAmountOnlyGrade(amount);
  if (Object.keys(inputs).length === 0) return null;
  return computeCompositeGrade(inputs);
}

export const GRADE_COLORS: Record<number, string> = {
  0: "bg-gray-100 text-gray-400",
  1: "bg-amber-200 text-amber-900",
  2: "bg-orange-400 text-white",
  3: "bg-red-600 text-white",
};

export const GRADE_LABELS: Record<number, string> = {
  0: "없음",
  1: "경도",
  2: "중등도",
  3: "중증",
};
