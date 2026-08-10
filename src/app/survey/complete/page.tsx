"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CompleteContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const already = searchParams.get("already");

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div className="text-center space-y-3 max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          {already ? "이미 제출이 완료되었습니다" : "설문이 완료되었습니다"}
        </h1>
        <p className="text-gray-600 leading-relaxed">
          {already
            ? "이 참여자 코드로는 이미 설문이 제출되었습니다. 추가로 응답하실 내용이 있다면 연구담당자에게 문의해 주세요."
            : "소중한 시간을 내어 설문에 참여해 주셔서 감사합니다. 귀하의 응답은 조혈모세포이식 생존자의 증상 관리 개선에 큰 도움이 됩니다."}
        </p>
        {code && (
          <p className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
            참여자 코드: {code}
          </p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-sm w-full text-sm text-blue-800">
        <p className="font-medium mb-1">안내</p>
        <p>
          이 설문은 연구 목적의 증상 조사이며, 응급 상황이 발생한 경우에는 즉시 의료진에게 연락하거나 119에
          신고해 주십시오.
        </p>
      </div>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">로딩 중...</div>}>
      <CompleteContent />
    </Suspense>
  );
}
