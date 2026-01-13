
import React from 'react';

interface SpinnerProps {
  className?: string; 
}

const Spinner: React.FC<SpinnerProps> = ({ className }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
};

export default Spinner;
