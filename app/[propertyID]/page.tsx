import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { propertiesApi } from '@/lib/api/properties';
import ApartmentsList from '@/components/properties/ApartmentsList';
import PropertyActions from '@/components/properties/PropertyActions';

export default async function PropertyPage({ params }) {
    const { propertyID } = await params;

    const propertyResponse = await propertiesApi.getById(propertyID);
    const property = propertyResponse?.data || propertyResponse || null;
    const apartments = Array.isArray(property?.apartments) ? property.apartments : [];
    const employees = Array.isArray(property?.employees) ? property.employees : [];

    return (
        <div className="fade-up">
            <Link href="/" className="flex items-center gap-2 font-sans text-xs text-[var(--muted)]">
                <ArrowLeft size={14} /> All properties
            </Link>
            <div className="mt-8 border-b border-[var(--line)] pb-8">
                <div className="flex items-center justify-between">
                    <span className="font-sans text-[10px] font-bold uppercase tracking-[.18em] text-[var(--coral)]">
                        {property?.status ? property.status.replace('_', ' ') : 'Property unavailable'}
                    </span>
                    
                    {/* أزرار التعديل والحذف */}
                    {property && <PropertyActions propertyID={propertyID} />}
                </div>

                <h1 className="display mt-3 text-5xl">
                    {property?.name || 'Property unavailable'}
                </h1>
                <p className="mt-3 flex items-center gap-2 font-sans text-sm text-[var(--muted)]">
                    <MapPin size={15} />{property?.address || 'No address available'}
                </p>
            </div>
            <div className="grid gap-10 py-9 lg:grid-cols-[1fr_280px]">
                <div>
                    <ApartmentsList apartments={apartments} />
                </div>
                <aside className="border-l border-[var(--line)] pl-6">
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[.18em] text-[var(--muted)]">Assigned team</p>
                    <div className="mt-5 space-y-4">
                        {employees.map(e => (
                            <div key={e.employee.id} className="border-b border-[var(--line)] pb-3">
                                <p className="font-sans text-sm font-bold">{e.employee.name}</p>
                                <p className="mt-1 font-sans text-xs text-[var(--muted)]">{e.employee.phone}</p>
                            </div>
                        ))}
                        {!employees.length && <p className="font-sans text-sm text-[var(--muted)]">No team assigned yet.</p>}
                    </div>
                </aside>
            </div>
        </div>
    );
}