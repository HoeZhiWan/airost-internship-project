import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingTab = () => {
  return (
    <div className="flex flex-col gap-4 w-full m-4 items-center justify-center">
      <FaSpinner className="animate-spin w-4 h-4" /><div className="text-xl">Loading...</div>
    </div>
  );
};

export default LoadingTab;