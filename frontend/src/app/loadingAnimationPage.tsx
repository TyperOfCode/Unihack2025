"use client";

import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Recommendation } from "@/models/recommendation";
import { GiftUserProfile } from "@/models/profile";

interface LoadingAnimationPageProps {
  handleNext: () => void;
  handleBack: () => void;
  chosenCategory: Recommendation;
  setProducts: Dispatch<SetStateAction<any[]>>;
  giftProfile: GiftUserProfile | null;
}

interface Position {
  x: number;
  y: number;
}

const LoadingAnimationPage: React.FC<LoadingAnimationPageProps> = ({
  handleNext,
  handleBack,
  chosenCategory: recommendation,
  setProducts,
  giftProfile,
}) => {
  // State for URLs fetched from backend
  const [urls, setUrls] = useState<string[]>([]);
  const [isUrlsFetched, setIsUrlsFetched] = useState(false);
  const [isProductsFetched, setIsProductsFetched] = useState(false);
  
  // Add refs to track if API calls have been made
  const urlsApiCallMade = useRef(false);
  const productsApiCallMade = useRef(false);
  
  // List of speech bubble comments
  const speechComments = [
    "Researching gifts...",
    "Looking at products!",
    "Reading links!",
    "Analyzing preferences...",
    "Finding matches...",
    "Checking reviews!",
    "Exploring options...",
    "Comparing items!",
    "Scanning trends...",
    "Discovering ideas!"
  ];

  // Reference to the container for positioning calculations
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use refs for animation values to avoid re-renders
  const avatarPositionRef = useRef<Position>({ x: 0, y: 0 });
  const targetPositionRef = useRef<Position>({ x: 0, y: 0 });
  const animationFrameIdRef = useRef<number | null>(null);
  
  // State for UI rendering
  const [avatarPosition, setAvatarPosition] = useState<Position>({ x: 0, y: 0 });
  const [targetTileIndex, setTargetTileIndex] = useState(0);
  const [tilePositions, setTilePositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState(speechComments[0]);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTileIndex, setDraggedTileIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  // Fetch URLs from backend when component mounts
  useEffect(() => {
    // Only run if the API call hasn't been made yet
    if (urlsApiCallMade.current) return;
    
    const fetchUrls = async () => {
      try {
        // Mark that we've started the API call
        urlsApiCallMade.current = true;
        
        const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const searchQuery = {
          query: `${recommendation.product} review guide 2025`
        };
        
        const response = await fetch(`${backend_url}/getURLS`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchQuery),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch URLs');
        }
        
        const data = await response.json();
        
        // Ensure we have at least some URLs to display
        if (data && Array.isArray(data) && data.length > 0) {
          // Limit to 20 URLs to avoid overwhelming the UI
          const limitedUrls = data.slice(0, 20);
          setUrls(limitedUrls);
          setIsUrlsFetched(true);
        } else {
          // Fallback to default keywords if no URLs are returned
          setUrls([
            "Gifts", "Hobbies", "Interests", "Preferences", "Favorites",
            "Personality", "Style", "Trends", "Unique", "Thoughtful",
            "Memorable", "Special", "Personalized", "Surprise", "Delight",
            "Creativity", "Passion", "Adventure", "Relaxation", "Experience"
          ]);
          setIsUrlsFetched(true);
        }
      } catch (error) {
        console.error('Error fetching URLs:', error);
        // Fallback to default keywords if there's an error
        setUrls([
          "Gifts", "Hobbies", "Interests", "Preferences", "Favorites",
          "Personality", "Style", "Trends", "Unique", "Thoughtful",
          "Memorable", "Special", "Personalized", "Surprise", "Delight",
          "Creativity", "Passion", "Adventure", "Relaxation", "Experience"
        ]);
        setIsUrlsFetched(true);
      }
    };
    
    fetchUrls();
    // Empty dependency array ensures this only runs once on mount
  }, [recommendation.product]);

  // Fetch products from backend
  useEffect(() => {
    // Only run if initialized, not already fetched, and API call hasn't been made
    if (!isInitialized || isProductsFetched || productsApiCallMade.current) return;
    
    const fetchProducts = async () => {
      // Mark that we've started the API call
      productsApiCallMade.current = true;
      
      try {
        const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        
        const response = await fetch(`${backend_url}/getProducts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: recommendation,
            profile: giftProfile
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        // Set the products in the parent component
        setProducts(data);
        setIsProductsFetched(true);
        
        // Set loading to false to proceed to next page
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Even if there's an error, we should still proceed after a delay
        setTimeout(() => {
          setIsLoading(false);
        }, 5000);
      }
    };

    // Remove the setTimeout and call fetchProducts directly
    fetchProducts();
    
  }, [isInitialized, isProductsFetched, recommendation, giftProfile, setProducts]);
  
  // Initialize positions once URLs are fetched and container is ready
  useEffect(() => {
    if (!containerRef.current || isInitialized || !isUrlsFetched || urls.length === 0) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    
    if (containerWidth === 0 || containerHeight === 0) return;
    
    // Generate random positions for each URL tile
    const positions = urls.map(() => {
      // Leave some margin from the edges
      const margin = Math.min(100, containerWidth * 0.1);
      const tileWidth = 150;
      const tileHeight = 50;
      
      return {
        x: Math.random() * (containerWidth - tileWidth - margin * 2) + margin,
        y: Math.random() * (containerHeight - tileHeight - margin * 2) + margin
      };
    });
    
    setTilePositions(positions);
    
    // Set initial avatar position to the first tile
    if (positions.length > 0) {
      avatarPositionRef.current = { ...positions[0] };
      setAvatarPosition(positions[0]);
      targetPositionRef.current = { ...positions[0] };
    }
    
    setIsInitialized(true);
  }, [containerRef, isInitialized, urls, isUrlsFetched]);
  
  // Set up target tile changing
  useEffect(() => {
    if (!isInitialized || tilePositions.length === 0) return;
    
    const changeTargetTile = () => {
      // Only change target if avatar is close enough to current target
      const dx = targetPositionRef.current.x - avatarPositionRef.current.x;
      const dy = targetPositionRef.current.y - avatarPositionRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If avatar is still far from target, don't change yet
      if (distance > 10) return;
      
      // Find a new target that's different from the current one
      let nextTileIndex;
      do {
        nextTileIndex = Math.floor(Math.random() * tilePositions.length);
      } while (nextTileIndex === targetTileIndex && tilePositions.length > 1);
      
      setTargetTileIndex(nextTileIndex);
      targetPositionRef.current = { ...tilePositions[nextTileIndex] };
      
      // Change speech bubble text when target changes
      const randomSpeechIndex = Math.floor(Math.random() * speechComments.length);
      setCurrentSpeech(speechComments[randomSpeechIndex]);
    };
    
    // Initial target after a short delay
    const initialDelay = setTimeout(() => {
      changeTargetTile();
      
      // Set up interval to change target tile every few seconds
      // Increased from 3000ms to 6000ms (6 seconds)
      const interval = setInterval(changeTargetTile, 6000);
      return () => clearInterval(interval);
    }, 1000); // Increased initial delay from 500ms to 1000ms
    
    return () => clearTimeout(initialDelay);
  }, [isInitialized, tilePositions, targetTileIndex]);
  
  // Animation loop
  useEffect(() => {
    if (!isInitialized || tilePositions.length === 0) return;
    
    const animate = () => {
      // Calculate direction vector
      const dx = targetPositionRef.current.x - avatarPositionRef.current.x;
      const dy = targetPositionRef.current.y - avatarPositionRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If we're close enough to the target, stop animation
      if (distance < 2) {
        avatarPositionRef.current = { ...targetPositionRef.current };
      } else {
        // Move a small step towards the target
        const speed = 2;
        const stepX = (dx / distance) * speed;
        const stepY = (dy / distance) * speed;
        
        avatarPositionRef.current = {
          x: avatarPositionRef.current.x + stepX,
          y: avatarPositionRef.current.y + stepY
        };
      }
      
      // Update state (less frequently to avoid too many re-renders)
      setAvatarPosition({ ...avatarPositionRef.current });
      
      // Continue animation
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationFrameIdRef.current = requestAnimationFrame(animate);
    
    // Clean up
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isInitialized, tilePositions]);
  
  // Auto-proceed to next page when loading is complete
  useEffect(() => {
    if (!isLoading) {
      handleNext();
    }
  }, [isLoading, handleNext]);
  
  // Handle mouse/touch events for dragging
  useEffect(() => {
    if (!isInitialized) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || draggedTileIndex === null) return;
      
      // Get container bounds for constraining movement
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      
      // Calculate new position relative to container
      const newX = e.clientX - containerRect.left - dragOffset.x;
      const newY = e.clientY - containerRect.top - dragOffset.y;
      
      // Update tile position
      const newPositions = [...tilePositions];
      newPositions[draggedTileIndex] = { x: newX, y: newY };
      setTilePositions(newPositions);
      
      // If this is the target tile, update the target position for the avatar
      if (draggedTileIndex === targetTileIndex) {
        targetPositionRef.current = { x: newX, y: newY };
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedTileIndex(null);
    };
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', (e) => {
      if (!isDragging || draggedTileIndex === null || !e.touches[0]) return;
      
      const touch = e.touches[0];
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      
      const newX = touch.clientX - containerRect.left - dragOffset.x;
      const newY = touch.clientY - containerRect.top - dragOffset.y;
      
      const newPositions = [...tilePositions];
      newPositions[draggedTileIndex] = { x: newX, y: newY };
      setTilePositions(newPositions);
      
      if (draggedTileIndex === targetTileIndex) {
        targetPositionRef.current = { x: newX, y: newY };
      }
      
      // Prevent default to avoid scrolling while dragging
      e.preventDefault();
    }, { passive: false });
    
    window.addEventListener('touchend', handleMouseUp);
    
    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove as any);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, draggedTileIndex, dragOffset, tilePositions, isInitialized, targetTileIndex]);
  
  // Handle starting drag
  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    // Don't allow dragging the target tile that the avatar is moving towards
    if (index === targetTileIndex) return;
    
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    
    // Calculate offset from mouse position to tile position
    const offsetX = e.clientX - containerRect.left - tilePositions[index].x;
    const offsetY = e.clientY - containerRect.top - tilePositions[index].y;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDraggedTileIndex(index);
    setIsDragging(true);
  };
  
  // Handle touch start for mobile
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    // Don't allow dragging the target tile that the avatar is moving towards
    if (index === targetTileIndex) return;
    
    const touch = e.touches[0];
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect || !touch) return;
    
    // Calculate offset from touch position to tile position
    const offsetX = touch.clientX - containerRect.left - tilePositions[index].x;
    const offsetY = touch.clientY - containerRect.top - tilePositions[index].y;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDraggedTileIndex(index);
    setIsDragging(true);
  };

  // Helper function to truncate URLs for display
  const formatUrlForDisplay = (url: string) => {
    try {
      const urlObj = new URL(url);
      // Return just the hostname and the first part of the path
      let displayText = urlObj.hostname.replace('www.', '');
      if (urlObj.pathname && urlObj.pathname !== '/') {
        // Add first part of path if it exists
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          displayText += `/${pathParts[0]}`;
        }
      }
      return displayText;
    } catch (e) {
      // If URL parsing fails, just return a truncated version
      return url;
    }
  };

  return (
    <div className="w-full h-full">
      {/* Animated flowing radial gradient background */}
      <div 
        className="absolute inset-0 z-0 overflow-hidden"
        style={{
          background: 'radial-gradient(circle at center, #FDE7FA, #e77ed6, #6b7cff, #F5C9EE)',
          backgroundSize: '200% 200%',
          animation: 'flowing-water 20s ease-in-out infinite',
        }}
      >
        {/* Add a blur effect */}
        <div className="absolute inset-0 backdrop-blur-md bg-white/20"></div>
      </div>

      {/* Add keyframes for the flowing water animation */}
      <style jsx global>{`
        @keyframes flowing-water {
          0% {
            background-position: 0% 0%;
          }
          25% {
            background-position: 100% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          75% {
            background-position: 0% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
        
        .tile {
          cursor: grab;
          transition: transform 0.2s, box-shadow 0.2s;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          touch-action: none;
        }
        
        .tile:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .tile:active {
          cursor: grabbing;
        }
        
        .tile.dragging {
          cursor: grabbing;
          transform: scale(1.1);
          box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.2);
          z-index: 50;
          transition: none;
        }
        
        .speech-bubble {
          position: absolute;
          background: white;
          border-radius: 1rem;
          padding: 0.75rem 1.25rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          font-size: 1rem;
          font-weight: 500;
          color: #6b7cff;
          border: 2px solid #e77ed6;
          white-space: nowrap;
          z-index: 30;
          transform: translateY(-70px);
          min-width: 180px;
          text-align: center;
        }
        
        .speech-bubble:after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          width: 0;
          height: 0;
          border: 10px solid transparent;
          border-top-color: white;
          border-bottom: 0;
          margin-left: -10px;
        }
        
        .speech-bubble:before {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 50%;
          width: 0;
          height: 0;
          border: 12px solid transparent;
          border-top-color: #e77ed6;
          border-bottom: 0;
          margin-left: -12px;
        }
      `}</style>

      <div className="relative z-10 bg-white/70 backdrop-blur-sm rounded-3xl shadow-md h-screen flex flex-col p-4 md:p-8">
        <h2 className="text-3xl font-bold text-[#e77ed6] mb-2 text-center">Researching Gift Ideas</h2>
        
        {/* Add disclaimer */}
        <div className="text-center mb-4 px-4 py-2 bg-[#FDE7FA] rounded-lg mx-auto max-w-md">
          <p className="text-[#6b7cff] font-medium">
            Please don't reload the page. Our AI is searching for the perfect gifts, which may take a moment (up to 3 minutes).
          </p>
        </div>
        
        <div 
          ref={containerRef} 
          className="relative w-full flex-grow overflow-hidden"
        >
          {/* URL tiles */}
          {isInitialized && tilePositions.map((position, index) => (
            <div
              key={index}
              className={`absolute px-4 py-2 rounded-xl shadow-md tile ${
                targetTileIndex === index ? 'bg-[#FDE7FA] scale-110' : 'bg-[#f5f5ff]'
              } ${draggedTileIndex === index ? 'dragging' : ''}`}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: targetTileIndex === index ? 'scale(1.1)' : 'scale(1)',
                zIndex: draggedTileIndex === index ? 50 : (targetTileIndex === index ? 10 : 1),
                cursor: targetTileIndex === index ? 'default' : (isDragging && draggedTileIndex === index ? 'grabbing' : 'grab'),
                transition: isDragging && draggedTileIndex === index ? 'none' : 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseDown={(e) => handleMouseDown(e, index)}
              onTouchStart={(e) => handleTouchStart(e, index)}
            >
              <span className={`font-medium select-none ${
                targetTileIndex === index ? 'text-[#e77ed6]' : 'text-[#6b7cff]'
              }`}>
                {formatUrlForDisplay(urls[index])}
              </span>
            </div>
          ))}
          
          {/* Floating avatar with speech bubble */}
          {isInitialized && (
            <div
              className="absolute"
              style={{
                left: `${avatarPosition.x}px`,
                top: `${avatarPosition.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 20
              }}
            >
              {/* Speech bubble */}
              <div className="speech-bubble">
                {currentSpeech}
              </div>
              
              <Image
                src="/avatar-3.png"
                alt="Gift Box Character"
                width={100}
                height={100}
                className="object-contain"
                priority
              />
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse text-lg font-medium text-[#6b7cff]">
              Finding the perfect gift for you
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-[#6b7cff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#6b7cff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#6b7cff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default LoadingAnimationPage; 