'use client';
import { Search } from 'lucide-react';
export default function SearchBar({ value, onChange, placeholder = 'Search records...' }) { return <label className="flex w-full items-center gap-3 border-b border-[var(--ink)] py-2 font-sans text-sm sm:max-w-xs"><Search size={16} className="text-[var(--muted)]" /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--muted)]" /></label>; }
