export interface Preference {
  name: string;
  description: string;
  how_important: number; // 1-100
}

export interface GiftUserProfile {
  age?: number | null;
  gender?: string | null;
  occupation?: string | null;
  location?: string | null;
  relationship_to_recipient?: string | null;
  likes?: Preference[] | null;
  dislikes?: Preference[] | null;
  budget?: number | null;
  gift_giving_history?: string[] | null;
  upcoming_events?: string[] | null;
  wishlist?: string[] | null;
  gift_guesses?: string[] | null;
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