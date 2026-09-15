"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateParticipant } from "@/lib/actions";

const STEP_PATH: Record<string, string> = {
  basic: "/survey/basic",
  behavior: "/survey/behavior",
  outcome: "/survey/outcome",
  proctcae: "/survey/proctcae",
  complete: "/survey/complete",
};

export default function StartPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setChecking(true);
    setError("");
    try {
      const result = await getOrCreateParticipant(code.trim());
      if (!result.ok) {
        setError(result.error);
        setChecking(false);
        return;
      }
      if (result.state.is_complete) {
        router.push(`/survey/complete?code=${encodeURIComponent(result.state.participant_id)}&already=1`);
        return;
      }
      const path = STEP_PATH[result.state.current_step] ?? "/survey/basic";
      router.push(`${path}?code=${encodeURIComponent(result.state.participant_id)}`);
    } catch (err) {
      console.error(err);
      setError("확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setChecking(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4">
      <div className="card space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
            동종조혈모세포이식 생존자의 경과기간에 따른 환자보고 증상클러스터 분석
          </p>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">
          본 설문은 동종조혈모세포이식을 받으신 후 경과 시기에 따라 환자분이 직접 경험하시는 증상을 파악하기 위한
          연구입니다. 담당 의료진에게 연구 설명을 듣고 <span className="font-semibold">서면 동의서에 서명하신 분만</span>{" "}
          참여하실 수 있습니다.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-bold text-amber-800">📌 꼭 확인해 주세요</p>
          <ul className="space-y-1.5 text-sm text-gray-700 list-disc list-inside leading-relaxed">
            <li>참여는 전적으로 자발적이며, 언제든지 중단하실 수 있습니다. 중단하시더라도 진료에 어떠한 불이익도 없습니다.</li>
            <li>입력하신 정보는 성명 없이 연구식별코드로만 관리되며, 연구 목적 외에는 사용되지 않습니다.</li>
            <li>지난 <span className="font-semibold">7일간</span> 경험하신 내용을 기준으로 응답해 주세요.</li>
            <li>설문은 1회만 응답하시면 되며, 소요시간은 약 20~30분입니다.</li>
          </ul>
        </div>

        <p className="text-sm text-gray-500">
          아래에 연구담당자로부터 안내받은 <span className="font-semibold text-gray-700">참여자 코드</span>를 입력해
          주세요. 응답 도중 창을 닫으셔도 같은 코드로 다시 접속하시면 이어서 작성하실 수 있습니다.
        </p>

        <p className="text-xs text-gray-400">
          *본 연구는 서울아산병원 간호부의 승인을 받았습니다
        </p>
      </div>

      <form onSubmit={handleStart} className="card space-y-4">
        <div className="space-y-2">
          <label className="field-label" htmlFor="code">
            참여자 코드
          </label>
          <input
            id="code"
            type="text"
            required
            autoComplete="off"
            autoCapitalize="off"
            className="field-input"
            placeholder="예: HSCT-001"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 leading-relaxed">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!code.trim() || checking}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors duration-150"
        >
          {checking ? "확인 중..." : "설문 시작하기 →"}
        </button>
      </form>
    </div>
  );
}
