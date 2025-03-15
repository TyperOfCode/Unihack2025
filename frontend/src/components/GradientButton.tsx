"use client";

import React from 'react';

export interface GradientButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'full' | 'lg' | 'md';
  disabled?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  onClick,
  children,
  className = '',
  type = 'button',
  fullWidth = false,
  size = 'md',
  rounded = 'full',
  disabled = false,
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-xl',
  };

  // Rounded classes
  const roundedClasses = {
    full: 'rounded-full',
    lg: 'rounded-lg',
    md: 'rounded-md',
  };

  // Width classes
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Disabled classes
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`font-bold text-white transition-all duration-300 shadow-lg relative overflow-hidden group ${sizeClasses[size]} ${roundedClasses[rounded]} ${widthClass} ${disabledClasses} ${className}`}
      style={{ 
        background: "linear-gradient(to right, #E77ED6, #E87BB3, #E77ED6)",
        backgroundSize: "200% auto",
      }}
    >
      <span className={`relative z-10 transition-transform duration-300 ${!disabled ? 'group-hover:scale-110' : ''} inline-block`}>
        {children}
      </span>
      {!disabled && (
        <span 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ 
            background: "linear-gradient(to right, #E87BB3, #E77ED6, #E87BB3)",
            backgroundSize: "200% auto",
            animation: "gradient-shift 3s ease infinite",
          }}
        ></span>
      )}
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
      `}</style>
    </button>
  );
};

export default GradientButton; 