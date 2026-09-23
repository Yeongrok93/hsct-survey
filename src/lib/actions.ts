"use server";

import { sql } from "./db";
import type { BasicInfo, HealthBehavior, HealthOutcome, ParticipantState, OtherSymptomEntry } from "./types";

const CODE_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;

export async function getOrCreateParticipant(rawCode: string): Promise<
  { ok: true; state: ParticipantState } | { ok: false; error: string }
> {
  const code = rawCode.trim();
  if (!CODE_PATTERN.test(code)) {
    return { ok: false, error: "참여자 코드 형식이 올바르지 않습니다. 연구담당자에게 안내받은 코드를 다시 확인해 주세요." };
  }

  const existing = await sql`
    SELECT participant_id, current_step, is_complete
    FROM participants WHERE participant_id = ${code}
  `;

  if (existing.length > 0) {
    const row = existing[0];
    return {
      ok: true,
      state: {
        participant_id: row.participant_id,
        current_step: row.current_step,
        is_complete: row.is_complete,
      },
    };
  }

  const inserted = await sql`
    INSERT INTO participants (participant_id, current_step, is_complete)
    VALUES (${code}, 'basic', FALSE)
    ON CONFLICT (participant_id) DO NOTHING
    RETURNING participant_id, current_step, is_complete
  `;

  if (inserted.length === 0) {
    // race: someone else just created it — re-fetch
    const retry = await sql`
      SELECT participant_id, current_step, is_complete
      FROM participants WHERE participant_id = ${code}
    `;
    const row = retry[0];
    return {
      ok: true,
      state: { participant_id: row.participant_id, current_step: row.current_step, is_complete: row.is_complete },
    };
  }

  const row = inserted[0];
  return {
    ok: true,
    state: { participant_id: row.participant_id, current_step: row.current_step, is_complete: row.is_complete },
  };
}

export async function getParticipantState(code: string): Promise<ParticipantState | null> {
  const rows = await sql`
    SELECT participant_id, current_step, is_complete
    FROM participants WHERE participant_id = ${code}
  `;
  if (rows.length === 0) return null;
  const row = rows[0];
  return { participant_id: row.participant_id, current_step: row.current_step, is_complete: row.is_complete };
}

async function setStep(code: string, step: string) {
  await sql`UPDATE participants SET current_step = ${step} WHERE participant_id = ${code}`;
}

