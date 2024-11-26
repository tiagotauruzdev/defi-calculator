import React from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
}

export function Tooltip({ content }: TooltipProps) {
  return (
    <div className="group relative inline-block ml-2">
      <Info className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 left-1/2">
        {content}
      </div>
    </div>
  );
}