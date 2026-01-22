
export interface Milestone {
  year: string;
  title: string;
  generation?: string;
  description: string;
  tags: string[];
}

export interface GenerationInfo {
  name: string;
  years: string;
  region: string;
  summary: string;
  keyFeatures: string[];
}
