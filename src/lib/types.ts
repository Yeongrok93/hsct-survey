export interface BasicInfo {
  age_current: number | null;
  age_transplant: number | null;
  sex: number | null;
  marital_status: number | null;
  cohabitation: number | null;
  cohabitation_other: string | null;
  religion: number | null;
  education: number | null;
  cost_burden: number | null;
  occupation: number | null;
  diagnosis: number | null;
  diagnosis_other: string | null;
  diagnosis_year: number | null;
  diagnosis_month: number | null;
  transplant_date: string | null; // YYYY-MM-DD
  transplant_number: number | null;
  donor_type: number | null;
  graft_type: number | null;
  dli_yn: number | null;
  relapse: number | null;
  target_therapy: number | null;
  agvhd_ever: number | null;
  agvhd_ever_skin: boolean;
  agvhd_ever_liver: boolean;
  agvhd_ever_gut: boolean;
  agvhd_current: number | null;
  agvhd_current_skin: boolean;
  agvhd_current_liver: boolean;
  agvhd_current_gut: boolean;
  cgvhd_ever: number | null;
  cgvhd_ever_oral: boolean;
  cgvhd_ever_skin: boolean;
  cgvhd_ever_eye: boolean;
  cgvhd_ever_gi: boolean;
  cgvhd_ever_liver: boolean;
  cgvhd_ever_lung: boolean;
  cgvhd_ever_musculoskeletal: boolean;
  cgvhd_ever_gu: boolean;
  cgvhd_ever_other: boolean;
  cgvhd_current: number | null;
  cgvhd_current_oral: boolean;
  cgvhd_current_skin: boolean;
  cgvhd_current_eye: boolean;
  cgvhd_current_gi: boolean;
  cgvhd_current_liver: boolean;
  cgvhd_current_lung: boolean;
  cgvhd_current_musculoskeletal: boolean;
  cgvhd_current_gu: boolean;
  cgvhd_current_other: boolean;
}

export interface HealthBehavior {
  smoke_past: number | null;
  smoke_current: number | null;
  alcohol_days: number | null;
  vigorous_days: number | null;
  moderate_days: number | null;
  walk_days: number | null;
  sedentary_hours: number | null;
  sedentary_minutes: number | null;
  supplement_yn: number | null;
  checkup_yn: number | null;
}

export interface HealthOutcome {
  height_cm: number | null;
  weight_kg: number | null;
  comorbid_none: boolean;
  comorbid_dm: boolean;
  comorbid_htn: boolean;
  comorbid_dyslipidemia: boolean;
  comorbid_cvd: boolean;
  comorbid_cerebrovascular: boolean;
  comorbid_thyroid: boolean;
  comorbid_osteoporosis: boolean;
  second_cancer_yn: number | null;
  second_cancer_name: string | null;
  second_cancer_year: number | null;
  second_cancer_month: number | null;
  other_transplant_yn: number | null;
  other_transplant_type: number | null;
  other_transplant_year: number | null;
  other_transplant_month: number | null;
}

export type SurveyStep = "basic" | "behavior" | "outcome" | "proctcae" | "complete";

export interface ParticipantState {
  participant_id: string;
  current_step: SurveyStep;
  is_complete: boolean;
}

export interface OtherSymptomEntry {
  slot: number;
  name: string;
  severity: number | null;
}
