'use client';

import { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search by name, email, or company...', initialValue = '' }: SearchBarProps): JSX.Element {
  const [query, setQuery] = useState(initialValue);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2.5 pl-12 bg-surface-light border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text-main placeholder:text-slate-400 transition-all shadow-sm"
        placeholder={placeholder}
      />
    </div>
  );
}