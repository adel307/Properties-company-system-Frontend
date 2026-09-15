'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
export default function Pagination({ page = 1, totalPages = 1, onChange }) { return <div className="flex items-center gap-3 font-sans text-xs text-[var(--muted)]"><button disabled={page <= 1} onClick={() => onChange(page - 1)} className="disabled:opacity-30" aria-label="Previous page"><ChevronLeft size={16} /></button><span>{page} / {totalPages}</span><button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="disabled:opacity-30" aria-label="Next page"><ChevronRight size={16} /></button></div>; }
