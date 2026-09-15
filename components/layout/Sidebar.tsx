import Link from 'next/link';
import { ArrowUpRight, ClipboardPlus, Receipt, Store, Users, type LucideIcon } from 'lucide-react';

const actions: Array<[string, string, LucideIcon]> = [['/employees', 'Add employee', Users], ['/suppliers', 'Add supplier', Store], ['/materials', 'Add material', ClipboardPlus], ['/expenses', 'Add expense', Receipt]];
export default function Sidebar() {
  return <aside className="hidden w-52 shrink-0 lg:block"><div className="sticky top-6"><p className="mb-3 font-sans text-[10px] font-bold uppercase tracking-[.2em] text-[var(--muted)]">Quick actions</p><div className="space-y-2">{actions.map(([href, label, Icon]) => <Link key={label} href={href} className="group flex items-center justify-between border-b border-[var(--line)] py-3 font-sans text-sm text-[var(--ink)]"><span className="flex items-center gap-3"><Icon size={16} className="text-[var(--teal)]" />{label}</span><ArrowUpRight size={14} className="text-[var(--muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>)}</div><div className="mt-12 border-l-2 border-[var(--sun)] pl-4"><p className="font-sans text-xs leading-5 text-[var(--muted)]">Keep every moving part visible. The best decisions start with a clear picture.</p></div></div></aside>;
}
