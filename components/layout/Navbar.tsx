import Link from 'next/link';
import { Bell, CircleUserRound, Menu } from 'lucide-react';

export default function Navbar() {
  return <header className="border-b border-[var(--line)] bg-[var(--card)]">
    <div className="mx-auto flex h-[72px] max-w-[1480px] items-center justify-between px-5 lg:px-8">
      <Link href="/" className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center bg-[var(--teal)] text-xl text-white">F</span>
        <span><strong className="display block text-xl">Fieldwork</strong><small className="font-sans text-[10px] uppercase tracking-[.18em] text-[var(--muted)]">Build with intention</small></span>
      </Link>
      <nav className="hidden items-center gap-7 font-sans text-sm text-[var(--muted)] md:flex">
        <Link href="/" className="hover:text-[var(--teal)]">Overview</Link><Link href="/employees" className="hover:text-[var(--teal)]">People</Link><Link href="/suppliers" className="hover:text-[var(--teal)]">Suppliers</Link><Link href="/expenses" className="hover:text-[var(--teal)]">Finance</Link>
      </nav>
      <div className="flex items-center gap-4 text-[var(--muted)]"><button aria-label="Notifications"><Bell size={19} /></button><span className="hidden h-6 w-px bg-[var(--line)] sm:block" /><button className="flex items-center gap-2" aria-label="Open account"><CircleUserRound size={22} /><span className="hidden font-sans text-xs sm:block">Operations</span></button><Menu className="md:hidden" size={21} /></div>
    </div>
  </header>;
}
