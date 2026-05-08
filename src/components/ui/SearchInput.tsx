'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
  );
}
