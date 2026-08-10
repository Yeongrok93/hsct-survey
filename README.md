# HSCT PRO-CTCAE 증상 설문 (동종조혈모세포이식 생존자 증상클러스터 연구)

Next.js 15 + Neon Postgres + Vercel로 구축한 웹 기반 자기기입식 설문 시스템입니다.
연구계획서(§자료수집방법)에 따라, **서면 동의를 마친 참여자**가 연구담당자로부터 받은
**참여자 코드**만으로 접속하여 응답합니다 (이름·생년월일 등 직접식별정보는 수집하지 않습니다).

## 설문 흐름

1. `/` — 참여자 코드 입력 → 참여자 레코드 생성/재개
2. `/survey/basic` — Ⅰ. 기본 정보 (인구학적·임상정보)
3. `/survey/behavior` — Ⅱ. 건강 행태
4. `/survey/outcome` — Ⅲ. 건강 결과
5. `/survey/proctcae` — Ⅳ. PRO-CTCAE 증상 (80문항, 카테고리별 진행)
6. `/survey/complete` — 완료 안내

각 단계 저장 후 `participants.current_step`이 갱신되므로, 응답 중 창을 닫아도 같은 코드로
재접속하면 이어서 진행됩니다 (PRO-CTCAE 페이지는 이미 저장된 응답을 불러와 표시합니다).

## 데이터 모델

`db/schema.sql`의 테이블·컬럼명은 연구 코드북(`증례기록지_CRF_ver1.0.xlsx`의 "코딩북" 시트)과
1:1로 대응합니다.

- `participants` — 참여자 코드, 진행 단계, 완료 여부
- `basic_info` / `health_behavior` / `health_outcome` — Ⅰ~Ⅲ 섹션 (코드북과 동일한 컬럼명)
- `symptom_answers` — PRO-CTCAE 80문항 응답 (문항×하위질문 단위 정규화 테이블)
- `other_symptoms`, `other_symptoms_flag` — 그 외 증상 자유기술

복합등급(0~3점) 산출은 `src/lib/proctcaeGrading.ts`에 Basch 등(2021) Supplemental Table S2를
그대로 옮겨 구현해 두었습니다. 이 앱 자체는 원자료(raw response)만 저장하며, 복합등급 변환과
요인분석은 통계분석 단계(R)에서 `symptom_answers`를 내려받아 수행하는 것을 전제로 합니다
(계획서 §통계방법과 일치).

## 로컬 개발 준비

```bash
npm install
cp .env.local.example .env.local   # DATABASE_URL 채우기
npm run dev
```

## Neon 설정

1. https://neon.tech 에서 새 프로젝트 생성 (가능하면 한국/아시아에 가까운 리전 선택 — 국외
   서버를 사용할 경우 연구설명문·동의서에 국외 이전 고지가 필요합니다. §개인정보보호 대책 참조)
2. **Pooled connection string**을 복사해 `.env.local`의 `DATABASE_URL`에 설정
3. SQL Editor(또는 `psql "$DATABASE_URL" -f db/schema.sql`)에서 `db/schema.sql` 실행 → 테이블 생성

## Vercel 배포

1. 이 프로젝트 폴더를 GitHub 저장소로 push
2. https://vercel.com 에서 New Project → 해당 저장소 선택 (Framework Preset: Next.js 자동 인식)
3. Environment Variables에 `DATABASE_URL`을 Neon의 pooled connection string으로 등록
   (Production/Preview 모두)
4. Deploy → 배포 완료 후 발급되는 URL을 참여자용 QR코드/URL로 사용

배포 후 연구담당자는 참여자별로 고유 코드(예: `HSCT-001`, `HSCT-002`, …)를 서면 동의서 작성
시점에 배정하고, 참여자에게 배포 URL과 코드를 함께 안내합니다.

## 데이터 내보내기 (별도 대시보드 없음)

관리자 대시보드는 구현하지 않았습니다. 자료 확인·내보내기는 Neon 콘솔의 Table
Editor/SQL Editor에서 직접 `SELECT * FROM ...` 후 CSV로 내보내거나, `psql`로 접속해
`\copy` 명령을 사용하면 됩니다. 예:

```sql
\copy (SELECT * FROM basic_info) TO 'basic_info.csv' WITH CSV HEADER;
\copy (SELECT * FROM symptom_answers) TO 'symptom_answers.csv' WITH CSV HEADER;
```

## 참고

- PRO-CTCAE 문항 원문: NCI PRO-CTCAE® Item Library – Korean, Version 1.0 (Version date: 2025-12-03)
- 복합등급 알고리즘: Basch E, et al. Clinical Trials. 2021;18(1):104-114.
