"use client";

import GradientButton from "@/components/GradientButton";
import Product from "@/models/product";
import Image from "next/image";

interface SummaryPageProps {
  products: Product[];
  handleBack: () => void;
  handleRestart: () => void;
}

const SummaryPage: React.FC<SummaryPageProps> = ({
  products,
  handleBack,
  handleRestart,
}) => {
  return (
    <div className="w-full max-w-5xl">
      <div className="bg-white p-6 rounded-3xl shadow-md mb-4">
        <h2 className="text-2xl font-bold text-[#e77ed6] mb-3 text-center">
          Perfect Gift Recommendations
        </h2>
        
        <p className="text-base text-gray-700 mb-4 text-center">
          Based on the profile, we've found these great gift ideas:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {products.map((product, index) => (
            <div 
              key={index} 
              className="bg-[#f5f5ff] rounded-xl overflow-hidden shadow-md flex flex-col h-full"
            >
              <div className="h-40 relative w-full bg-white">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-contain p-2"
                  priority
                />
              </div>
              
              <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-lg font-bold text-[#6b7cff] line-clamp-1">{product.name}</h3>
                  <span className="bg-gradient-to-r from-[#6b7cff] to-[#e77ed6] text-white rounded-full px-2 py-0.5 text-sm font-bold">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-2 text-xs line-clamp-2">{product.description}</p>
                
                <div className="bg-white p-2 rounded-lg mb-2">
                  <h4 className="text-[#e77ed6] font-bold text-xs mb-0.5">Why This Gift?</h4>
                  <p className="text-gray-700 text-xs line-clamp-2">{product.reason}</p>
                </div>
                
                <div className="bg-white p-2 rounded-lg mb-3">
                  <h4 className="text-[#e77ed6] font-bold text-xs mb-0.5">Review Summary</h4>
                  <p className="text-gray-700 text-xs italic line-clamp-2">{product.review_summary}</p>
                </div>
                
                <a 
                  href={product.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full mt-auto"
                >
                  <GradientButton size="sm" rounded="lg" fullWidth>
                    View Product
                  </GradientButton>
                </a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-4">
          <GradientButton
            onClick={handleBack}
            size="sm"
            rounded="lg"
          >
            Back
          </GradientButton>
          
          <GradientButton
            onClick={handleRestart}
            size="sm"
            rounded="lg"
          >
            Restart
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;