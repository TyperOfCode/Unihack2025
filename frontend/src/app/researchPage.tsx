"use client";

import GradientButton from "@/components/GradientButton";
import { GiftUserProfile } from "@/types/profile";
import Image from "next/image";

interface ResearchPageProps {
  handleNext: () => void;
  handleBack: () => void;
  giftProfile: GiftUserProfile | null;
}

const ResearchPage: React.FC<ResearchPageProps> = ({
  handleNext,
  handleBack,
  giftProfile
}) => {
  return (
    <div className="w-full max-w-5xl">
      <div className="bg-white p-8 rounded-3xl shadow-md mb-8">
        <h2 className="text-3xl font-bold text-[#e77ed6] mb-6 text-center">Gift Profile Summary</h2>
        
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex-shrink-0 flex justify-center">
            <Image 
              src="/avatar-1.png"
              alt="Gift Box Character" 
              width={200} 
              height={200}
              className="object-contain"
              priority
            />
          </div>
          
          <div className="flex-grow">
            {giftProfile ? (
              <div className="space-y-6">
                {/* Profile Completion */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-black text-[#6b7cff]">Profile Completion</span>
                    <span className="text-sm font-black text-[#6b7cff]">
                      {giftProfile.completed_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-[#FDE7FA] rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-[#6b7cff] to-[#e77ed6] h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                      style={{ width: `${giftProfile.completed_percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* About Section */}
                <div>
                  <h3 className="text-xl font-bold text-[#6b7cff] mb-2">About</h3>
                  <div className="bg-[#f5f5ff] p-4 rounded-xl">
                    {giftProfile.about ? (
                      <p className="text-gray-700">{giftProfile.about}</p>
                    ) : (
                      <p className="text-gray-400 italic">No description available</p>
                    )}
                  </div>
                </div>
                
                {/* Interests Section */}
                <div>
                  <h3 className="text-xl font-bold text-[#6b7cff] mb-2">Interests</h3>
                  <div className="bg-[#f5f5ff] p-4 rounded-xl">
                    {giftProfile.interests && giftProfile.interests.length > 0 ? (
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
                      <p className="text-gray-400 italic">No interests identified</p>
                    )}
                  </div>
                </div>
                
                {/* Dislikes Section */}
                <div>
                  <h3 className="text-xl font-bold text-[#6b7cff] mb-2">Dislikes</h3>
                  <div className="bg-[#f5f5ff] p-4 rounded-xl">
                    {giftProfile.dislikes && giftProfile.dislikes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {giftProfile.dislikes.map((dislike, index) => (
                          <div 
                            key={index} 
                            className="bg-white px-4 py-2 rounded-full text-[#e77ed6] font-medium flex items-center"
                          >
                            {dislike}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">No dislikes identified</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-lg text-gray-700">No profile information available.</p>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-lg text-gray-700 mb-8 text-center">
          Based on this profile, we'll now search for the perfect gift recommendations.
        </p>
        
        <div className="flex justify-between">
          
          <GradientButton 
            onClick={handleNext}
            size="md"
            rounded="lg"
          >
            Next
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default ResearchPage; 