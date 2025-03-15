"use client";

import Image from "next/image";
import GradientButton from "@/components/GradientButton";


interface StartPageProps {
  handleGetStarted: () => void;
  isAnimating: boolean;
} 

export default function StartPage({ handleGetStarted, isAnimating }: StartPageProps) {
  return (
    // Landing page content
    <div className={`text-center transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
    <h1 className="text-5xl md:text-6xl font-bold text-[#e77ed6] mb-12">
      Gifty, Your gift assistant
    </h1>
    
    {/* Gift box character image */}
    <div className="relative w-64 h-64 mx-auto my-8">
      <Image 
        src="/avatar-1.png" 
        alt="Gift Box Character" 
        width={300} 
        height={300}
        className="object-contain"
        priority
      />
    </div>
    
    <GradientButton 
      onClick={handleGetStarted}
      size="lg"
      rounded="full"
      className="mt-8"
    >
      Get Started
    </GradientButton>
  </div>
  );
}