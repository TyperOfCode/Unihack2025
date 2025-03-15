"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import GradientButton from "@/components/GradientButton";
import { buildProfile } from "@/lib/api";
import { GiftUserProfile, LLMResponse } from "@/types/profile";
import { PageState } from "./page";

interface QuestionPageProps {
  isAnimating: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  handleNext: () => void;
  handleBackToHome: () => void;
  setGiftProfile: (profile: GiftUserProfile) => void;
  giftProfile: GiftUserProfile | null;
}

const QuestionPage: React.FC<QuestionPageProps> = ({
  isAnimating,
  inputValue,
  setInputValue,
  handleNext,
  handleBackToHome,
  setGiftProfile,
  giftProfile
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<string>("Tell me about them!");
  const [pastQuestions, setPastQuestions] = useState<string[]>([]);
  const [pastAnswers, setPastAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Extract tags from the gift profile
  useEffect(() => {
    if (!giftProfile) return;
    
    const newTags: string[] = [];
    
    // Add likes
    if (giftProfile.likes) {
      giftProfile.likes.forEach(like => {
        newTags.push(like.name);
      });
    }
    
    // Add dislikes
    if (giftProfile.dislikes) {
      giftProfile.dislikes.forEach(dislike => {
        newTags.push(dislike.name);
      });
    }
    
    // Add other relevant profile information as tags
    if (giftProfile.age) newTags.push(`Age: ${giftProfile.age}`);
    if (giftProfile.gender) newTags.push(giftProfile.gender);
    if (giftProfile.occupation) newTags.push(giftProfile.occupation);
    if (giftProfile.location) newTags.push(giftProfile.location);
    if (giftProfile.budget) newTags.push(`Budget: $${giftProfile.budget}`);
    
    setTags([...new Set(newTags)]); // Remove duplicates
  }, [giftProfile]);

  const handleSubmitAnswer = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    // Add current question and answer to history
    const updatedPastQuestions = [...pastQuestions, currentQuestion];
    const updatedPastAnswers = [...pastAnswers, inputValue];
    
    setPastQuestions(updatedPastQuestions);
    setPastAnswers(updatedPastAnswers);
    
    try {
      const response = await buildProfile({
        pastQuestions: updatedPastQuestions,
        pastAnswers: updatedPastAnswers,
        model: JSON.stringify(giftProfile || { completed_percentage: 0 })
      });
      
      // Validate the response
      if (!response || !response.profile || !response.newQuestion) {
        throw new Error("Invalid response from server. Missing profile or question data.");
      }
      
      console.log("Profile response:", response);
      
      // Ensure completed_percentage is present
      if (response.profile.completed_percentage === undefined) {
        response.profile.completed_percentage = giftProfile?.completed_percentage || 0;
      }
      
      // Update the gift profile and next question
      setGiftProfile(response.profile);
      setCurrentQuestion(response.newQuestion);
      setInputValue(""); // Clear input for next question
      
      // Check if profile is complete enough to proceed
      if (response.profile.completed_percentage >= 80) {
        handleNext();
      }
    } catch (error) {
      console.error("Error building profile:", error);
      setError(error instanceof Error ? error.message : "An error occurred while processing your answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl">
      {/* Speech bubble at the top */}
      <div className="bg-white p-6 rounded-3xl shadow-md max-w-xl mx-auto mb-8 relative">
        <p className="text-[#e77ed6] text-2xl font-bold text-center">{currentQuestion}</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-md mb-8">
        {/* Character image positioned to the left */}
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="flex-shrink-0 -mt-16 ml-4">
            <Image 
              src="/avatar-2.png" 
              alt="Gift Box Character with Notepad" 
              width={150} 
              height={150}
              className="object-contain"
            />
          </div>

          {/* Tags and input */}
          <div className="w-full">
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.length > 0 ? (
                tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-white text-[#6a75e8] px-4 py-2 rounded-full shadow-sm border border-gray-100"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 italic">No tags yet. Answer questions to build a profile.</span>
              )}
            </div>
            
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Answer Here"
              className="w-full p-4 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#e77ed6]"
              disabled={isLoading}
            />
            
            <div className="flex justify-end">
              <GradientButton 
                onClick={handleSubmitAnswer}
                size="md"
                rounded="lg"
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : "Next"}
              </GradientButton>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <GradientButton 
          onClick={handleBackToHome}
          size="md"
          rounded="lg"
          disabled={isLoading}
        >
          Back to Home
        </GradientButton>
      </div>
      
      {giftProfile && (
        <div className="mt-4 text-center text-gray-600">
          Profile completion: {Math.round(giftProfile.completed_percentage)}%
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className="bg-[#e77ed6] h-2.5 rounded-full" 
              style={{ width: `${giftProfile.completed_percentage}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPage; 