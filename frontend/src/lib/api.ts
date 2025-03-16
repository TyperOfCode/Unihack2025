import Category from '@/models/category';
import { GiftUserProfile, LLMResponse } from '@/models/profile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface BuildProfileRequest {
  pastQuestions: string[];
  pastAnswers: string[];
  model: string;
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

export async function buildProfile(data: BuildProfileRequest): Promise<LLMResponse> {
  try {
    const response = await fetchWithRetry(`${API_URL}/buildProfile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error building profile:', error);
    throw new Error(`Failed to build profile: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getRecommendations(
  giftProfile: GiftUserProfile,
): Promise<Category[]> {
  try {
    const response = await fetchWithRetry(`${API_URL}/getRecommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(giftProfile),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
}

export async function pingServer(): Promise<{ success: boolean }> {
  try {
    const response = await fetchWithRetry(`${API_URL}/ping`, {
      method: 'POST',
    });

    return await response.json();
  } catch (error) {
    console.error('Error pinging server:', error);
    throw new Error(`Failed to ping server: ${error instanceof Error ? error.message : String(error)}`);
  }
} 