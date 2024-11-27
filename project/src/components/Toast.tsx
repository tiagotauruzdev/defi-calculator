import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div
        className={`flex items-center p-4 rounded-lg shadow-lg ${
          type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white min-w-[300px]`}
      >
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 mr-3" />
        ) : (
          <AlertCircle className="w-5 h-5 mr-3" />
        )}
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="ml-3 hover:opacity-80 transition-opacity"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
