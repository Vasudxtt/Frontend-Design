import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SpinnerInputProps {
  label?: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  className?: string;
}

export function SpinnerInput({
  label,
  value,
  onChange,
  min = -99,
  max = 99,
  step = 1,
  prefix,
  className,
}: SpinnerInputProps) {
  const increment = () => onChange(Math.min(max, value + step));
  const decrement = () => onChange(Math.max(min, value - step));

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden w-28">
        <span className="flex-1 px-3 py-2 text-sm text-gray-900">
          {prefix}{value > 0 ? `+${value}` : value}
        </span>
        <div className="flex flex-col border-l border-gray-200">
          <button
            type="button"
            onClick={increment}
            className="px-1.5 py-0.5 hover:bg-gray-50 transition-colors"
          >
            <ChevronUp className="w-3 h-3 text-gray-500" />
          </button>
          <button
            type="button"
            onClick={decrement}
            className="px-1.5 py-0.5 hover:bg-gray-50 transition-colors border-t border-gray-200"
          >
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
