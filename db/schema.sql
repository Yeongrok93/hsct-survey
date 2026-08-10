-- HSCT PRO-CTCAE Survey — Neon Postgres schema
-- Column names mirror the study codebook (증례기록지_CRF_ver1.0.xlsx, sheet "코딩북").
-- Run this once against your Neon database (Neon SQL Editor, or `psql "$DATABASE_URL" -f db/schema.sql`).

CREATE TABLE IF NOT EXISTS participants (
  participant_id   TEXT PRIMARY KEY,          -- 연구식별코드, assigned by research staff at paper consent (e.g. HSCT-001)
  cohort_band       SMALLINT,                  -- 1=100일~1년 미만, 2=1~2년 미만, 3=2~5년 미만, 4=5년 이상 (recruitment tracking only)
  current_step      TEXT NOT NULL DEFAULT 'basic', -- basic | behavior | outcome | proctcae | complete
  is_complete       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ
);

-- Ⅰ. 기본 정보 (인구학적·임상정보) ------------------------------------------------
CREATE TABLE IF NOT EXISTS basic_info (
  participant_id TEXT PRIMARY KEY REFERENCES participants(participant_id) ON DELETE CASCADE,
  age_current INTEGER,
  age_transplant INTEGER,
  sex SMALLINT,                    -- 1=남자 2=여자
  marital_status SMALLINT,         -- 1=미혼 2=기혼 3=이혼/별거 4=사별
  cohabitation SMALLINT,           -- 1=혼자 2=배우자와 함께 3=자녀와 함께 4=기타
  cohabitation_other TEXT,
  religion SMALLINT,               -- 1=있음 2=없음
  education SMALLINT,              -- 1..5
  cost_burden SMALLINT,            -- 1..5
  occupation SMALLINT,             -- 1=재직중 2=무직
  diagnosis SMALLINT,              -- 1..9
  diagnosis_other TEXT,
  diagnosis_year INTEGER,
  diagnosis_month SMALLINT,
  transplant_date DATE,
  transplant_number SMALLINT,      -- 1=첫번째 2=두번째 3=세번째 이상
  donor_type SMALLINT,             -- 1..4
  graft_type SMALLINT,             -- 1=말초혈액 2=골수 3=제대혈
  dli_yn SMALLINT,                 -- 1=있다 2=없다
  relapse SMALLINT,                -- 1..4
  target_therapy SMALLINT,         -- 1..3
  agvhd_ever SMALLINT,             -- 1=없다 2=있다
  agvhd_ever_skin BOOLEAN DEFAULT FALSE,
  agvhd_ever_liver BOOLEAN DEFAULT FALSE,
  agvhd_ever_gut BOOLEAN DEFAULT FALSE,
  agvhd_current SMALLINT,
  agvhd_current_skin BOOLEAN DEFAULT FALSE,
  agvhd_current_liver BOOLEAN DEFAULT FALSE,
  agvhd_current_gut BOOLEAN DEFAULT FALSE,
  cgvhd_ever SMALLINT,
  cgvhd_ever_oral BOOLEAN DEFAULT FALSE,
  cgvhd_ever_skin BOOLEAN DEFAULT FALSE,
  cgvhd_ever_eye BOOLEAN DEFAULT FALSE,
  cgvhd_ever_gi BOOLEAN DEFAULT FALSE,
  cgvhd_ever_liver BOOLEAN DEFAULT FALSE,
  cgvhd_ever_lung BOOLEAN DEFAULT FALSE,
  cgvhd_ever_musculoskeletal BOOLEAN DEFAULT FALSE,
  cgvhd_ever_gu BOOLEAN DEFAULT FALSE,
  cgvhd_ever_other BOOLEAN DEFAULT FALSE,
  cgvhd_current SMALLINT,
  cgvhd_current_oral BOOLEAN DEFAULT FALSE,
  cgvhd_current_skin BOOLEAN DEFAULT FALSE,
  cgvhd_current_eye BOOLEAN DEFAULT FALSE,
  cgvhd_current_gi BOOLEAN DEFAULT FALSE,
  cgvhd_current_liver BOOLEAN DEFAULT FALSE,
  cgvhd_current_lung BOOLEAN DEFAULT FALSE,
  cgvhd_current_musculoskeletal BOOLEAN DEFAULT FALSE,
  cgvhd_current_gu BOOLEAN DEFAULT FALSE,
  cgvhd_current_other BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ⅱ. 건강 행태 ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS health_behavior (
  participant_id TEXT PRIMARY KEY REFERENCES participants(participant_id) ON DELETE CASCADE,
  smoke_past SMALLINT,        -- 0=아니오 1=예
  smoke_current SMALLINT,
  alcohol_days SMALLINT,      -- 0-7
  vigorous_days SMALLINT,
  moderate_days SMALLINT,
  walk_days SMALLINT,
  sedentary_hours SMALLINT,
  sedentary_minutes SMALLINT,
  supplement_yn SMALLINT,
  checkup_yn SMALLINT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ⅲ. 건강 결과 ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS health_outcome (
  participant_id TEXT PRIMARY KEY REFERENCES participants(participant_id) ON DELETE CASCADE,
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  comorbid_none BOOLEAN DEFAULT FALSE,
  comorbid_dm BOOLEAN DEFAULT FALSE,
  comorbid_htn BOOLEAN DEFAULT FALSE,
  comorbid_dyslipidemia BOOLEAN DEFAULT FALSE,
  comorbid_cvd BOOLEAN DEFAULT FALSE,
  comorbid_cerebrovascular BOOLEAN DEFAULT FALSE,
  comorbid_thyroid BOOLEAN DEFAULT FALSE,
  comorbid_osteoporosis BOOLEAN DEFAULT FALSE,
  second_cancer_yn SMALLINT,     -- 1=없음 2=있음
  second_cancer_name TEXT,
  second_cancer_year INTEGER,
  second_cancer_month SMALLINT,
  other_transplant_yn SMALLINT,  -- 1=없음 2=있음
  other_transplant_type SMALLINT,
  other_transplant_year INTEGER,
  other_transplant_month SMALLINT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ⅳ. PRO-CTCAE 증상 정보 (정규화 — 문항×하위질문 단위) --------------------------
CREATE TABLE IF NOT EXISTS symptom_answers (
  id BIGSERIAL PRIMARY KEY,
  participant_id TEXT NOT NULL REFERENCES participants(participant_id) ON DELETE CASCADE,
  item_id SMALLINT NOT NULL,          -- 1-80 (NCI PRO-CTCAE Item Library-Korean v1.0)
  question_key TEXT NOT NULL,         -- 'a', 'b', 'c'
  option_set TEXT NOT NULL,           -- freq5 | sev5 | int5 | yn2 | sev6 | sev7 | freq7 | ynsex4 | ynna3
  answer_index SMALLINT NOT NULL,     -- 0-indexed selected option
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (participant_id, item_id, question_key)
);
CREATE INDEX IF NOT EXISTS idx_symptom_answers_participant ON symptom_answers (participant_id);

-- 그 외 증상 (자유기술, 최대 5건) -----------------------------------------------
CREATE TABLE IF NOT EXISTS other_symptoms (
  participant_id TEXT NOT NULL REFERENCES participants(participant_id) ON DELETE CASCADE,
  slot SMALLINT NOT NULL CHECK (slot BETWEEN 1 AND 5),
  name TEXT,
  severity SMALLINT,   -- 0-4, sev5 scale
  PRIMARY KEY (participant_id, slot)
);
CREATE TABLE IF NOT EXISTS other_symptoms_flag (
  participant_id TEXT PRIMARY KEY REFERENCES participants(participant_id) ON DELETE CASCADE,
  other_sx_yn SMALLINT   -- 0=아니요 1=네
);
