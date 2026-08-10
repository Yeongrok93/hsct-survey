"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FieldWrap, RadioPills, CheckboxRow, NumberField, TextField } from "@/components/FormControls";
import { saveHealthOutcome } from "@/lib/actions";
import type { HealthOutcome } from "@/lib/types";

const EMPTY: HealthOutcome = {
  height_cm: null, weight_kg: null,
  comorbid_none: false, comorbid_dm: false, comorbid_htn: false, comorbid_dyslipidemia: false,
  comorbid_cvd: false, comorbid_cerebrovascular: false, comorbid_thyroid: false, comorbid_osteoporosis: false,
  second_cancer_yn: null, second_cancer_name: "", second_cancer_year: null, second_cancer_month: null,
  other_transplant_yn: null, other_transplant_type: null, other_transplant_year: null, other_transplant_month: null,
};

const COMORBID_OPTIONS = [
  { key: "none", label: "없음" }, { key: "dm", label: "당뇨" }, { key: "htn", label: "고혈압" },
  { key: "dyslipidemia", label: "이상지질혈증(고지혈증)" }, { key: "cvd", label: "심혈관질환" },
  { key: "cerebrovascular", label: "뇌혈관질환" }, { key: "thyroid", label: "갑상선 질환" },
  { key: "osteoporosis", label: "골다공증" },
];

function OutcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const [data, setData] = useState<HealthOutcome>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  function set<K extends keyof HealthOutcome>(key: K, value: HealthOutcome[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }
  function toggleComorbid(key: string) {
    const field = `comorbid_${key}` as keyof HealthOutcome;
    setData((prev) => {
      const next = { ...prev, [field]: !prev[field] } as HealthOutcome;
      if (key === "none" && !prev.comorbid_none) {
        // selecting "없음" clears the others
        COMORBID_OPTIONS.filter((o) => o.key !== "none").forEach((o) => {
          (next as unknown as Record<string, boolean>)[`comorbid_${o.key}`] = false;
        });
      } else if (key !== "none" && !prev[field]) {
        next.comorbid_none = false;
      }
      return next;
    });
  }
  const comorbidValues: Record<string, boolean> = {
    none: data.comorbid_none, dm: data.comorbid_dm, htn: data.comorbid_htn, dyslipidemia: data.comorbid_dyslipidemia,
    cvd: data.comorbid_cvd, cerebrovascular: data.comorbid_cerebrovascular, thyroid: data.comorbid_thyroid,
    osteoporosis: data.comorbid_osteoporosis,
  };

  const required: (keyof HealthOutcome)[] = ["height_cm", "weight_kg", "second_cancer_yn", "other_transplant_yn"];
  const missing = required.filter((k) => data[k] === null);

  async function handleSubmit() {
    if (missing.length > 0) {
      setShowErrors(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      await saveHealthOutcome(code, data);
      router.push(`/survey/proctcae?code=${encodeURIComponent(code)}`);
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
        <p className="text-sm text-gray-500">3 / 4 단계</p>
        <h1 className="text-lg font-bold text-gray-900">Ⅲ. 건강 결과</h1>
      </div>

      {showErrors && missing.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          응답하지 않은 항목이 {missing.length}개 있습니다.
        </div>
      )}

      <div className="card space-y-5">
        <FieldWrap label="현재 키는 얼마입니까?">
          <NumberField value={data.height_cm} onChange={(v) => set("height_cm", v)} placeholder="키" suffix="cm" />
        </FieldWrap>
        <FieldWrap label="현재 체중은 얼마입니까?">
          <NumberField value={data.weight_kg} onChange={(v) => set("weight_kg", v)} placeholder="체중" suffix="kg" />
        </FieldWrap>
        <FieldWrap label="현재 이식받은 혈액질환 이외에 진단받았거나 치료 중인 질환이 있습니까?" hint="복수 선택 가능">
          <CheckboxRow options={COMORBID_OPTIONS} values={comorbidValues} onToggle={toggleComorbid} />
        </FieldWrap>

        <FieldWrap label="다른 암을 진단받은 적이 있습니까?">
          <RadioPills name="second_cancer" value={data.second_cancer_yn} onChange={(v) => set("second_cancer_yn", v)} options={[{ value: 1, label: "없음" }, { value: 2, label: "있음" }]} />
        </FieldWrap>
        {data.second_cancer_yn === 2 && (
          <div className="space-y-3 pl-1">
            <TextField value={data.second_cancer_name ?? ""} onChange={(v) => set("second_cancer_name", v)} placeholder="진단명" />
            <div className="flex gap-3">
              <NumberField value={data.second_cancer_year} onChange={(v) => set("second_cancer_year", v)} placeholder="년" suffix="년" />
              <NumberField value={data.second_cancer_month} onChange={(v) => set("second_cancer_month", v)} placeholder="월" min={1} max={12} suffix="월" />
            </div>
          </div>
        )}

        <FieldWrap label="장기이식을 받은 적이 있습니까?">
          <RadioPills name="other_tx" value={data.other_transplant_yn} onChange={(v) => set("other_transplant_yn", v)} options={[{ value: 1, label: "없음" }, { value: 2, label: "있음" }]} />
        </FieldWrap>
        {data.other_transplant_yn === 2 && (
          <div className="space-y-3 pl-1">
            <FieldWrap label="어떤 장기이식을 받았습니까?">
              <RadioPills name="other_tx_type" value={data.other_transplant_type} onChange={(v) => set("other_transplant_type", v)} options={[
                { value: 1, label: "간이식" }, { value: 2, label: "폐이식" }, { value: 3, label: "신장이식" }, { value: 4, label: "췌장이식" }, { value: 5, label: "각막이식" },
              ]} />
            </FieldWrap>
            <div className="flex gap-3">
              <NumberField value={data.other_transplant_year} onChange={(v) => set("other_transplant_year", v)} placeholder="년" suffix="년" />
              <NumberField value={data.other_transplant_month} onChange={(v) => set("other_transplant_month", v)} placeholder="월" min={1} max={12} suffix="월" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/survey/behavior?code=${encodeURIComponent(code)}`)}
          className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          ← 이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
        >
          {submitting ? "저장 중..." : "다음: 증상 설문 →"}
        </button>
      </div>
    </div>
  );
}

export default function OutcomePage() {
  return (
    <Suspense fallback={<p className="text-center text-gray-400 py-20">불러오는 중...</p>}>
      <OutcomeContent />
    </Suspense>
  );
}
