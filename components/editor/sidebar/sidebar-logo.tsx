import React from 'react';

export function SidebarLogo({ className = "h-8 w-8 flex-shrink-0" }: { className?: string }) {
  return (
    <img
      src="/assets/navbar-logo-40x40.png"
      alt="ScholarFlow Logo"
      className={`${className} rounded-lg object-contain shadow-sm`}
    />
  );
}
