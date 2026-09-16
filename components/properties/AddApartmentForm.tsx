'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { propertiesApi } from '@/lib/api/properties'; 

interface AddApartmentFormProps {
    propertyID: string;
}

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
            // إرسال الـ Request بنفس هيكلة الـ Postman
            await propertiesApi.apartments.create({
                propertyId: propertyID,
                floor: Number(floor),
                number: number.trim(),
            });

            // إعادة تعيين الحقول وإغلاق الفورم
            setFloor('');
            setNumber('');
            setIsOpen(false);
            
            // إعادة تحميل بيانات الصفحة لعرض الشقة الجديدة
            router.refresh();
        } catch (err: any) {
            setError(err?.message || 'حدث خطأ أثناء إضافة الشقة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6 rounded-xl border border-[var(--line)] p-4 bg-[var(--card-bg,transparent)]">
            <div className="flex items-center justify-between">
                <h3 className="font-sans text-sm font-bold uppercase tracking-[.1em] text-[var(--foreground)]">
                    إضافة شقة جديدة
                </h3>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 rounded-lg bg-[var(--coral)] px-3 py-1.5 font-sans text-xs font-semibold text-white transition hover:opacity-90"
                >
                    <Plus size={14} />
                    {isOpen ? 'إلغاء' : 'إضافة شقة'}
                </button>
            </div>

            {isOpen && (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {error && (
                        <p className="rounded bg-red-500/10 p-2 font-sans text-xs text-red-500">
                            {error}
                        </p>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block font-sans text-xs text-[var(--muted)] mb-1">
                                رقم الدور (Floor)
                            </label>
                            <input
                                type="number"
                                required
                                value={floor}
                                onChange={(e) => setFloor(e.target.value ? Number(e.target.value) : '')}
                                placeholder="مثال: 3"
                                className="w-full rounded-lg border border-[var(--line)] bg-transparent px-3 py-2 font-sans text-sm outline-none focus:border-[var(--coral)]"
                            />
                        </div>

                        <div>
                            <label className="block font-sans text-xs text-[var(--muted)] mb-1">
                                رقم / اسم الشقة (Number)
                            </label>
                            <input
                                type="text"
                                required
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                placeholder="مثال: 3A"
                                className="w-full rounded-lg border border-[var(--line)] bg-transparent px-3 py-2 font-sans text-sm outline-none focus:border-[var(--coral)]"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg bg-[var(--foreground)] px-4 py-2 font-sans text-xs font-bold text-[var(--background)] disabled:opacity-50"
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