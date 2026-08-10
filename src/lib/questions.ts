// NCI PRO-CTCAE® Item Library — Korean, Version 1.0 (Version date: 2025-12-03)
// Text transcribed verbatim from the official Korean item library PDF supplied
// by the research team (pro-ctcae_korean.pdf). Do not paraphrase — this wording
// is what the IRB-approved protocol and paper CRF/codebook reference.

export type OptionSetKey =
  | "freq5" // 빈도 5단계
  | "sev5" // 중증도 5단계
  | "int5" // 방해정도 5단계 (also reused verbatim as the "amount" scale for items 27, 59)
  | "yn2" // 네 / 아니요
  | "sev6" // 중증도 5단계 + 해당 사항 없다
  | "sev7" // 중증도 5단계 + 성생활을 하지 않는다 + 답하고 싶지 않다
  | "freq7" // 빈도 5단계 + 성생활을 하지 않는다 + 답하고 싶지 않다
  | "ynsex4" // 네 / 아니요 / 성생활을 하지 않는다 / 답하고 싶지 않다
  | "ynna3"; // 네 / 아니요 / 해당 사항 없다

// Which composite-grading dimension (Basch et al. 2021, Table S2) each option
// set feeds. "none" = not part of the composite grading algorithm (reported
// descriptively as prevalence only, per protocol).
export type GradeDimension = "frequency" | "severity" | "interference" | "amount" | "none";

export const OPTION_SETS: Record<OptionSetKey, string[]> = {
  freq5: ["전혀 없다", "드물게 있다", "가끔 있다", "자주 있다", "거의 항상 있다"],
  sev5: ["전혀 없다", "약간 있다", "보통이다", "심하다", "매우 심하다"],
  int5: ["전혀 없다", "약간 있다", "다소 있다", "많다", "매우 많다"],
  yn2: ["네", "아니요"],
  sev6: ["전혀 없다", "약간 있다", "보통이다", "심하다", "매우 심하다", "해당 사항 없다"],
  sev7: [
    "전혀 없다", "약간 있다", "보통이다", "심하다", "매우 심하다",
    "성생활을 하지 않는다", "답하고 싶지 않다",
  ],
  freq7: [
    "전혀 없다", "드물게 있다", "가끔 있다", "자주 있다", "거의 항상 있다",
    "성생활을 하지 않는다", "답하고 싶지 않다",
  ],
  ynsex4: ["네", "아니요", "성생활을 하지 않는다", "답하고 싶지 않다"],
  ynna3: ["네", "아니요", "해당 사항 없다"],
};

export interface SubQuestion {
  key: string; // 'a', 'b', 'c'
  text: string;
  optionSet: OptionSetKey;
  grade: GradeDimension;
}

export interface SurveyItem {
  id: number; // 1-80, matches NCI PRO-CTCAE Item Library-Korean v1.0 numbering
  termEn: string;
  termKo: string;
  category: string;
  inEfaSet: boolean; // true for the 18 pre-specified gradable items entered into the primary EFA
  questions: SubQuestion[];
}

const q = (
  key: string,
  text: string,
  optionSet: OptionSetKey,
  grade: GradeDimension
): SubQuestion => ({ key, text, optionSet, grade });

// The 18 pre-specified gradable items entered into the primary exploratory
// factor analysis (see protocol §자료수집방법 / §통계방법).
const EFA_SET = new Set([1, 3, 8, 9, 16, 17, 19, 25, 28, 39, 46, 47, 48, 51, 52, 53, 54, 56]);

