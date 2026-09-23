'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { propertiesApi } from "../../lib/api/properties"

export default function PropertyActions({ propertyID }) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const res = await propertiesApi.delete(propertyID);
            setIsDeleteOpen(false);
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Failed to delete property:', error);
            alert('حدث خطأ أثناء حذف العقار');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            {/* أزرار التحكم */}
            <div className="flex items-center gap-2">
                <Link 
                    href={`/${propertyID}/edit`}
                    className="flex items-center gap-1.5 rounded-md border border-[var(--line)] px-3 py-1.5 font-sans text-xs font-medium hover:bg-[var(--line)] transition-colors"
                >
                    <Pencil size={13} /> Edit
                </Link>
                
                <button 
                    onClick={() => setIsDeleteOpen(true)}
                    className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 font-sans text-xs font-medium text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                >
                    <Trash2 size={13} /> Delete
                </button>
            </div>

            {/* نافذة التأكيد Modal */}
            {isDeleteOpen && (
                <div 
                    onClick={() => !isDeleting && setIsDeleteOpen(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm cursor-pointer"
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md cursor-default rounded-xl bg-[var(--bg,white)] p-6 shadow-xl border border-[var(--line)] animate-in fade-in zoom-in-95 duration-200"
                    >
                        <div className="flex items-center gap-3 text-red-600">
                            <div className="rounded-full bg-red-100 p-2">
                                <AlertTriangle size={20} />
                            </div>
                            <h3 className="font-sans text-lg font-bold">Delete Property</h3>
                        </div>
                        
                        <p className="mt-3 font-sans text-sm text-[var(--muted)]">
                            Are you sure you want to delete this property? This action cannot be undone and will remove all associated data.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsDeleteOpen(false)}
                                disabled={isDeleting}
                                className="rounded-md border border-[var(--line)] px-4 py-2 font-sans text-xs font-medium hover:bg-[var(--line)] transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 font-sans text-xs font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" /> Deleting...
                                    </>
                                ) : (
                                    'Yes, Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}