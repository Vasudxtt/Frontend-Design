import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  white?: boolean;
}

export function Logo({ size = 'md', white }: LogoProps) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };
  const iconSizes = { sm: 20, md: 28, lg: 36 };
  const s = iconSizes[size];

  return (
    <div className={`inline-flex items-center gap-1.5 font-bold ${sizes[size]}`}>
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
        <path
          d="M8 24 L12 12 L20 20 L24 8"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="24" cy="8" r="3" fill="white" opacity="0.9" />
        <circle cx="8" cy="24" r="2" fill="white" opacity="0.7" />
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
      <span className={white ? 'text-white' : 'text-gray-900'}>
        Prep<span className={white ? 'text-blue-300' : 'text-primary-600'}>Route</span>
      </span>
    </div>
  );
}
