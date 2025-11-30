import React from 'react';

interface ControlBtnProps {
  onClick: () => void;
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  active?: boolean;
  className?: string;
  disabled?: boolean;
}

export const ControlBtn: React.FC<ControlBtnProps> = ({ 
  onClick, 
  icon, 
  size = 'md', 
  active = false,
  className = '',
  disabled = false
}) => {
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const baseClasses = "flex items-center justify-center rounded-full transition-all duration-200 active:scale-90 shadow-lg backdrop-blur-md";
  
  const activeClasses = active 
    ? "bg-white text-black shadow-white/20" 
    : "bg-white/10 text-white hover:bg-white/20 border border-white/5";

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed active:scale-100" : "cursor-pointer";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${activeClasses} ${disabledClasses} ${className}`}
      disabled={disabled}
    >
      {icon}
    </button>
  );
};