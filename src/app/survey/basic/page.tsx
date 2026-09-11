"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FieldWrap, RadioPills, CheckboxRow, NumberField, TextField } from "@/components/FormControls";
import { saveBasicInfo } from "@/lib/actions";
import type { BasicInfo } from "@/lib/types";

const EMPTY: BasicInfo = {
  age_current: null, age_transplant: null, sex: null, marital_status: null, cohabitation: null,
  cohabitation_other: "", religion: null, education: null, cost_burden: null, occupation: null,
  diagnosis: null, diagnosis_other: "", diagnosis_year: null, diagnosis_month: null,
  transplant_date: "", transplant_number: null, donor_type: null, graft_type: null, dli_yn: null,
  relapse: null, target_therapy: null,
  agvhd_ever: null, agvhd_ever_skin: false, agvhd_ever_liver: false, agvhd_ever_gut: false,
  agvhd_current: null, agvhd_current_skin: false, agvhd_current_liver: false, agvhd_current_gut: false,
  cgvhd_ever: null, cgvhd_ever_oral: false, cgvhd_ever_skin: false, cgvhd_ever_eye: false, cgvhd_ever_gi: false,
  cgvhd_ever_liver: false, cgvhd_ever_lung: false, cgvhd_ever_musculoskeletal: false, cgvhd_ever_gu: false, cgvhd_ever_other: false,
  cgvhd_current: null, cgvhd_current_oral: false, cgvhd_current_skin: false, cgvhd_current_eye: false, cgvhd_current_gi: false,
  cgvhd_current_liver: false, cgvhd_current_lung: false, cgvhd_current_musculoskeletal: false, cgvhd_current_gu: false, cgvhd_current_other: false,
};

const AGVHD_SITES = [
  { key: "skin", label: "피부" }, { key: "liver", label: "간" }, { key: "gut", label: "장" },
];
const CGVHD_SITES = [
  { key: "oral", label: "구강" }, { key: "skin", label: "피부" }, { key: "eye", label: "눈" },
  { key: "gi", label: "소화기(위장관)" }, { key: "liver", label: "간" }, { key: "lung", label: "폐" },
  { key: "musculoskeletal", label: "근육/관절" }, { key: "gu", label: "비뇨생식기" }, { key: "other", label: "기타" },
];

function BasicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const [data, setData] = useState<BasicInfo>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  function set<K extends keyof BasicInfo>(key: K, value: BasicInfo[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }
  function toggleSite(prefix: "agvhd_ever" | "agvhd_current" | "cgvhd_ever" | "cgvhd_current", key: string) {
    const field = `${prefix}_${key}` as keyof BasicInfo;
    setData((prev) => ({ ...prev, [field]: !prev[field] }));
  }
  function siteValues(prefix: "agvhd_ever" | "agvhd_current" | "cgvhd_ever" | "cgvhd_current", keys: string[]) {
    const out: Record<string, boolean> = {};
    keys.forEach((k) => (out[k] = !!(data as unknown as Record<string, boolean>)[`${prefix}_${k}`]));
    return out;
  }

  const required: (keyof BasicInfo)[] = [
    "age_current", "age_transplant", "sex", "marital_status", "cohabitation", "religion", "education",
    "cost_burden", "occupation", "diagnosis", "diagnosis_year", "diagnosis_month", "transplant_date",
    "transplant_number", "donor_type", "graft_type", "dli_yn", "relapse", "target_therapy", "agvhd_ever", "cgvhd_ever",
  ];
  const missing = required.filter((k) => data[k] === null || data[k] === "");

  async function handleNext() {
    if (missing.length > 0) {
      setShowErrors(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      await saveBasicInfo(code, data);
      router.push(`/survey/behavior?code=${encodeURIComponent(code)}`);
    } catch (err) {
      console.error(err);
      alert("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setSubmitting(false);
    }
  }

  if (!code) {
    return <p className="text-center text-gray-400 py-20">잘못된 접근입니다. 처음 화면으로 돌아가 참여자 코드를 입력해 주세요.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="card">
        <p className="text-sm text-gray-500">1 / 4 단계</p>
        <h1 className="text-lg font-bold text-gray-900">Ⅰ. 기본 정보</h1>
        <p className="text-sm text-gray-500 mt-1">다음 항목을 읽고 해당되는 곳을 선택해 주세요.</p>
      </div>

      {showErrors && missing.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          응답하지 않은 필수 항목이 {missing.length}개 있습니다. 아래에서 빈 항목을 확인해 주세요.
        </div>
      )}

      <div className="card space-y-5">
        <FieldWrap label="나이">
          <div className="flex flex-wrap gap-4">
            <NumberField value={data.age_current} onChange={(v) => set("age_current", v)} placeholder="현재 만 나이" suffix="세 (현재)" />
            <NumberField value={data.age_transplant} onChange={(v) => set("age_transplant", v)} placeholder="이식 당시 만 나이" suffix="세 (이식 당시)" />
          </div>
        </FieldWrap>

        <FieldWrap label="성별">
          <RadioPills name="sex" value={data.sex} onChange={(v) => set("sex", v)} options={[{ value: 1, label: "남자" }, { value: 2, label: "여자" }]} />
        </FieldWrap>

        <FieldWrap label="결혼 형태">
          <RadioPills name="marital" value={data.marital_status} onChange={(v) => set("marital_status", v)} options={[
            { value: 1, label: "미혼" }, { value: 2, label: "기혼" }, { value: 3, label: "이혼/별거" }, { value: 4, label: "사별" },
          ]} />
        </FieldWrap>

        <FieldWrap label="동거 형태">
          <RadioPills name="cohab" value={data.cohabitation} onChange={(v) => set("cohabitation", v)} options={[
            { value: 1, label: "혼자" }, { value: 2, label: "배우자와 함께" }, { value: 3, label: "자녀와 함께" }, { value: 4, label: "기타" },
          ]} />
          {data.cohabitation === 4 && (
            <TextField value={data.cohabitation_other ?? ""} onChange={(v) => set("cohabitation_other", v)} placeholder="기타 내용을 입력해 주세요" />
          )}
        </FieldWrap>

        <FieldWrap label="종교">
          <RadioPills name="religion" value={data.religion} onChange={(v) => set("religion", v)} options={[{ value: 1, label: "있음" }, { value: 2, label: "없음" }]} />
        </FieldWrap>

        <FieldWrap label="최종 학력">
          <RadioPills name="edu" value={data.education} onChange={(v) => set("education", v)} options={[
            { value: 1, label: "무학/초등학교 졸업" }, { value: 2, label: "중고등학교 졸업" }, { value: 3, label: "대학교 졸업" },
            { value: 4, label: "대학원 이상" }, { value: 5, label: "기타" },
          ]} />
        </FieldWrap>

        <FieldWrap label="치료비 부담 정도">
          <RadioPills name="cost" value={data.cost_burden} onChange={(v) => set("cost_burden", v)} options={[
            { value: 1, label: "전혀 부담되지 않음" }, { value: 2, label: "조금 부담됨" }, { value: 3, label: "보통" },
            { value: 4, label: "많이 부담됨" }, { value: 5, label: "매우 많이 부담됨" },
          ]} />
        </FieldWrap>

        <FieldWrap label="직업">
          <RadioPills name="job" value={data.occupation} onChange={(v) => set("occupation", v)} options={[
            { value: 1, label: "현재 직장에 다니고 있다" }, { value: 2, label: "무직이다" },
          ]} />
        </FieldWrap>
      </div>

      <div className="card space-y-5">
        <h2 className="text-sm font-bold text-gray-800">이식 관련 정보</h2>

        <FieldWrap label="이식 당시 진단명">
          <RadioPills name="dx" value={data.diagnosis} onChange={(v) => set("diagnosis", v)} options={[
            { value: 1, label: "급성 골수성 백혈병" }, { value: 2, label: "급성 림프구성 백혈병" }, { value: 3, label: "만성 골수성 백혈병" },
            { value: 4, label: "골수형성이상증후군" }, { value: 5, label: "재생불량성빈혈" }, { value: 6, label: "림프종" },
            { value: 7, label: "다발골수종" }, { value: 8, label: "골수섬유증" }, { value: 9, label: "기타" },
          ]} />
          {data.diagnosis === 9 && (
            <TextField value={data.diagnosis_other ?? ""} onChange={(v) => set("diagnosis_other", v)} placeholder="진단명을 입력해 주세요" />
          )}
        </FieldWrap>

        <FieldWrap label="진단 시기">
          <div className="flex gap-3">
            <NumberField value={data.diagnosis_year} onChange={(v) => set("diagnosis_year", v)} placeholder="년" suffix="년" />
            <NumberField value={data.diagnosis_month} onChange={(v) => set("diagnosis_month", v)} placeholder="월" min={1} max={12} suffix="월" />
          </div>
        </FieldWrap>

        <FieldWrap label="조혈모세포 이식일">
          <input
            type="date"
            className="field-input max-w-xs"
            value={data.transplant_date ?? ""}
            onChange={(e) => set("transplant_date", e.target.value)}
            onClick={(e) => e.currentTarget.showPicker?.()}
            onFocus={(e) => e.currentTarget.showPicker?.()}
          />
        </FieldWrap>

        <FieldWrap label="현재 동종조혈모세포이식은 몇 번째 이식인가요?">
          <RadioPills name="txnum" value={data.transplant_number} onChange={(v) => set("transplant_number", v)} options={[
            { value: 1, label: "첫 번째" }, { value: 2, label: "두 번째" }, { value: 3, label: "세 번째 이상" },
          ]} />
        </FieldWrap>

        <FieldWrap label="이식 공여자 유형 (마지막 이식 기준)">
          <RadioPills name="donor" value={data.donor_type} onChange={(v) => set("donor_type", v)} options={[
            { value: 1, label: "일치 형제 공여자" }, { value: 2, label: "반일치 가족 공여자" },
            { value: 3, label: "일치 타인 공여자" }, { value: 4, label: "1~2개 유전자 불일치 타인 공여자" },
          ]} />
        </FieldWrap>

        <FieldWrap label="이식편의 종류">
          <RadioPills name="graft" value={data.graft_type} onChange={(v) => set("graft_type", v)} options={[
            { value: 1, label: "말초혈액 조혈모세포" }, { value: 2, label: "골수" }, { value: 3, label: "제대혈" },
          ]} />
        </FieldWrap>

        <FieldWrap label="공여자림프구주입술(DLI) 시행 여부">
          <RadioPills name="dli" value={data.dli_yn} onChange={(v) => set("dli_yn", v)} options={[{ value: 1, label: "있다" }, { value: 2, label: "없다" }]} />
        </FieldWrap>

        <FieldWrap label="동종조혈모세포이식 후 재발 경험">
          <RadioPills name="relapse" value={data.relapse} onChange={(v) => set("relapse", v)} options={[
            { value: 1, label: "없다" }, { value: 2, label: "골수 재발" }, { value: 3, label: "골수외 재발" }, { value: 4, label: "분자·유전자검사상 재발" },
          ]} />
        </FieldWrap>

        <FieldWrap label="현재 표적항암제 복용 여부" hint="예: 글리벡, 스프라이셀, 포나티닙, 조스파타 등">
          <RadioPills name="target" value={data.target_therapy} onChange={(v) => set("target_therapy", v)} options={[
            { value: 1, label: "없다" }, { value: 2, label: "현재 복용 중" }, { value: 3, label: "복용했으나 현재 종료" },
          ]} />
        </FieldWrap>
      </div>

      <div className="card space-y-5">
        <h2 className="text-sm font-bold text-gray-800">이식편대숙주질환(GVHD)</h2>

        <FieldWrap label="① 급성 이식편대숙주질환을 경험한 적이 있습니까?">
          <RadioPills name="agvhd_ever" value={data.agvhd_ever} onChange={(v) => set("agvhd_ever", v)} options={[{ value: 1, label: "없다" }, { value: 2, label: "있다" }]} />
        </FieldWrap>
        {data.agvhd_ever === 2 && (
          <FieldWrap label="있었던 부분을 모두 선택해 주세요">
            <CheckboxRow options={AGVHD_SITES} values={siteValues("agvhd_ever", ["skin", "liver", "gut"])} onToggle={(k) => toggleSite("agvhd_ever", k)} />
          </FieldWrap>
        )}
        <FieldWrap label="② 현재도 급성 이식편대숙주질환이 있습니까?">
          <RadioPills name="agvhd_current" value={data.agvhd_current} onChange={(v) => set("agvhd_current", v)} options={[{ value: 1, label: "없다" }, { value: 2, label: "있다" }]} />
        </FieldWrap>
        {data.agvhd_current === 2 && (
          <FieldWrap label="있는 부분을 모두 선택해 주세요">
            <CheckboxRow options={AGVHD_SITES} values={siteValues("agvhd_current", ["skin", "liver", "gut"])} onToggle={(k) => toggleSite("agvhd_current", k)} />
          </FieldWrap>
        )}

        <FieldWrap label="③ 만성 이식편대숙주질환을 경험한 적이 있습니까?">
          <RadioPills name="cgvhd_ever" value={data.cgvhd_ever} onChange={(v) => set("cgvhd_ever", v)} options={[{ value: 1, label: "없다" }, { value: 2, label: "있다" }]} />
        </FieldWrap>
        {data.cgvhd_ever === 2 && (
          <FieldWrap label="있었던 부분을 모두 선택해 주세요">
            <CheckboxRow options={CGVHD_SITES} values={siteValues("cgvhd_ever", CGVHD_SITES.map((s) => s.key))} onToggle={(k) => toggleSite("cgvhd_ever", k)} />
          </FieldWrap>
        )}
        <FieldWrap label="④ 현재도 만성 이식편대숙주질환이 있습니까?">
          <RadioPills name="cgvhd_current" value={data.cgvhd_current} onChange={(v) => set("cgvhd_current", v)} options={[{ value: 1, label: "없다" }, { value: 2, label: "있다" }]} />
        </FieldWrap>
        {data.cgvhd_current === 2 && (
          <FieldWrap label="있는 부분을 모두 선택해 주세요">
            <CheckboxRow options={CGVHD_SITES} values={siteValues("cgvhd_current", CGVHD_SITES.map((s) => s.key))} onToggle={(k) => toggleSite("cgvhd_current", k)} />
          </FieldWrap>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={submitting}
        className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {submitting ? "저장 중..." : "다음: 건강 행태 →"}
      </button>
    </div>
  );
}

export default function BasicPage() {
  return (
    <Suspense fallback={<p className="text-center text-gray-400 py-20">불러오는 중...</p>}>
      <BasicContent />
    </Suspense>
  );
}
