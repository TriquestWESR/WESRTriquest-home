# WESR Triquest — Assessment Spec
## Principles
- Matrix-driven exams built from **Training Requirements (TR) sections** (not fixed course modules).
- Per-section endorsements on certificates; **80% pass per section**; no global timer (duration implied by section question count).
- Difficulty mix is **locked** (section level). Question counts are **admin-controlled** (section level).

## Section Scoping
- Each TR section has tags for **disciplines** (HV, LV, Mechanical, Hydraulic, Systems/Comms, Docs/Audit) and **roles** (HV Operator, Switching Assistant, Work Planner, PCEI, PCWA, Delegated PCEI, Installer).
- WESR Admin can create/rename/disable discipline & role tags at any time.

## Blueprint
- Provider selects disciplines and roles; UI filters TR sections; provider ticks the taught sections.
- For each selected section S:
  - questionCount(S) = from admin config.
  - mix(S) = { easy: 0.60, medium: 0.30, hard: 0.10 } (locked).
  - Questions & choices randomized.

## Scoring
score(S) = correct(S)/total(S) • pass(S) = score(S) ≥ 0.80

## Retakes & Overrides
- If pass → endorsement granted (no retake for that section in that class).
- If fail → instructor may **override only for non-knowledge reasons** (e.g., language barrier, accessibility, technical disruption). An **Override Log** is required.
- If lack of knowledge → **retake required** (no override).

## Expiry & Versioning
- Endorsements expire after **24 months** (reminders at 21/24 months).
- Minor/Patch keeps validity; Major may mark "legacy" until a short delta assessment is passed (policy set by Admin).

## Data & Integrity
- Minimal data (User ID, section selections, item ids, correctness).
- Randomization, item pools, attempt IDs; no public exam links.
- Accessibility: keyboard & screen reader friendly.
