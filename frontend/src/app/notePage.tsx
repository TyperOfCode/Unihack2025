"use client";

import GradientButton from "@/components/GradientButton";
import { GiftUserProfile } from "@/types/profile";
import { Suspense, useEffect, useState } from "react";

async function getRecommendations(
  giftProfile: GiftUserProfile,
): Promise<Category[]> {
  try {
    const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${backend_url}/getRecommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(giftProfile),
    });
    if (!response.ok) {
      throw new Error("Failed to build profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in buildProfile:", error);
    return [];
  }
}

interface NotePageProps {
  handleNext: () => void;
  handleBack: () => void;
  giftProfile: GiftUserProfile;
  setCategory: (value: string) => void;
}

interface Category {
  product: string;
  reason: string;
  price: number;
}

const NotePage: React.FC<NotePageProps> = ({
  handleNext,
  handleBack,
  giftProfile,
  setCategory,
}) => {
  const [categories, setCategories] = useState<Category>([]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col justify-center w-full">
        {categories.map((category) => {
          <div className="w-[262px] rounded-[32px] bg-white border-none">
            <h2 className="text-3xl font-bold text-[#e77ed6] mb-6 text-center">
              Note Page
            </h2>
            <p className="text-lg text-gray-700 mb-8 text-center">
              This is a placeholder for the note page where users can take notes
              about gift ideas.
            </p>
          </div>;
        })}
      </div>
      <GradientButton onClick={handleNext} size="md" rounded="lg">
        Next
      </GradientButton>
    </Suspense>
  );
};

export default NotePage;
