import React from 'react';

export type SwitchProps = {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
};

export const Switch = ({ checked, onChange, disabled }: SwitchProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-5.5 w-10 shrink-0 items-center rounded-full border-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none ${checked
        ? 'bg-indigo-600 border-indigo-700 shadow-sm shadow-indigo-500/20 ring-2 ring-indigo-500/20'
        : 'bg-slate-300 border-slate-400/90 shadow-inner'
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
      />
    </button>
  );
};
