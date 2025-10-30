export type DifficultyMix = { easy:number; medium:number; hard:number }
export type TRSection = { id:string; title:string; version:string; disciplines:string[]; roles:string[]; question_count:number; retired:boolean }
export type AdminConfig = { pass_threshold:number; expiry_months:number; difficulty_mix:DifficultyMix }
export type Question = { id:string; locale:string; type:'mcq'|'multi'; prompt:string; choices:string[]; answer_key:number[]; section_tags:string[]; difficulty:1|2|3; retired:boolean }
export type ClassRow = { id:string; provider_id:string; code:string; selected_sections:string[]; version_lock:Record<string,string> }
// (no change if already similar)
export type Endorsement = { sectionId:string; version:string; grantedAt:string; expiresAt:string }
