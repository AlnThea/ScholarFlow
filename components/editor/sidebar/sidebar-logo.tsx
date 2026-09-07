import React from 'react';

export function SidebarLogo({ className = "h-8 w-8 flex-shrink-0" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6a11cb" />
          <stop offset="100%" stopColor="#2575fc" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#logoGradient)" />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontWeight="bold"
        fontSize="9"
        fill="white"
      >
        SF
      </text>
    </svg>
  );
}
