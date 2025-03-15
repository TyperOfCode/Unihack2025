
export interface GiftUserProfile {
  interests: string[];
  dislikes: string[];
  about: string;
  completed_percentage: number;
}

export interface LLMRequest {
  pastQuestions: string[];
  pastAnswers: string[];
  model: string;
}

export interface LLMResponse {
  profile: GiftUserProfile;
  newQuestion: string;
} 