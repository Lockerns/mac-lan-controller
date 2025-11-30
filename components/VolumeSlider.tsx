import React, { useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VolumeSliderProps {
  value: number;
  onChange: (val: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const VolumeSlider: React.FC<VolumeSliderProps> = ({ value, onChange, isMuted, onToggleMute }) => {
  const sliderRef = useRef<HTMLInputElement>(null);

  // Update background gradient based on value
  useEffect(() => {
    if (sliderRef.current) {
      const percentage = value;
      sliderRef.current.style.background = `linear-gradient(to right, white ${percentage}%, rgba(255, 255, 255, 0.2) ${percentage}%)`;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="w-full bg-white/10 backdrop-blur-xl rounded-3xl p-4 flex items-center gap-4 border border-white/5 shadow-xl">
      <button 
        onClick={onToggleMute}
        className="text-white/80 hover:text-white transition-colors"
      >
        {isMuted || value === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>
      
      <div className="relative flex-1 h-12 flex items-center group">
        <input
          ref={sliderRef}
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleChange}
          className="w-full h-2 rounded-full cursor-pointer appearance-none transition-all duration-300 hover:h-3"
        />
      </div>
      
      <span className="text-sm font-medium text-white/60 min-w-[2rem] text-right">
        {value}%
      </span>
    </div>
  );
};