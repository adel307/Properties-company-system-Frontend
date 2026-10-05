'use client';

import Link from 'next/link';
import { Bell, CircleUserRound, Menu } from 'lucide-react';
import { NavbarProps } from '@/types/common';

export default function Navbar({ onMenuToggle }: NavbarProps) {
  return (
    <div className="mx-auto flex h-[72px] max-w-[1480px] items-center justify-between px-5 lg:px-8">
      
      {/* جهة اليسار: زر القائمة + اللوجو والعلامة التجارية */}
      <div className="flex items-center gap-4">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500 font-black text-xl text-slate-950 shadow-md shadow-teal-500/20 transition-all duration-200 group-hover:bg-teal-400">
            REC
          </span>
          <span>
            <strong className="block font-extrabold text-xl text-white tracking-tight transition-colors group-hover:text-teal-400">
              REC company
            </strong>
            <small className="block font-bold font-sans text-[10px] text-slate-400 tracking-[.18em] uppercase">
              Build with intention
            </small>
          </span>
        </Link>
      </div>

      {/* أدوات وأزرار الحساب والإشعارات */}
      <div className="flex items-center gap-4 text-slate-400">
        <button
          type="button"
          aria-label="Notifications" 
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
        >
          <Bell size={19} />
        </button>
        
        <span className="hidden h-6 w-px bg-slate-800 sm:block" />

        <button
          type="button"
          className="flex items-center gap-2.5 rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-900 hover:text-white" 
          aria-label="Open account"
        >
          <CircleUserRound size={22} className="text-teal-400" />
          <span className="hidden font-bold font-sans text-xs sm:block">
            Operations
          </span>
        </button>

        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </div>

    </div>
  );
}