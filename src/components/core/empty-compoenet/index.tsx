
import React from 'react';

interface EmptyComponentProps {
  image: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void; // optional click handler
  isbutton?: boolean;
}

const EmptyComponent: React.FC<EmptyComponentProps> = ({
  image,
  title,
  subtitle,
  buttonText,
  onButtonClick,
  isbutton,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full ">
      {/* Image */}
      <img src={image} alt={title} className="w-[160px] h-[160px] mb-4" />

      {/* Title */}
      <h2 className="text-[20px] font-semibold text-gray-900  text-center">
        {title}
      </h2>

      {/* Subtitle */}
      <p className="text-[#4D4D4D] text-[14px] text-base mb-3 text-center">
        {subtitle}
      </p>

      {/* Button */}
      {isbutton && (
        <button
          onClick={onButtonClick}
          className="flex items-center gap-2 px-6 py-3 bg-[#ECEAFD] hover:bg-purple-200 text-[14px] text-[#683BD4] h-[40px] font-medium rounded-xl transition-all"
        >
          <span className="text-[20px]">+</span>
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyComponent;
