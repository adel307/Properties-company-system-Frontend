import Link from 'next/link';
import { Bell, CircleUserRound, Menu } from 'lucide-react';
import { NavbarProps } from '@/types/common';

export default function Navbar({ onMenuToggle }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1480px] items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500 text-xl font-black text-slate-950 shadow-md shadow-teal-500/20 group-hover:bg-teal-400 transition-all duration-200">
            REC
          </span>
          <span>
            <strong className="block text-xl font-extrabold tracking-tight text-white group-hover:text-teal-400 transition-colors">
              REC company
            </strong>
            <small className="block font-sans text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
              Build with intention
            </small>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 font-sans text-sm font-medium text-slate-400 md:flex">
          <Link href="/" className="hover:text-teal-400 transition-colors">
            Overview
          </Link>
          <Link href="/employees" className="hover:text-teal-400 transition-colors">
            Employee
          </Link>
          <Link href="/suppliers" className="hover:text-teal-400 transition-colors">
            Suppliers
          </Link>
          <Link href="/materials" className="hover:text-teal-400 transition-colors">
            Materials
          </Link>
          <Link href="/expenses" className="hover:text-teal-400 transition-colors">
            Finance
          </Link>
        </nav>

        <div className="flex items-center gap-4 text-slate-400">
          <button 
            aria-label="Notifications" 
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          >
            <Bell size={19} />
          </button>
          
          <span className="hidden h-6 w-px bg-slate-800 sm:block" />

          <button 
            className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors" 
            aria-label="Open account"
          >
            <CircleUserRound size={22} className="text-teal-400" />
            <span className="hidden font-sans text-xs font-semibold sm:block">
              Operations
            </span>
          </button>

          <button 
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white md:hidden transition-colors" 
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>
        </div>
      </div>
    </header>
  );
}