'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  ClipboardPlus,
  ScrollText,
  Receipt,
  Store,
  Users,
  House,
  Building2,
  FileKey,
  UserCheck,
  CreditCard,
  ArrowLeftRight,
  Bot,
  X,
  type LucideIcon,
} from 'lucide-react';
import { SidebarProps } from '@/types/common';

const actions: Array<[string, string, LucideIcon]> = [
  ['/', 'Overview', House],
  ['/apartments', 'Apartments', Building2],
  ['/employees', 'Employees', Users],
  ['/tenants', 'Tenants', UserCheck],
  ['/suppliers', 'Suppliers', Store],
  ['/materials', 'Materials', ClipboardPlus],
  ['/leases', 'Leases', FileKey],
  ['/LeasePayment', 'Lease Payments', CreditCard],
  ['/PaymentTransaction', 'Payment Transactions', ArrowLeftRight],
  ['/ai-chat', 'AI Chat', Bot],
  ['/expenses', 'Finance', Receipt],
  ['/audit-logs', 'Audit Logs', ScrollText],
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* 1. Backdrop مع Blur يغطي كامل الشاشة خلف القائمة */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-md transition-opacity duration-300"
      />

      {/* 2. Sidebar Drawer عائم فوق المحتوى */}
      <aside className="fixed top-0 bottom-0 right-0 z-50 w-80 max-w-[85vw] border-l border-neutral-800/80 bg-neutral-950/95 p-6 backdrop-blur-xl shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300">
        <nav className="w-full">
          {/* Header القائمة */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-800/80">
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-400">
              Navigation
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* روابط التنقل */}
          <div className="space-y-2">
            {actions.map(([href, label, Icon], index) => {
              return (
                <Link
                  key={label}
                  href={href}
                  onClick={onClose}
                  className="group flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-900/40 px-4 py-3.5 transition-all duration-200 hover:border-teal-500/40 hover:bg-neutral-800/80 active:scale-[0.98]"
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