export async function saveBasicInfo(code: string, data: BasicInfo): Promise<void> {
  // 이식 당시 나이는 참여자가 직접 입력하면 헷갈려하는 경우가 많아 설문에서 제거하고,
  // 현재 나이 + 이식일로부터 자동 계산한다 (2026-09 강영아 요청).
  const computedAgeTransplant =
    data.age_current !== null && data.transplant_date
      ? Math.round(
          data.age_current -
            (Date.now() - new Date(data.transplant_date).getTime()) / (365.25 * 86400000)
        )
      : null;

  await sql`
    INSERT INTO basic_info (
      participant_id, age_current, age_transplant, sex, marital_status, cohabitation, cohabitation_other,
      religion, education, cost_burden, occupation, diagnosis, diagnosis_other, diagnosis_year, diagnosis_month,
      transplant_date, transplant_number, donor_type, graft_type, dli_yn, relapse, target_therapy,
      agvhd_ever, agvhd_ever_skin, agvhd_ever_liver, agvhd_ever_gut,
      agvhd_current, agvhd_current_skin, agvhd_current_liver, agvhd_current_gut,
      cgvhd_ever, cgvhd_ever_oral, cgvhd_ever_skin, cgvhd_ever_eye, cgvhd_ever_gi, cgvhd_ever_liver,
      cgvhd_ever_lung, cgvhd_ever_musculoskeletal, cgvhd_ever_gu, cgvhd_ever_other,
      cgvhd_current, cgvhd_current_oral, cgvhd_current_skin, cgvhd_current_eye, cgvhd_current_gi,
      cgvhd_current_liver, cgvhd_current_lung, cgvhd_current_musculoskeletal, cgvhd_current_gu, cgvhd_current_other,
      updated_at
    ) VALUES (
      ${code}, ${data.age_current}, ${computedAgeTransplant}, ${data.sex}, ${data.marital_status}, ${data.cohabitation}, ${data.cohabitation_other},
      ${data.religion}, ${data.education}, ${data.cost_burden}, ${data.occupation}, ${data.diagnosis}, ${data.diagnosis_other}, ${data.diagnosis_year}, ${data.diagnosis_month},
      ${data.transplant_date}, ${data.transplant_number}, ${data.donor_type}, ${data.graft_type}, ${data.dli_yn}, ${data.relapse}, ${data.target_therapy},
      ${data.agvhd_ever}, ${data.agvhd_ever_skin}, ${data.agvhd_ever_liver}, ${data.agvhd_ever_gut},
      ${data.agvhd_current}, ${data.agvhd_current_skin}, ${data.agvhd_current_liver}, ${data.agvhd_current_gut},
      ${data.cgvhd_ever}, ${data.cgvhd_ever_oral}, ${data.cgvhd_ever_skin}, ${data.cgvhd_ever_eye}, ${data.cgvhd_ever_gi}, ${data.cgvhd_ever_liver},
      ${data.cgvhd_ever_lung}, ${data.cgvhd_ever_musculoskeletal}, ${data.cgvhd_ever_gu}, ${data.cgvhd_ever_other},
      ${data.cgvhd_current}, ${data.cgvhd_current_oral}, ${data.cgvhd_current_skin}, ${data.cgvhd_current_eye}, ${data.cgvhd_current_gi},
      ${data.cgvhd_current_liver}, ${data.cgvhd_current_lung}, ${data.cgvhd_current_musculoskeletal}, ${data.cgvhd_current_gu}, ${data.cgvhd_current_other},
      NOW()
    )
    ON CONFLICT (participant_id) DO UPDATE SET
      age_current = EXCLUDED.age_current, age_transplant = COALESCE(EXCLUDED.age_transplant, basic_info.age_transplant), sex = EXCLUDED.sex,
      marital_status = EXCLUDED.marital_status, cohabitation = EXCLUDED.cohabitation, cohabitation_other = EXCLUDED.cohabitation_other,
      religion = EXCLUDED.religion, education = EXCLUDED.education, cost_burden = EXCLUDED.cost_burden, occupation = EXCLUDED.occupation,
      diagnosis = EXCLUDED.diagnosis, diagnosis_other = EXCLUDED.diagnosis_other, diagnosis_year = EXCLUDED.diagnosis_year, diagnosis_month = EXCLUDED.diagnosis_month,
      transplant_date = EXCLUDED.transplant_date, transplant_number = EXCLUDED.transplant_number, donor_type = EXCLUDED.donor_type,
      graft_type = EXCLUDED.graft_type, dli_yn = EXCLUDED.dli_yn, relapse = EXCLUDED.relapse, target_therapy = EXCLUDED.target_therapy,
      agvhd_ever = EXCLUDED.agvhd_ever, agvhd_ever_skin = EXCLUDED.agvhd_ever_skin, agvhd_ever_liver = EXCLUDED.agvhd_ever_liver, agvhd_ever_gut = EXCLUDED.agvhd_ever_gut,
      agvhd_current = EXCLUDED.agvhd_current, agvhd_current_skin = EXCLUDED.agvhd_current_skin, agvhd_current_liver = EXCLUDED.agvhd_current_liver, agvhd_current_gut = EXCLUDED.agvhd_current_gut,
      cgvhd_ever = EXCLUDED.cgvhd_ever, cgvhd_ever_oral = EXCLUDED.cgvhd_ever_oral, cgvhd_ever_skin = EXCLUDED.cgvhd_ever_skin, cgvhd_ever_eye = EXCLUDED.cgvhd_ever_eye,
      cgvhd_ever_gi = EXCLUDED.cgvhd_ever_gi, cgvhd_ever_liver = EXCLUDED.cgvhd_ever_liver, cgvhd_ever_lung = EXCLUDED.cgvhd_ever_lung,
      cgvhd_ever_musculoskeletal = EXCLUDED.cgvhd_ever_musculoskeletal, cgvhd_ever_gu = EXCLUDED.cgvhd_ever_gu, cgvhd_ever_other = EXCLUDED.cgvhd_ever_other,
      cgvhd_current = EXCLUDED.cgvhd_current, cgvhd_current_oral = EXCLUDED.cgvhd_current_oral, cgvhd_current_skin = EXCLUDED.cgvhd_current_skin,
      cgvhd_current_eye = EXCLUDED.cgvhd_current_eye, cgvhd_current_gi = EXCLUDED.cgvhd_current_gi, cgvhd_current_liver = EXCLUDED.cgvhd_current_liver,
      cgvhd_current_lung = EXCLUDED.cgvhd_current_lung, cgvhd_current_musculoskeletal = EXCLUDED.cgvhd_current_musculoskeletal,
      cgvhd_current_gu = EXCLUDED.cgvhd_current_gu, cgvhd_current_other = EXCLUDED.cgvhd_current_other,
      updated_at = NOW()
  `;
  await setStep(code, "behavior");
}

export async function saveHealthBehavior(code: string, data: HealthBehavior): Promise<void> {
  await sql`
    INSERT INTO health_behavior (
      participant_id, smoke_past, smoke_current, alcohol_days, vigorous_days, moderate_days, walk_days,
      sedentary_hours, sedentary_minutes, supplement_yn, checkup_yn, updated_at
    ) VALUES (
      ${code}, ${data.smoke_past}, ${data.smoke_current}, ${data.alcohol_days}, ${data.vigorous_days}, ${data.moderate_days}, ${data.walk_days},
      ${data.sedentary_hours}, ${data.sedentary_minutes}, ${data.supplement_yn}, ${data.checkup_yn}, NOW()
    )
    ON CONFLICT (participant_id) DO UPDATE SET
      smoke_past = EXCLUDED.smoke_past, smoke_current = EXCLUDED.smoke_current, alcohol_days = EXCLUDED.alcohol_days,
      vigorous_days = EXCLUDED.vigorous_days, moderate_days = EXCLUDED.moderate_days, walk_days = EXCLUDED.walk_days,
      sedentary_hours = EXCLUDED.sedentary_hours, sedentary_minutes = EXCLUDED.sedentary_minutes,
      supplement_yn = EXCLUDED.supplement_yn, checkup_yn = EXCLUDED.checkup_yn, updated_at = NOW()
  `;
  await setStep(code, "outcome");
}

