"use client";

import GradientButton from "@/components/GradientButton";
import { getRecommendations } from "@/lib/api";
import Category from "@/models/category";
import { GiftUserProfile } from "@/models/profile";
import { Recommendation } from "@/models/recommendation";
import { Suspense, useEffect, useState } from "react";

interface NotePageProps {
  handleNext: () => void;
  handleBack: () => void;
  giftProfile: GiftUserProfile;
  setCategory: (value: Recommendation) => void;
}

const NotePage: React.FC<NotePageProps> = ({
  handleNext,
  handleBack,
  giftProfile,
  setCategory,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    getRecommendations(giftProfile).then((res) => {
      console.log("RECOMM", res)
      setCategories(res || []);
      setIsLoading(false);
    });
  }, [giftProfile]);

  useEffect(() => {
    console.log(categories);
  }, [categories]);

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setCategory(categories.find((category) => category.product === categoryName)!);
  };

  const handleContinue = () => {
    if (selectedCategory) {
      handleNext();
    }
  };

  return (
    <Suspense fallback={<div className="w-full text-center py-8">Loading gift categories...</div>}>
      <div className="w-full max-w-6xl">
        <div className="bg-white p-6 rounded-3xl shadow-md mb-8">
          <h2 className="text-3xl font-bold text-[#e77ed6] mb-4 text-center">
            Recommended Gift Categories
          </h2>
          
          <p className="text-lg text-gray-700 mb-6 text-center">
            Select a category to explore specific gift ideas
          </p>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading gift categories...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className={`relative bg-[#f5f5ff] rounded-2xl overflow-hidden shadow-md flex flex-col h-full cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedCategory === category.product
                      ? "ring-3 ring-[#6b7cff] transform scale-[1.02]"
                      : ""
                  }`}
                  onClick={() => handleCategorySelect(category.product)}
                >
                  <div className="p-5 flex-grow flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-bold text-[#6b7cff]">
                        {category.product}
                      </h3>
                      <span className="bg-gradient-to-r from-[#6b7cff] to-[#e77ed6] text-white rounded-full px-3 py-1 text-sm font-bold">
                        ~${category.price.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="bg-white p-3 rounded-xl mb-4">
                      <h4 className="text-[#e77ed6] font-bold text-sm mb-1">Why This Category?</h4>
                      <p className="text-gray-700 text-sm">{category.reason}</p>
                    </div>
                    
                    {selectedCategory === category.product && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-[#6b7cff] rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            <GradientButton
              onClick={handleBack}
              size="md"
              rounded="lg"
            >
              Back
            </GradientButton>
            
            <GradientButton
              onClick={handleContinue}
              size="md"
              rounded="lg"
              disabled={!selectedCategory}
            >
              Continue
            </GradientButton>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default NotePage;