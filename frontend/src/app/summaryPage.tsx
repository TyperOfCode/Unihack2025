"use client";

import GradientButton from "@/components/GradientButton";
import { GiftUserProfile } from "@/types/profile";

interface SummaryPageProps {
  handleRestart: () => void;
  handleBack: () => void;
  giftProfile: GiftUserProfile | null;
}

const SummaryPage: React.FC<SummaryPageProps> = ({
  handleRestart,
  handleBack,
  giftProfile
}) => {
  return (
    <div className="w-full max-w-5xl">
      <div className="bg-white p-8 rounded-3xl shadow-md mb-8">
        <h2 className="text-3xl font-bold text-[#e77ed6] mb-6 text-center">Summary Page</h2>
        <p className="text-lg text-gray-700 mb-8 text-center">
          This is a placeholder for the summary page where users will see gift recommendations.
        </p>
        
        <div className="flex justify-between">
          <GradientButton 
            onClick={handleBack}
            size="md"
            rounded="lg"
          >
            Back
          </GradientButton>
          
          <GradientButton 
            onClick={handleRestart}
            size="md"
            rounded="lg"
          >
            Start Over
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage; 