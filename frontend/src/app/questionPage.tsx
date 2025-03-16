"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import GradientButton from "@/components/GradientButton";
import { buildProfile } from "@/lib/api";
import { GiftUserProfile, LLMResponse } from "@/models/profile";
import { PageState } from "./page";
import { Conversation } from "@/components/Conversation";
import { TranscriptItem, TranscriptItemType } from "@/models/transcriptItem";
import Message from "@/models/message";

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
  giftProfile,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<string>(
    "What kind of person are we talking about...",
  );
  const [pastQuestions, setPastQuestions] = useState<string[]>([]);
  const [pastAnswers, setPastAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [inCall, setInCall] = useState<boolean>(false);

  // Use refs to maintain state between function calls
  const pastQuestionsRef = useRef<string[]>([]);
  const pastAnswersRef = useRef<string[]>([]);
  const giftProfileRef = useRef<GiftUserProfile | null>(giftProfile);

  // Update refs when state changes
  useEffect(() => {
    pastQuestionsRef.current = pastQuestions;
  }, [pastQuestions]);

  useEffect(() => {
    pastAnswersRef.current = pastAnswers;
  }, [pastAnswers]);

  // Update giftProfileRef when the prop changes
  useEffect(() => {
    giftProfileRef.current = giftProfile;
  }, [giftProfile]);

  const onMessage = (message: Message) => {
    console.log(message);

    const item: TranscriptItem = {
      type: TranscriptItemType.CHAT,
      text: message.message,
    };
    setTranscript((prev) => [...prev, item]);
  };

  const onToolUsed = (tool: string) => {
    const item: TranscriptItem = {
      type: TranscriptItemType.TOOL,
      text: `${tool}`,
    };

    setTranscript((prev) => [...prev, item]);
  };

  const clearTranscript = () => {
    setTranscript([]);
  };

  const handleSubmitAnswer = async (answer: string) => {
    // Use the ref values to ensure we have the most up-to-date state
    const updatedPastAnswers = [...pastAnswersRef.current, answer];
    const updatedPastQuestions = [...pastQuestionsRef.current, currentQuestion];
    const currentGiftProfile = giftProfileRef.current;

    // Update state
    setPastAnswers(updatedPastAnswers);
    setPastQuestions(updatedPastQuestions);

    // Update refs immediately
    pastAnswersRef.current = updatedPastAnswers;
    pastQuestionsRef.current = updatedPastQuestions;

    // console.log("handleSubmitAnswer called");
    // console.log("Current pastQuestions:", pastQuestionsRef.current);
    // console.log("Updated pastQuestions:", updatedPastQuestions);
    // console.log("Current pastAnswers:", pastAnswersRef.current);
    // console.log("Updated pastAnswers:", updatedPastAnswers);
    // console.log("currentQuestion:", currentQuestion);
    // console.log("answer:", answer);
    // console.log("giftProfile:", currentGiftProfile);

    const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

    try {
      setIsLoading(true);
      const response = await fetch(`${backend_url}/buildProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pastQuestions: updatedPastQuestions,
          pastAnswers: updatedPastAnswers,
          profile: JSON.stringify(currentGiftProfile),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to build profile");
      }

      const data = (await response.json()) as LLMResponse;

      // Update both the state and the ref
      setGiftProfile(data.profile);
      giftProfileRef.current = data.profile;

      setIsLoading(false);

      // Check if profile completion percentage is over 60%
      const threshold = 60;
      if (data.profile.completed_percentage > threshold) {
        // Add a small delay to allow the user to see the final response
        setTimeout(() => {
          handleNext(); // Navigate to the research page
        }, 2000);
        return JSON.stringify({
          newQuestion: "That's enough information for now. Goodbye!",
        });
      }

      return JSON.stringify(data.newQuestion);
    } catch (error) {
      console.error("Error in buildProfile:", error);
      setError("Failed to build profile");
      setIsLoading(false);
      return JSON.stringify({ error: "Error building profile" });
    }
  };

  const addToQuestions = (question: string) => {
    setCurrentQuestion(question);
    // Use the ref value to ensure we have the most up-to-date state
    const updatedPastQuestions = [...pastQuestionsRef.current, question];
    setPastQuestions(updatedPastQuestions);
    // Update ref immediately
    pastQuestionsRef.current = updatedPastQuestions;
  };

  return (
    <div
      className={`w-full max-w-6xl transition-opacity duration-500 ${isAnimating ? "opacity-0" : "opacity-100"}`}
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Left side - Avatar */}
        <div className="flex-shrink-0">
          <Image
            src={inCall ? "/avatar-2.png" : "/avatar-1.png"}
            alt="Gift Box Character"
            width={300}
            height={300}
            className="object-contain"
            priority
          />
        </div>

        {/* Right side - Content */}
        <div className={`flex-grow ${inCall ? "" : "hidden"}`}>
          {/* Speech bubble with question */}
          <div className={`bg-white p-6 rounded-3xl shadow-md mb-8 relative`}>
            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rotate-45 bg-white"></div>
            <h1 className="text-4xl font-black text-[#e77ed6]">
              {currentQuestion}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Interests section */}
            <div>
              <h2 className="text-2xl font-black text-[#6b7cff] mb-4">
                Interests
              </h2>
              <div className="bg-[#f5f5ff] p-4 rounded-xl min-h-[200px]">
                {giftProfile &&
                giftProfile.interests &&
                giftProfile.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {giftProfile.interests.map((interest, index) => (
                      <div
                        key={index}
                        className="bg-white px-4 py-2 rounded-full text-[#6b7cff] font-medium flex items-center"
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 italic">
                    No interests added yet...
                  </div>
                )}
              </div>
            </div>

            {/* Description section */}
            <div>
              <h2 className="text-2xl font-black text-[#6b7cff] mb-4">
                Description
              </h2>
              <div className="bg-[#f5f5ff] p-4 rounded-xl min-h-[200px]">
                {giftProfile && giftProfile.about ? (
                  <p>{giftProfile.about}</p>
                ) : (
                  <p className="text-gray-400 italic">User Description...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question and input */}
      <div className="mt-12">
        <div className="flex justify-center">
          <Conversation
            dynamicVariables={{}}
            onMessage={onMessage}
            clearTranscript={clearTranscript}
            setInCall={setInCall}
            onToolUsed={onToolUsed}
            handleSubmitAnswer={handleSubmitAnswer}
            addToQuestions={addToQuestions}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-12 mb-6">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-black text-[#6b7cff]">
                Profile Completion
              </span>
              <span className="text-sm font-black text-[#6b7cff]">
                {giftProfile?.completed_percentage || 0}%
              </span>
            </div>
            <div className="w-full bg-[#FDE7FA] rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-[#6b7cff] to-[#e77ed6] h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${giftProfile?.completed_percentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;
