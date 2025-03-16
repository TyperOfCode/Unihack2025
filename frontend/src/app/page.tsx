"use client";

import { useState, useEffect } from "react";
import StartPage from "./startPage";
import QuestionPage from "./questionPage";
import ProfileSummaryPage from "./profileSummaryPage";
import NotePage from "./notePage";
import LoadingAnimationPage from "./loadingAnimationPage";
import SummaryPage from "./summaryPage";
import { GiftUserProfile } from "@/types/profile";
import { pingServer } from "@/lib/api";

// Define page states as an enum
export enum PageState {
  START = "start",
  QUESTION = "question",
  RESEARCH = "research",  
  NOTE = "note",
  LOADING_ANIMATION = "loading_animation",
  SUMMARY = "summary"
}

export default function Home() {
  const [pageState, setPageState] = useState<PageState>(PageState.START);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [giftProfile, setGiftProfile] = useState<GiftUserProfile | null>({
    completed_percentage: 0,
    interests: [],
    dislikes: [],
    about: ""
  });
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [serverError, setServerError] = useState<string | null>(null);

  // Check if the server is running
  useEffect(() => {
    const checkServer = async () => {
      try {
        await pingServer();
        setServerStatus('connected');
        setServerError(null);
      } catch (error) {
        console.error('Server connection error:', error);
        setServerStatus('error');
        setServerError(error instanceof Error ? error.message : 'Could not connect to the server');
      }
    };

    checkServer();
  }, []);

  const navigateTo = (newState: PageState) => {
    setIsAnimating(true);
    setTimeout(() => {
      setPageState(newState);
      setIsAnimating(false);
    }, 500);
  };

  // Render the appropriate page based on the current state
  const renderPage = () => {
    // If we're still checking server status or there's an error, show a message
    if (serverStatus === 'checking') {
      return (
        <div className="text-center p-8 bg-white rounded-3xl shadow-md">
          <h2 className="text-2xl font-bold text-[#e77ed6] mb-4">Connecting to server...</h2>
          <div className="flex justify-center">
            <svg className="animate-spin h-10 w-10 text-[#e77ed6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      );
    }

    if (serverStatus === 'error') {
      return (
        <div className="text-center p-8 bg-white rounded-3xl shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Server Connection Error</h2>
          <p className="text-lg text-gray-700 mb-6">
            Could not connect to the backend server. Please make sure it's running.
          </p>
          {serverError && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-left">
              <p className="font-medium">Error details:</p>
              <p>{serverError}</p>
            </div>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#e77ed6] text-white rounded-lg hover:bg-[#d66ec5] transition-colors"
          >
            Retry Connection
          </button>
        </div>
      );
    }

    const recommendation = {
      product: "Gaming Keyboard",
      reason: "They love to game and they need a new keyboard",
      price: 50
    }

    switch (pageState) {
      case PageState.START:
        return (
          <StartPage 
            handleGetStarted={() => navigateTo(PageState.QUESTION)} 
            isAnimating={isAnimating} 
          />
        );
      case PageState.QUESTION:
        return (
          <QuestionPage 
            isAnimating={isAnimating}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleNext={() => navigateTo(PageState.RESEARCH)}
            handleBackToHome={() => navigateTo(PageState.START)}
            giftProfile={giftProfile}
            setGiftProfile={setGiftProfile}
          />
        );
      case PageState.RESEARCH:
        return (
          <ProfileSummaryPage 
            handleNext={() => navigateTo(PageState.NOTE)}
            handleBack={() => navigateTo(PageState.QUESTION)}
            giftProfile={giftProfile}
          />
        );
      case PageState.NOTE:
        return (
          <NotePage 
            handleNext={() => navigateTo(PageState.LOADING_ANIMATION)}
            handleBack={() => navigateTo(PageState.RESEARCH)}
            giftProfile={giftProfile}
          />
        );
      case PageState.LOADING_ANIMATION:
        return (
          <LoadingAnimationPage 
            handleNext={() => navigateTo(PageState.SUMMARY)}
            handleBack={() => navigateTo(PageState.NOTE)}
            chosenCategory={recommendation}
          />
        );
      case PageState.SUMMARY:
        return (
          <SummaryPage 
            handleRestart={() => {
              setGiftProfile(null);
              navigateTo(PageState.START);
            }}
            handleBack={() => navigateTo(PageState.LOADING_ANIMATION)}
            giftProfile={giftProfile}
          />
        );
      default:
        return <StartPage handleGetStarted={() => navigateTo(PageState.QUESTION)} isAnimating={isAnimating} />;
    }
  };

  // Determine if we should use full-width container for certain pages
  const isFullWidthPage = pageState === PageState.LOADING_ANIMATION;

  return (
    <div 
      className={`flex flex-col items-center justify-center min-h-screen ${isFullWidthPage ? 'p-0' : 'px-4'}`}
      style={{ 
        background: "radial-gradient(circle, #FDE7FA 0%, #F5C9EE 100%)"
      }}
    >
      <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${isFullWidthPage ? 'w-full h-full' : ''}`}>
        {renderPage()}
      </div>
    </div>
  );
}