export const SURVEY_ITEMS: SurveyItem[] = [
  // ── 구강 ──────────────────────────────────────────────────────
  { id: 1, termEn: "Dry mouth", termKo: "입 마름", category: "구강", inEfaSet: EFA_SET.has(1), questions: [
    q("a", "지난 일주일 동안, 입 마름이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 2, termEn: "Difficulty swallowing", termKo: "삼키기 어려움", category: "구강", inEfaSet: EFA_SET.has(2), questions: [
    q("a", "지난 일주일 동안, 삼키기 어려운 증상이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 3, termEn: "Mouth/throat sores", termKo: "입안이 헐어서 아프거나 목이 따가운 증상(구내염)", category: "구강", inEfaSet: EFA_SET.has(3), questions: [
    q("a", "지난 일주일 동안, 입안이 헐어서 아프거나 목이 따가운 증상이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("b", "지난 일주일 동안, 입안이 헐어서 아프거나 목이 따가운 증상이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 4, termEn: "Cracking at the corners of the mouth (cheilosis/cheilitis)", termKo: "입술 가장자리가 트거나 갈라짐", category: "구강", inEfaSet: EFA_SET.has(4), questions: [
    q("a", "지난 일주일 동안, 입술 가장자리가 트거나 갈라짐이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 5, termEn: "Voice quality changes", termKo: "목소리 변화", category: "구강", inEfaSet: EFA_SET.has(5), questions: [
    q("a", "지난 일주일 동안, 목소리에 변화가 있었습니까?", "yn2", "none"),
  ]},
  { id: 6, termEn: "Hoarseness", termKo: "쉰 목소리", category: "구강", inEfaSet: EFA_SET.has(6), questions: [
    q("a", "지난 일주일 동안, 쉰 목소리가 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 7, termEn: "Taste changes", termKo: "음식이나 음료의 맛을 느끼기 어려움", category: "구강", inEfaSet: EFA_SET.has(7), questions: [
    q("a", "지난 일주일 동안, 음식이나 음료의 맛을 느끼기 어려운 게 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},

  // ── 소화기계 ──────────────────────────────────────────────────
  { id: 8, termEn: "Decreased appetite", termKo: "식욕 감소", category: "소화기계", inEfaSet: EFA_SET.has(8), questions: [
    q("a", "지난 일주일 동안, 식욕 감소가 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("b", "지난 일주일 동안, 식욕 감소가 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 9, termEn: "Nausea", termKo: "메스꺼움", category: "소화기계", inEfaSet: EFA_SET.has(9), questions: [
    q("a", "지난 일주일 동안, 메스꺼움을 얼마나 자주 느꼈습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 메스꺼움이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 10, termEn: "Vomiting", termKo: "구토(음식을 토함)", category: "소화기계", inEfaSet: EFA_SET.has(10), questions: [
    q("a", "지난 일주일 동안, 구토를 얼마나 자주 했습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 구토가 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 11, termEn: "Heartburn", termKo: "속쓰림", category: "소화기계", inEfaSet: EFA_SET.has(11), questions: [
    q("a", "지난 일주일 동안, 속쓰림이 얼마나 자주 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 속쓰림이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 12, termEn: "Gas", termKo: "가스(방귀)가 나오는 수가 증가함", category: "소화기계", inEfaSet: EFA_SET.has(12), questions: [
    q("a", "지난 일주일 동안, 가스(방귀)가 나오는 수가 늘어난 적이 있었습니까?", "yn2", "none"),
  ]},
  { id: 13, termEn: "Bloating", termKo: "복부 팽만(가스가 찬 것처럼 배가 빵빵해짐)", category: "소화기계", inEfaSet: EFA_SET.has(13), questions: [
    q("a", "지난 일주일 동안, 복부 팽만이 얼마나 자주 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 복부 팽만이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 14, termEn: "Hiccups", termKo: "딸꾹질", category: "소화기계", inEfaSet: EFA_SET.has(14), questions: [
    q("a", "지난 일주일 동안, 딸꾹질을 얼마나 자주 했습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 딸꾹질이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 15, termEn: "Constipation", termKo: "변비", category: "소화기계", inEfaSet: EFA_SET.has(15), questions: [
    q("a", "지난 일주일 동안, 변비가 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 16, termEn: "Diarrhea", termKo: "무른 변(설사)", category: "소화기계", inEfaSet: EFA_SET.has(16), questions: [
    q("a", "지난 일주일 동안, 무른 변을 보거나 설사를 한 적이 얼마나 자주 있었습니까?", "freq5", "frequency"),
  ]},
  { id: 17, termEn: "Abdominal pain", termKo: "복부 통증(아랫배)", category: "소화기계", inEfaSet: EFA_SET.has(17), questions: [
    q("a", "지난 일주일 동안, 복부 통증이 얼마나 자주 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 복부 통증이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("c", "지난 일주일 동안, 복부 통증이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 18, termEn: "Fecal incontinence", termKo: "변을 참기 어려움", category: "소화기계", inEfaSet: EFA_SET.has(18), questions: [
    q("a", "지난 일주일 동안, 변을 참기 어려운 적이 얼마나 자주 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 변을 참기 어려운 증상이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},

  // ── 호흡기 ────────────────────────────────────────────────────
  { id: 19, termEn: "Shortness of breath", termKo: "숨 참", category: "호흡기", inEfaSet: EFA_SET.has(19), questions: [
    q("a", "지난 일주일 동안, 숨이 차는 증상이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("b", "지난 일주일 동안, 숨이 차는 증상이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 20, termEn: "Cough", termKo: "기침", category: "호흡기", inEfaSet: EFA_SET.has(20), questions: [
    q("a", "지난 일주일 동안, 기침이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("b", "지난 일주일 동안, 기침 때문에 일상생활에 얼마나 지장을 받았습니까?", "int5", "interference"),
  ]},
  { id: 21, termEn: "Wheezing", termKo: "쌕쌕거리는 숨소리(천명)", category: "호흡기", inEfaSet: EFA_SET.has(21), questions: [
    q("a", "지난 일주일 동안, 쌕쌕거리는 숨소리(천명)가 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},

  // ── 심혈관계 ──────────────────────────────────────────────────
  { id: 22, termEn: "Swelling", termKo: "팔 또는 다리의 부기", category: "심혈관계", inEfaSet: EFA_SET.has(22), questions: [
    q("a", "지난 일주일 동안, 팔이나 다리가 얼마나 자주 부었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 팔이나 다리가 붓는 증상이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("c", "지난 일주일 동안, 팔이나 다리가 붓는 증상이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 23, termEn: "Heart palpitations", termKo: "심장이 두근거리고 빨리 뜀(심계항진)", category: "심혈관계", inEfaSet: EFA_SET.has(23), questions: [
    q("a", "지난 일주일 동안, 심계항진이 얼마나 자주 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 심계항진이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},

  // ── 피부, 모발 및 손발톱 ──────────────────────────────────────
  { id: 24, termEn: "Rash", termKo: "피부 발진(붉은 두드러기나 염증)", category: "피부, 모발 및 손발톱", inEfaSet: EFA_SET.has(24), questions: [
    q("a", "지난 일주일 동안, 피부 발진이 있었습니까?", "yn2", "none"),
  ]},
  { id: 25, termEn: "Skin dryness", termKo: "피부 건조", category: "피부, 모발 및 손발톱", inEfaSet: EFA_SET.has(25), questions: [
    q("a", "지난 일주일 동안, 피부 건조가 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 26, termEn: "Acne", termKo: "얼굴 혹은 가슴의 여드름이나 뾰루지", category: "피부, 모발 및 손발톱", inEfaSet: EFA_SET.has(26), questions: [
    q("a", "지난 일주일 동안, 얼굴 혹은 가슴 부위에 여드름이나 뾰루지가 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 27, termEn: "Hair loss", termKo: "탈모", category: "피부, 모발 및 손발톱", inEfaSet: EFA_SET.has(27), questions: [
    q("a", "지난 일주일 동안, 탈모 증상이 있었습니까?", "int5", "amount"),
  ]},
  { id: 28, termEn: "Itching", termKo: "피부 가려움", category: "피부, 모발 및 손발톱", inEfaSet: EFA_SET.has(28), questions: [
    q("a", "지난 일주일 동안, 피부 가려움이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 29, termEn: "Hives", termKo: "두드러기(피부가 가렵고 붉게 올라옴)", category: "피부, 모발 및 손발톱", inEfaSet: EFA_SET.has(29), questions: [
    q("a", "지난 일주일 동안, 두드러기가 있었습니까?", "yn2", "none"),
  ]},
  { id: 30, termEn: "Hand-foot syndrome", termKo: "손이나 발에 발진이 생겨 갈라지거나 벗겨짐, 빨개지고 통증이 있음(수족증후군)", category: "피부, 모발 및 손발톱", inEfaSet: EFA_SET.has(30), questions: [
    q("a", "지난 일주일 동안, 수족증후군이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 31, termEn: "Nail loss", termKo: "손톱이나 발톱이 빠짐", category: "피부, 모발 및 손발톱", inEfaSet: EFA_SET.has(31), questions: [
    q("a", "지난 일주일 동안, 손톱이나 발톱이 빠진 적이 있었습니까?", "yn2", "none"),
  ]},
  { id: 32, termEn: "Nail ridging", termKo: "손톱이나 발톱에 줄이 생기고 울퉁불퉁함", category: "피부, 모발 및 손발톱", inEfaSet: EFA_SET.has(32), questions: [
    q("a", "지난 일주일 동안, 손톱이나 발톱에 줄이 생기거나 울퉁불퉁해졌습니까?", "yn2", "none"),
  ]},
  { id: 33, termEn: "Nail discoloration", termKo: "손톱이나 발톱의 색깔 변화", category: "피부, 모발 및 손발톱", inEfaSet: EFA_SET.has(33), questions: [
    q("a", "지난 일주일 동안, 손톱이나 발톱의 색깔이 변했습니까?", "yn2", "none"),
  ]},
  { id: 34, termEn: "Sensitivity to sunlight", termKo: "햇빛에 피부가 더 민감해짐", category: "피부, 모발 및 손발톱", inEfaSet: EFA_SET.has(34), questions: [
    q("a", "지난 일주일 동안, 햇빛에 피부가 더 민감해진 적이 있었습니까?", "yn2", "none"),
  ]},
  { id: 35, termEn: "Bed/pressure sores", termKo: "욕창", category: "피부, 모발 및 손발톱", inEfaSet: EFA_SET.has(35), questions: [
    q("a", "지난 일주일 동안, 욕창이 있었습니까?", "yn2", "none"),
  ]},
  { id: 36, termEn: "Radiation skin reaction", termKo: "방사선 치료로 피부가 탐", category: "피부, 모발 및 손발톱", inEfaSet: EFA_SET.has(36), questions: [
    q("a", "지난 일주일 동안, 방사선 치료로 피부가 탄 증상이 가장 심할 때는 어느 정도였습니까?", "sev6", "none"),
  ]},
  { id: 37, termEn: "Skin darkening", termKo: "평소와 달리 피부색이 까매짐", category: "피부, 모발 및 손발톱", inEfaSet: EFA_SET.has(37), questions: [
    q("a", "지난 일주일 동안, 평소와 달리 피부색이 까매졌습니까?", "yn2", "none"),
  ]},
  { id: 38, termEn: "Stretch marks", termKo: "튼 살", category: "피부, 모발 및 손발톱", inEfaSet: EFA_SET.has(38), questions: [
    q("a", "지난 일주일 동안, 살이 튼 적이 있었습니까?", "yn2", "none"),
  ]},

  // ── 신경계 및 감각기계 ────────────────────────────────────────
  { id: 39, termEn: "Numbness & tingling", termKo: "손발이 저리거나 감각이 둔해짐", category: "신경계 및 감각기계", inEfaSet: EFA_SET.has(39), questions: [
    q("a", "지난 일주일 동안, 손발이 저리거나 감각이 둔해지는 증상이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("b", "지난 일주일 동안, 손발이 저리거나 감각이 둔해지는 증상이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 40, termEn: "Dizziness", termKo: "어지러움", category: "신경계 및 감각기계", inEfaSet: EFA_SET.has(40), questions: [
    q("a", "지난 일주일 동안, 어지러움이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("b", "지난 일주일 동안, 어지러움이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 41, termEn: "Blurred vision", termKo: "흐려 보임", category: "신경계 및 감각기계", inEfaSet: EFA_SET.has(41), questions: [
    q("a", "지난 일주일 동안, 흐려 보이는 증상이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("b", "지난 일주일 동안, 흐려 보이는 증상이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 42, termEn: "Flashing lights", termKo: "눈 앞이 번쩍거림", category: "신경계 및 감각기계", inEfaSet: EFA_SET.has(42), questions: [
    q("a", "지난 일주일 동안, 눈 앞이 번쩍거리는 증상이 있었습니까?", "yn2", "none"),
  ]},
  { id: 43, termEn: "Visual floaters", termKo: "눈 앞에 점이나 선(부유물)이 떠다님", category: "신경계 및 감각기계", inEfaSet: EFA_SET.has(43), questions: [
    q("a", "지난 일주일 동안, 눈 앞에 점이나 선(부유물)이 떠다닌 증상이 있었습니까?", "yn2", "none"),
  ]},
  { id: 44, termEn: "Watery eyes", termKo: "눈물 흘림증", category: "신경계 및 감각기계", inEfaSet: EFA_SET.has(44), questions: [
    q("a", "지난 일주일 동안, 눈물 흘림증이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("b", "지난 일주일 동안, 눈물 흘림증이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 45, termEn: "Ringing in ears", termKo: "귀에서 소리가 남(이명)", category: "신경계 및 감각기계", inEfaSet: EFA_SET.has(45), questions: [
    q("a", "지난 일주일 동안, 이명이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 46, termEn: "Concentration", termKo: "집중력의 문제", category: "신경계 및 감각기계", inEfaSet: EFA_SET.has(46), questions: [
    q("a", "지난 일주일 동안, 집중하기 어려움이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("b", "지난 일주일 동안, 집중하기 어려움이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 47, termEn: "Memory", termKo: "기억력 문제", category: "신경계 및 감각기계", inEfaSet: EFA_SET.has(47), questions: [
    q("a", "지난 일주일 동안, 기억력 문제가 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("b", "지난 일주일 동안, 기억력 문제가 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},

  // ── 통증 ─────────────────────────────────────────────────────
  { id: 48, termEn: "General pain", termKo: "통증", category: "통증", inEfaSet: EFA_SET.has(48), questions: [
    q("a", "지난 일주일 동안, 통증이 얼마나 자주 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 통증이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("c", "지난 일주일 동안, 통증이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 49, termEn: "Headache", termKo: "두통", category: "통증", inEfaSet: EFA_SET.has(49), questions: [
    q("a", "지난 일주일 동안, 두통이 얼마나 자주 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 두통이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("c", "지난 일주일 동안, 두통이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 50, termEn: "Muscle pain", termKo: "근육통", category: "통증", inEfaSet: EFA_SET.has(50), questions: [
    q("a", "지난 일주일 동안, 근육통이 얼마나 자주 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 근육통이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("c", "지난 일주일 동안, 근육통이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 51, termEn: "Joint pain", termKo: "관절통(어깨, 무릎, 팔꿈치 등)", category: "통증", inEfaSet: EFA_SET.has(51), questions: [
    q("a", "지난 일주일 동안, 관절통이 얼마나 자주 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 관절통이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("c", "지난 일주일 동안, 관절통이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},

  // ── 수면, 피로 및 정서 ────────────────────────────────────────
  { id: 52, termEn: "Insomnia", termKo: "불면증(잠들기 어려움, 자주 깸, 일찍 깸)", category: "수면, 피로 및 정서", inEfaSet: EFA_SET.has(52), questions: [
    q("a", "지난 일주일 동안, 불면증이 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("b", "지난 일주일 동안, 불면증이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 53, termEn: "Fatigue", termKo: "피로, 피곤함, 또는 기운 없음", category: "수면, 피로 및 정서", inEfaSet: EFA_SET.has(53), questions: [
    q("a", "지난 일주일 동안, 피로·피곤함·기운 없음이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("b", "지난 일주일 동안, 피로·피곤함·기운 없음이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 54, termEn: "Anxious", termKo: "불안감", category: "수면, 피로 및 정서", inEfaSet: EFA_SET.has(54), questions: [
    q("a", "지난 일주일 동안, 불안감을 얼마나 자주 느꼈습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 불안감이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("c", "지난 일주일 동안, 불안감이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 55, termEn: "Discouraged", termKo: "어떠한 것(취미, 종교, 친구, 가족 등)도 나를 기운 나게 해주지 못함", category: "수면, 피로 및 정서", inEfaSet: EFA_SET.has(55), questions: [
    q("a", "지난 일주일 동안, 이러한 느낌이 얼마나 자주 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 이러한 느낌이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("c", "지난 일주일 동안, 이러한 느낌이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 56, termEn: "Sad", termKo: "슬픔이나 우울함", category: "수면, 피로 및 정서", inEfaSet: EFA_SET.has(56), questions: [
    q("a", "지난 일주일 동안, 슬픔이나 우울함을 얼마나 자주 느꼈습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 슬픔이나 우울함이 심할 때는 어느 정도였습니까?", "sev5", "severity"),
    q("c", "지난 일주일 동안, 슬픔이나 우울함이 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},

  // ── 생식기계 ─────────────────────────────────────────────────
  { id: 57, termEn: "Irregular periods/vaginal bleeding", termKo: "불규칙한 생리 주기 (해당 시)", category: "생식기계", inEfaSet: EFA_SET.has(57), questions: [
    q("a", "지난 일주일 동안, 생리 주기가 불규칙한 적이 있었습니까?", "ynna3", "none"),
  ]},
  { id: 58, termEn: "Missed expected menstrual period", termKo: "갑작스럽게 생리가 중단됨 (해당 시)", category: "생식기계", inEfaSet: EFA_SET.has(58), questions: [
    q("a", "지난 일주일 동안, 갑작스럽게 생리가 중단된 적이 있습니까?", "ynna3", "none"),
  ]},
  { id: 59, termEn: "Vaginal discharge", termKo: "평소와 다른 질 분비물", category: "생식기계", inEfaSet: EFA_SET.has(59), questions: [
    q("a", "지난 일주일 동안, 평소와 다른 질 분비물이 있었습니까?", "int5", "amount"),
  ]},
  { id: 60, termEn: "Vaginal dryness", termKo: "질 건조", category: "생식기계", inEfaSet: EFA_SET.has(60), questions: [
    q("a", "지난 일주일 동안, 질 건조가 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},

  // ── 비뇨기계 ─────────────────────────────────────────────────
  { id: 61, termEn: "Painful urination", termKo: "소변 볼 때 아프고 화끈거림", category: "비뇨기계", inEfaSet: EFA_SET.has(61), questions: [
    q("a", "지난 일주일 동안, 소변 볼 때 아프고 화끈거림이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 62, termEn: "Urinary urgency", termKo: "소변이 갑자기 마려움", category: "비뇨기계", inEfaSet: EFA_SET.has(62), questions: [
    q("a", "지난 일주일 동안, 소변이 갑자기 마려웠던 적이 얼마나 자주 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 소변이 갑자기 마려워서 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 63, termEn: "Urinary frequency", termKo: "빈뇨(소변을 자주 봄)", category: "비뇨기계", inEfaSet: EFA_SET.has(63), questions: [
    q("a", "지난 일주일 동안, 빈뇨가 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 빈뇨로 인해 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},
  { id: 64, termEn: "Change in usual urine color", termKo: "소변 색의 변화", category: "비뇨기계", inEfaSet: EFA_SET.has(64), questions: [
    q("a", "지난 일주일 동안, 소변 색이 변했습니까?", "yn2", "none"),
  ]},
  { id: 65, termEn: "Urinary incontinence", termKo: "요실금(소변 조절 장애)", category: "비뇨기계", inEfaSet: EFA_SET.has(65), questions: [
    q("a", "지난 일주일 동안, 요실금이 얼마나 자주 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 요실금으로 인해 일상생활에 얼마나 지장을 주었습니까?", "int5", "interference"),
  ]},

  // ── 성기능 ───────────────────────────────────────────────────
  { id: 66, termEn: "Achieve and maintain erection", termKo: "발기 부전(발기가 어렵거나 발기 상태를 유지하기 어려움)", category: "성기능", inEfaSet: EFA_SET.has(66), questions: [
    q("a", "지난 일주일 동안, 발기 부전 증상이 가장 심할 때는 어느 정도였습니까?", "sev7", "none"),
  ]},
  { id: 67, termEn: "Ejaculation", termKo: "(성관계 시) 사정의 어려움", category: "성기능", inEfaSet: EFA_SET.has(67), questions: [
    q("a", "지난 일주일 동안, 성관계 시 사정에 어려움이 있었던 적이 얼마나 자주 있었습니까?", "freq7", "none"),
  ]},
  { id: 68, termEn: "Decreased libido", termKo: "성욕 감소", category: "성기능", inEfaSet: EFA_SET.has(68), questions: [
    q("a", "지난 일주일 동안, 성욕 감소가 가장 심할 때는 어느 정도였습니까?", "sev7", "none"),
  ]},
  { id: 69, termEn: "Delayed orgasm", termKo: "오르가즘이나 절정에 도달할 때까지 너무 오래 걸림", category: "성기능", inEfaSet: EFA_SET.has(69), questions: [
    q("a", "지난 일주일 동안, 오르가즘이나 절정에 도달할 때까지 너무 오래 걸린다고 느꼈습니까?", "ynsex4", "none"),
  ]},
  { id: 70, termEn: "Unable to have orgasm", termKo: "오르가즘이나 절정을 못 느낌", category: "성기능", inEfaSet: EFA_SET.has(70), questions: [
    q("a", "지난 일주일 동안, 오르가즘이나 절정을 느낄 수 없었습니까?", "ynsex4", "none"),
  ]},
  { id: 71, termEn: "Pain w/sexual intercourse", termKo: "질 성교 시 통증", category: "성기능", inEfaSet: EFA_SET.has(71), questions: [
    q("a", "지난 일주일 동안, 질 성교 시 통증이 가장 심할 때는 어느 정도였습니까?", "sev7", "none"),
  ]},

  // ── 기타 전신 증상 ────────────────────────────────────────────
  { id: 72, termEn: "Breast swelling and tenderness", termKo: "유방이 부풀어 오르거나 눌렀을 때 통증이 있음", category: "기타 전신 증상", inEfaSet: EFA_SET.has(72), questions: [
    q("a", "지난 일주일 동안, 유방이 부풀어 오르거나 눌렀을 때 통증이 있는 경우가 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 73, termEn: "Bruising", termKo: "쉽게 멍이 듦(검거나 푸른 자국)", category: "기타 전신 증상", inEfaSet: EFA_SET.has(73), questions: [
    q("a", "지난 일주일 동안, 멍이 쉽게 들었습니까?", "yn2", "none"),
  ]},
  { id: 74, termEn: "Chills", termKo: "몸이 춥고 떨림(오한)", category: "기타 전신 증상", inEfaSet: EFA_SET.has(74), questions: [
    q("a", "지난 일주일 동안, 오한이 얼마나 자주 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 오한이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 75, termEn: "Increased sweating", termKo: "예상치 못하게, 과도하게 밤낮 관계없이 땀이 남(폐경기 열감과 상관없음)", category: "기타 전신 증상", inEfaSet: EFA_SET.has(75), questions: [
    q("a", "지난 일주일 동안, 이 증상이 얼마나 자주 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 이 증상이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 76, termEn: "Decreased sweating", termKo: "예상치 못하게 땀이 덜 나는 것", category: "기타 전신 증상", inEfaSet: EFA_SET.has(76), questions: [
    q("a", "지난 일주일 동안, 이런 경험이 있었습니까?", "yn2", "none"),
  ]},
  { id: 77, termEn: "Hot flashes", termKo: "얼굴 화끈거림", category: "기타 전신 증상", inEfaSet: EFA_SET.has(77), questions: [
    q("a", "지난 일주일 동안, 얼굴 화끈거림이 얼마나 자주 있었습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 얼굴 화끈거림이 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 78, termEn: "Nosebleed", termKo: "코피", category: "기타 전신 증상", inEfaSet: EFA_SET.has(78), questions: [
    q("a", "지난 일주일 동안, 코피가 얼마나 자주 났습니까?", "freq5", "frequency"),
    q("b", "지난 일주일 동안, 코피가 가장 심할 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
  { id: 79, termEn: "Pain and swelling at injection site", termKo: "항암 주사를 맞은 부위의 통증, 부기, 빨개짐", category: "기타 전신 증상", inEfaSet: EFA_SET.has(79), questions: [
    q("a", "지난 일주일 동안, 이런 증상이 있었습니까?", "ynna3", "none"),
  ]},
  { id: 80, termEn: "Body odor", termKo: "몸 냄새", category: "기타 전신 증상", inEfaSet: EFA_SET.has(80), questions: [
    q("a", "지난 일주일 동안, 몸 냄새가 가장 심하게 날 때는 어느 정도였습니까?", "sev5", "severity"),
  ]},
];

export const CATEGORIES = [...new Set(SURVEY_ITEMS.map((item) => item.category))];

export function getTotalQuestionCount(): number {
  return SURVEY_ITEMS.reduce((sum, item) => sum + item.questions.length, 0);
}

export function getItemsByCategory(category: string): SurveyItem[] {
  return SURVEY_ITEMS.filter((item) => item.category === category);
}
