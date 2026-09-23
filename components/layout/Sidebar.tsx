'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  ClipboardPlus,
  Receipt,
  Store,
  Users,
  House,
  X,
  type LucideIcon,
} from 'lucide-react';
import { SidebarProps } from '@/types/common';

const actions: Array<[string, string, LucideIcon]> = [
  ['/', 'Home', House],
  ['/employees', 'Employees', Users],
  ['/suppliers', 'Suppliers', Store],
  ['/materials', 'Materials', ClipboardPlus],
  ['/expenses', 'Expenses', Receipt],
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {/* 1. Backdrop for Mobile & Tablet */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-neutral-950/80 backdrop-blur-sm md:hidden transition-opacity duration-300"
        />
      )}

      {/* 2. Sidebar Drawer / Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-72 border-r border-neutral-800/80 bg-neutral-950 p-6 transition-transform duration-300 ease-in-out md:static md:z-auto md:w-full md:border-none md:bg-transparent md:p-0 md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <nav className="w-full">
          {/* Header in Mobile View */}
          <div className="flex items-center justify-between mb-6 md:hidden">
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-400">
              Navigation
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <p className="hidden md:block mb-4 font-sans text-xs font-bold uppercase tracking-widest text-neutral-400">
            Quick actions
          </p>

          <div className="space-y-2">
            {actions.map(([href, label, Icon], index) => {
              const bgStyle = {
                backgroundColor: `rgba(255, 255, 255, ${0.02 + index * 0.025})`,
                animationDelay: `${index * 80}ms`,
                animationFillMode: 'forwards' as const,
              };

              return (
                <Link
                  key={label}
                  href={href}
                  onClick={onClose}
                  style={bgStyle}
                  className="group flex items-center justify-between rounded-xl border border-neutral-800/80 px-4 py-3.5 transition-all duration-300 ease-out hover:border-teal-500/40 hover:bg-neutral-800/60 active:scale-[0.98] animate-fade-in-up"
                >
                  <span className="flex items-center gap-3.5 font-sans text-sm font-medium text-neutral-300 transition-colors group-hover:text-white truncate">
                    <Icon
                      size={18}
                      className="text-teal-400 shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:text-teal-300"
                    />
                    <span className="truncate">{label}</span>
                  </span>

                  <ArrowUpRight
                    size={16}
                    className="text-neutral-500 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-400"
                  />
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}