export async function saveHealthOutcome(code: string, data: HealthOutcome): Promise<void> {
  await sql`
    INSERT INTO health_outcome (
      participant_id, height_cm, weight_kg,
      comorbid_none, comorbid_dm, comorbid_htn, comorbid_dyslipidemia, comorbid_cvd, comorbid_cerebrovascular,
      comorbid_thyroid, comorbid_osteoporosis,
      second_cancer_yn, second_cancer_name, second_cancer_year, second_cancer_month,
      other_transplant_yn, other_transplant_type, other_transplant_year, other_transplant_month,
      updated_at
    ) VALUES (
      ${code}, ${data.height_cm}, ${data.weight_kg},
      ${data.comorbid_none}, ${data.comorbid_dm}, ${data.comorbid_htn}, ${data.comorbid_dyslipidemia}, ${data.comorbid_cvd}, ${data.comorbid_cerebrovascular},
      ${data.comorbid_thyroid}, ${data.comorbid_osteoporosis},
      ${data.second_cancer_yn}, ${data.second_cancer_name}, ${data.second_cancer_year}, ${data.second_cancer_month},
      ${data.other_transplant_yn}, ${data.other_transplant_type}, ${data.other_transplant_year}, ${data.other_transplant_month},
      NOW()
    )
    ON CONFLICT (participant_id) DO UPDATE SET
      height_cm = EXCLUDED.height_cm, weight_kg = EXCLUDED.weight_kg,
      comorbid_none = EXCLUDED.comorbid_none, comorbid_dm = EXCLUDED.comorbid_dm, comorbid_htn = EXCLUDED.comorbid_htn,
      comorbid_dyslipidemia = EXCLUDED.comorbid_dyslipidemia, comorbid_cvd = EXCLUDED.comorbid_cvd,
      comorbid_cerebrovascular = EXCLUDED.comorbid_cerebrovascular, comorbid_thyroid = EXCLUDED.comorbid_thyroid,
      comorbid_osteoporosis = EXCLUDED.comorbid_osteoporosis,
      second_cancer_yn = EXCLUDED.second_cancer_yn, second_cancer_name = EXCLUDED.second_cancer_name,
      second_cancer_year = EXCLUDED.second_cancer_year, second_cancer_month = EXCLUDED.second_cancer_month,
      other_transplant_yn = EXCLUDED.other_transplant_yn, other_transplant_type = EXCLUDED.other_transplant_type,
      other_transplant_year = EXCLUDED.other_transplant_year, other_transplant_month = EXCLUDED.other_transplant_month,
      updated_at = NOW()
  `;
  await setStep(code, "proctcae");
}

export type SymptomAnswerRow = {
  itemId: number;
  questionKey: string;
  optionSet: string;
  answerIndex: number;
};

export async function saveSymptomAnswers(code: string, rows: SymptomAnswerRow[]): Promise<void> {
  for (const r of rows) {
    await sql`
      INSERT INTO symptom_answers (participant_id, item_id, question_key, option_set, answer_index)
      VALUES (${code}, ${r.itemId}, ${r.questionKey}, ${r.optionSet}, ${r.answerIndex})
      ON CONFLICT (participant_id, item_id, question_key)
      DO UPDATE SET option_set = EXCLUDED.option_set, answer_index = EXCLUDED.answer_index
    `;
  }
}

export async function getSymptomAnswers(code: string): Promise<Record<string, number>> {
  const rows = await sql`
    SELECT item_id, question_key, answer_index FROM symptom_answers WHERE participant_id = ${code}
  `;
  const map: Record<string, number> = {};
  for (const row of rows) {
    map[`${row.item_id}-${row.question_key}`] = row.answer_index;
  }
  return map;
}

export async function saveOtherSymptoms(
  code: string,
  hasOther: boolean,
  entries: OtherSymptomEntry[]
): Promise<void> {
  await sql`
    INSERT INTO other_symptoms_flag (participant_id, other_sx_yn)
    VALUES (${code}, ${hasOther ? 1 : 0})
    ON CONFLICT (participant_id) DO UPDATE SET other_sx_yn = EXCLUDED.other_sx_yn
  `;
  for (const e of entries) {
    if (!e.name?.trim() && e.severity === null) continue;
    await sql`
      INSERT INTO other_symptoms (participant_id, slot, name, severity)
      VALUES (${code}, ${e.slot}, ${e.name || null}, ${e.severity})
      ON CONFLICT (participant_id, slot) DO UPDATE SET name = EXCLUDED.name, severity = EXCLUDED.severity
    `;
  }
}

export async function completeSurvey(code: string): Promise<void> {
  await sql`
    UPDATE participants
    SET is_complete = TRUE, completed_at = NOW(), current_step = 'complete'
    WHERE participant_id = ${code}
  `;
}
