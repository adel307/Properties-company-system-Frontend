'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, X } from 'lucide-react';
import { propertiesApi } from '@/lib/api/properties'; 
import { AddApartmentFormProps } from '@/types/properties';

export default function AddApartmentForm({ propertyID }: AddApartmentFormProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [floor, setFloor] = useState<number | ''>('');
    const [number, setNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (floor === '' || !number.trim()) return;

        setLoading(true);
        setError(null);

        try {
            await propertiesApi.apartments.create({
                propertyId: propertyID,
                floor: Number(floor),
                number: number.trim(),
            });

            setFloor('');
            setNumber('');
            setIsOpen(false);
            
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err?.message : 'حدث خطأ أثناء إضافة الشقة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 shadow-xl backdrop-blur-md transition-all">
            <div className="flex items-center justify-between">
                <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-teal-400">
                    إضافة شقة جديدة
                </h3>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 px-3.5 py-2 font-sans text-xs font-semibold text-teal-300 transition-all hover:bg-teal-500/20 hover:border-teal-500/40 active:scale-95"
                >
                    {isOpen ? (
                        <>
                            <X size={14} />
                            إلغاء
                        </>
                    ) : (
                        <>
                            <Plus size={14} />
                            إضافة شقة
                        </>
                    )}
                </button>
            </div>

            {isOpen && (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4 border-t border-neutral-800/80 pt-4 animate-fade-in-up">
                    {error && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 font-sans text-xs text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block font-sans text-xs font-semibold text-neutral-400 mb-1.5">
                                رقم الدور (Floor)
                            </label>
                            <input
                                type="number"
                                required
                                value={floor}
                                onChange={(e) => setFloor(e.target.value ? Number(e.target.value) : '')}
                                placeholder="مثال: 3"
                                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-2.5 font-sans text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50"
                            />
                        </div>

                        <div>
                            <label className="block font-sans text-xs font-semibold text-neutral-400 mb-1.5">
                                رقم / اسم الشقة (Number)
                            </label>
                            <input
                                type="text"
                                required
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                placeholder="مثال: 3A"
                                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-2.5 font-sans text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-all focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 font-sans text-xs font-bold text-neutral-950 transition-all hover:bg-teal-400 disabled:opacity-50 active:scale-95 shadow-lg shadow-teal-500/10"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            حفظ الشقة
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}