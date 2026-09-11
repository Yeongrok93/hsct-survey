"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FieldWrap, RadioPills, NumberField } from "@/components/FormControls";
import { saveHealthBehavior } from "@/lib/actions";
import type { HealthBehavior } from "@/lib/types";

const EMPTY: HealthBehavior = {
  smoke_past: null, smoke_current: null, alcohol_days: null, vigorous_days: null, moderate_days: null,
  walk_days: null, sedentary_hours: null, sedentary_minutes: null, supplement_yn: null, checkup_yn: null,
};

const YN = [{ value: 0, label: "아니오" }, { value: 1, label: "예" }];
const DAY_OPTIONS = Array.from({ length: 8 }, (_, i) => ({ value: i, label: `${i}일` }));

function BehaviorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const [data, setData] = useState<HealthBehavior>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  function set<K extends keyof HealthBehavior>(key: K, value: HealthBehavior[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  const required: (keyof HealthBehavior)[] = [
    "smoke_past", "smoke_current", "alcohol_days", "vigorous_days", "moderate_days", "walk_days",
    "sedentary_hours", "supplement_yn", "checkup_yn",
  ];
  const missing = required.filter((k) => data[k] === null);

  async function handleNext() {
    if (missing.length > 0) {
      setShowErrors(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      await saveHealthBehavior(code, data);
      router.push(`/survey/outcome?code=${encodeURIComponent(code)}`);
    } catch (err) {
      console.error(err);
      alert("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setSubmitting(false);
    }
  }

  if (!code) {
    return <p className="text-center text-gray-400 py-20">잘못된 접근입니다.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="card">
        <p className="text-sm text-gray-500">2 / 4 단계</p>
        <h1 className="text-lg font-bold text-gray-900">Ⅱ. 건강 행태</h1>
      </div>

      {showErrors && missing.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          응답하지 않은 항목이 {missing.length}개 있습니다.
        </div>
      )}

      <div className="card space-y-5">
        <FieldWrap label="과거에 담배를 피운 적이 있습니까?">
          <RadioPills name="smoke_past" value={data.smoke_past} onChange={(v) => set("smoke_past", v)} options={YN} />
        </FieldWrap>
        <FieldWrap label="현재 담배를 피우십니까?">
          <RadioPills name="smoke_current" value={data.smoke_current} onChange={(v) => set("smoke_current", v)} options={YN} />
        </FieldWrap>
        <FieldWrap label="최근 1주일에 술을 얼마나 자주 마십니까?">
          <RadioPills name="alcohol" value={data.alcohol_days} onChange={(v) => set("alcohol_days", v)} options={DAY_OPTIONS} />
        </FieldWrap>
        <FieldWrap label="지난 7일 동안 격렬한 신체활동을 한 날은 며칠입니까?">
          <RadioPills name="vigorous" value={data.vigorous_days} onChange={(v) => set("vigorous_days", v)} options={DAY_OPTIONS} />
        </FieldWrap>
        <FieldWrap label="지난 7일 동안 중등도 신체활동을 한 날은 며칠입니까?">
          <RadioPills name="moderate" value={data.moderate_days} onChange={(v) => set("moderate_days", v)} options={DAY_OPTIONS} />
        </FieldWrap>
        <FieldWrap label="지난 7일 동안 걷기를 한 날은 며칠입니까?">
          <RadioPills name="walk" value={data.walk_days} onChange={(v) => set("walk_days", v)} options={DAY_OPTIONS} />
        </FieldWrap>
        <FieldWrap label="지난 7일 동안 앉아서 보낸 시간은 하루 평균 얼마입니까?">
          <div className="flex gap-3">
            <NumberField
              value={data.sedentary_hours}
              onChange={(v) => {
                set("sedentary_hours", v);
                if (v !== null && data.sedentary_minutes === null) set("sedentary_minutes", 0);
              }}
              placeholder="시간"
              suffix="시간"
            />
            <NumberField value={data.sedentary_minutes} onChange={(v) => set("sedentary_minutes", v)} placeholder="분 (선택, 기본 0)" min={0} max={59} suffix="분" />
          </div>
        </FieldWrap>
        <FieldWrap label="병원에서 처방받은 약물 이외에 복용 중인 건강보조식품이 있습니까?">
          <RadioPills name="supplement" value={data.supplement_yn} onChange={(v) => set("supplement_yn", v)} options={YN} />
        </FieldWrap>
        <FieldWrap label="조혈모세포이식 후 건강검진을 정기적으로 받고 있습니까?">
          <RadioPills name="checkup" value={data.checkup_yn} onChange={(v) => set("checkup_yn", v)} options={YN} />
        </FieldWrap>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/survey/basic?code=${encodeURIComponent(code)}`)}
          className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          ← 이전
        </button>
        <button
          onClick={handleNext}
          disabled={submitting}
          className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
        >
          {submitting ? "저장 중..." : "다음: 건강 결과 →"}
        </button>
      </div>
    </div>
  );
}

export default function BehaviorPage() {
  return (
    <Suspense fallback={<p className="text-center text-gray-400 py-20">불러오는 중...</p>}>
      <BehaviorContent />
    </Suspense>
  );
}
