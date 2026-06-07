import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  label,
  placeholder = 'Choose from Drop-down',
  options,
  value,
  onChange,
  error,
  disabled,
  className,
}: SelectProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            'w-full appearance-none px-3 py-2.5 text-sm border rounded-lg bg-white pr-10',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            !value ? 'text-gray-400' : 'text-gray-900',
            error ? 'border-red-400' : 'border-gray-300 hover:border-gray-400'
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
