"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SURVEY_ITEMS,
  CATEGORIES,
  getItemsByCategory,
  getTotalQuestionCount,
  SurveyItem,
  OptionSetKey,
} from "@/lib/questions";
import QuestionItem from "@/components/QuestionItem";
import ProgressBar from "@/components/ProgressBar";
import { getSymptomAnswers, saveSymptomAnswers, saveOtherSymptoms, completeSurvey, type SymptomAnswerRow } from "@/lib/actions";

type AnswerMap = Record<string, number | undefined>;

function buildAnswerKey(itemId: number, qKey: string) {
  return `${itemId}-${qKey}`;
}

// index of the "no symptom" anchor option within each option set (used by the
// "모두 증상 없음" shortcut). For yn2/ynna3/ynsex4 that anchor is "아니요".
const NO_SYMPTOM_INDEX: Record<OptionSetKey, number> = {
  freq5: 0, sev5: 0, int5: 0,
  yn2: 1, sev6: 0, sev7: 0, freq7: 0, ynsex4: 1, ynna3: 1,
};

function isUnanswered(val: unknown) {
  return val === undefined || val === null;
}

function SurveyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code") ?? "";

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [loaded, setLoaded] = useState(false);
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorItemIds, setErrorItemIds] = useState<Set<number>>(new Set());
  const [hasOtherSx, setHasOtherSx] = useState<boolean | null>(null);
  const [otherEntries, setOtherEntries] = useState(
    Array.from({ length: 5 }, (_, i) => ({ slot: i + 1, name: "", severity: null as number | null }))
  );
  const firstErrorRef = useRef<HTMLDivElement>(null);

  const totalQuestions = getTotalQuestionCount();
  const answeredCount = Object.values(answers).filter((v) => !isUnanswered(v)).length;

  const currentCategory = CATEGORIES[categoryIdx];
  const currentItems = getItemsByCategory(currentCategory);
  const isLast = categoryIdx === CATEGORIES.length - 1;

  useEffect(() => {
    if (!code) {
      router.replace("/");
      return;
    }
    (async () => {
      const existing = await getSymptomAnswers(code);
      const map: AnswerMap = {};
      Object.entries(existing).forEach(([k, v]) => (map[k] = v));
      setAnswers(map);
      setLoaded(true);
    })();
  }, [code, router]);

  useEffect(() => {
    setErrorItemIds(new Set());
  }, [categoryIdx]);

  useEffect(() => {
    if (errorItemIds.size > 0 && firstErrorRef.current) {
      firstErrorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [errorItemIds]);

  function handleAnswer(itemId: number, qKey: string, value: number) {
    const key = buildAnswerKey(itemId, qKey);
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setErrorItemIds((prev) => {
      const item = SURVEY_ITEMS.find((i) => i.id === itemId);
      if (!item) return prev;
      const allAnswered = item.questions.every((qq) => {
        const k = buildAnswerKey(item.id, qq.key);
        return k === key ? true : !isUnanswered(answers[k]);
      });
      if (allAnswered) {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      }
      return prev;
    });
  }

  const isAllNone = currentItems.every((item) =>
    item.questions.every((qq) => answers[buildAnswerKey(item.id, qq.key)] === NO_SYMPTOM_INDEX[qq.optionSet])
  );

  function handleAllNone(checked: boolean) {
    setAnswers((prev) => {
      const next = { ...prev };
      currentItems.forEach((item) => {
        item.questions.forEach((qq) => {
          const key = buildAnswerKey(item.id, qq.key);
          if (checked) next[key] = NO_SYMPTOM_INDEX[qq.optionSet];
          else delete next[key];
        });
      });
      return next;
    });
    if (checked) setErrorItemIds(new Set());
  }

  function getUnansweredItems(items: SurveyItem[]) {
    return items.filter((item) => item.questions.some((qq) => isUnanswered(answers[buildAnswerKey(item.id, qq.key)])));
  }

  const saveCurrentCategory = useCallback(async () => {
    if (!code) return;
    setSaving(true);
    try {
      const rows: SymptomAnswerRow[] = [];
      currentItems.forEach((item) => {
        item.questions.forEach((qq) => {
          const val = answers[buildAnswerKey(item.id, qq.key)];
          if (!isUnanswered(val)) {
            rows.push({ itemId: item.id, questionKey: qq.key, optionSet: qq.optionSet, answerIndex: val as number });
          }
        });
      });
      if (rows.length > 0) await saveSymptomAnswers(code, rows);
    } finally {
      setSaving(false);
    }
  }, [code, currentItems, answers]);

  async function handleNext() {
    const unanswered = getUnansweredItems(currentItems);
    if (unanswered.length > 0) {
      setErrorItemIds(new Set(unanswered.map((i) => i.id)));
      return;
    }
    setErrorItemIds(new Set());
    await saveCurrentCategory();
    setCategoryIdx((i) => i + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handlePrev() {
    await saveCurrentCategory();
    setCategoryIdx((i) => i - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!code) return;
    const unanswered = getUnansweredItems(currentItems);
    if (unanswered.length > 0) {
      setErrorItemIds(new Set(unanswered.map((i) => i.id)));
      return;
    }
    if (hasOtherSx === null) {
      alert("그 외 증상 유무를 선택해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await saveCurrentCategory();
      await saveOtherSymptoms(code, hasOtherSx, otherEntries);
      await completeSurvey(code);
      router.push(`/survey/complete?code=${encodeURIComponent(code)}`);
    } catch (err) {
      console.error(err);
      alert("제출 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setSubmitting(false);
    }
  }

  const unansweredCount = getUnansweredItems(currentItems).length;
  let firstErrorSet = false;

  if (!code) return null;
  if (!loaded) {
    return <p className="text-center text-gray-400 py-20">불러오는 중...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <p className="text-sm text-gray-500">4 / 4 단계 · Ⅳ. 지난 7일간의 증상 (PRO-CTCAE)</p>
        <ProgressBar current={answeredCount} total={totalQuestions} />
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{categoryIdx + 1} / {CATEGORIES.length} 영역</span>
          <span className="font-semibold text-gray-700">{currentCategory}</span>
          {saving && <span className="text-xs text-primary-500 animate-pulse">저장 중…</span>}
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((cat, i) => {
            const items = getItemsByCategory(cat);
            const done = items.every((item) => item.questions.every((qq) => !isUnanswered(answers[buildAnswerKey(item.id, qq.key)])));
            return (
              <span
                key={cat}
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  i === categoryIdx ? "bg-primary-600 text-white" : done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {cat}
              </span>
            );
          })}
        </div>
      </div>

      <div className="card flex items-center justify-between">
        <span className="text-sm text-gray-600">이 영역의 증상이 모두 없으셨나요?</span>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-sm font-medium text-gray-700">모두 증상 없음</span>
          <div
            onClick={() => handleAllNone(!isAllNone)}
            className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${isAllNone ? "bg-primary-600" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isAllNone ? "translate-x-5" : "translate-x-0"}`} />
          </div>
        </label>
      </div>

      {errorItemIds.size > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-amber-800">
          <span>아래 <strong>{errorItemIds.size}개 항목</strong>에 응답하지 않으셨습니다. 빨간 테두리 항목을 확인해 주세요.</span>
        </div>
      )}

      <div className="space-y-4">
        {currentItems.map((item) => {
          const hasError = errorItemIds.has(item.id);
          const isFirstError = hasError && !firstErrorSet;
          if (isFirstError) firstErrorSet = true;
          return (
            <div
              key={item.id}
              ref={isFirstError ? firstErrorRef : undefined}
              className={`bg-white rounded-2xl shadow-sm border-2 p-5 space-y-5 transition-colors ${hasError ? "border-red-400" : "border-transparent"}`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center flex-shrink-0 ${hasError ? "bg-red-100 text-red-600" : "bg-primary-100 text-primary-700"}`}>
                  {item.id}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{item.termKo}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.termEn}</p>
                </div>
                {hasError && <span className="ml-auto text-xs text-red-500 font-medium whitespace-nowrap">응답 필요</span>}
              </div>
              <div className="space-y-6 pl-10">
                {item.questions.map((qq) => {
                  const key = buildAnswerKey(item.id, qq.key);
                  return (
                    <QuestionItem key={key} itemId={item.id} question={qq} value={answers[key] ?? null} onChange={(val) => handleAnswer(item.id, qq.key, val)} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {isLast && (
        <div className="card space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">그 외 증상</p>
            <p className="text-xs text-gray-400 mt-1">지난 일주일 동안, 위의 문항 외에 의료진에게 알리고 싶은 증상이 있습니까?</p>
          </div>
          <div className="flex gap-2">
            {[{ v: true, l: "네" }, { v: false, l: "아니요" }].map((opt) => (
              <button
                key={String(opt.v)}
                type="button"
                onClick={() => setHasOtherSx(opt.v)}
                className={`choice-pill ${hasOtherSx === opt.v ? "choice-pill-active" : "choice-pill-inactive"}`}
              >
                {opt.l}
              </button>
            ))}
          </div>
          {hasOtherSx && (
            <div className="space-y-3 pt-2">
              {otherEntries.map((entry, idx) => (
                <div key={entry.slot} className="border border-gray-200 rounded-xl p-3 space-y-2">
                  <input
                    type="text"
                    className="field-input"
                    placeholder={`증상 ${idx + 1} 이름 (선택 시에만 작성)`}
                    value={entry.name}
                    onChange={(e) => {
                      const v = e.target.value;
                      setOtherEntries((prev) => prev.map((it, i) => (i === idx ? { ...it, name: v } : it)));
                    }}
                  />
                  {entry.name.trim() && (
                    <div className="flex flex-wrap gap-2">
                      {["전혀 없다", "약간 있다", "보통이다", "심하다", "매우 심하다"].map((label, oi) => (
                        <button
                          key={oi}
                          type="button"
                          onClick={() => setOtherEntries((prev) => prev.map((it, i) => (i === idx ? { ...it, severity: oi } : it)))}
                          className={`choice-pill text-xs ${entry.severity === oi ? "choice-pill-active" : "choice-pill-inactive"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {categoryIdx > 0 ? (
          <button onClick={handlePrev} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            ← 이전
          </button>
        ) : (
          <button
            onClick={() => router.push(`/survey/outcome?code=${encodeURIComponent(code)}`)}
            className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            ← 이전
          </button>
        )}
        {!isLast ? (
          <button
            onClick={handleNext}
            className={`flex-1 py-3 text-white font-semibold rounded-xl transition-colors ${unansweredCount > 0 ? "bg-amber-500 hover:bg-amber-600" : "bg-primary-600 hover:bg-primary-700"}`}
          >
            {unansweredCount > 0 ? `미응답 ${unansweredCount}개 확인 →` : "다음 →"}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex-1 py-3 text-white font-semibold rounded-xl transition-colors ${unansweredCount > 0 ? "bg-amber-500 hover:bg-amber-600" : "bg-green-600 hover:bg-green-700"} disabled:bg-gray-200 disabled:text-gray-400`}
          >
            {submitting ? "제출 중..." : unansweredCount > 0 ? `미응답 ${unansweredCount}개 확인 →` : "설문 완료 및 제출 ✓"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProCtcaePage() {
  return (
    <Suspense fallback={<p className="text-center text-gray-400 py-20">설문을 불러오는 중...</p>}>
      <SurveyContent />
    </Suspense>
  );
}
