import Link from 'next/link';
import { ArrowLeft, MapPin, Building2, Maximize2, Calendar, UserCheck } from 'lucide-react';
import { propertiesApi } from '@/lib/api/properties';
import ApartmentsList from '@/components/properties/ApartmentsList';
import PropertyActions from '@/components/properties/PropertyActions';
import AddApartmentForm from '@/components/properties/AddApartmentForm'; // <--- إضافة المكون الجديد

export default async function PropertyPage({ params }: { params: Promise<{ propertyID: string }> }) {
    const { propertyID } = await params;

    const propertyResponse = await propertiesApi.getById(propertyID);
    const property = propertyResponse?.data || propertyResponse || null;
    
    const apartments = Array.isArray(property?.apartments) ? property.apartments : [];
    const employees = Array.isArray(property?.employees) ? property.employees : [];

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'غيرحدد';
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

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
                    
                    {property && <PropertyActions propertyID={propertyID} />}
                </div>

                <h1 className="display mt-3 text-5xl">
                    {property?.name || 'Property unavailable'}
                </h1>
                
                <p className="mt-3 flex items-center gap-2 font-sans text-sm text-[var(--muted)]">
                    <MapPin size={15} />{property?.address || 'No address available'}
                </p>

                {property && (
                    <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-[var(--line)] p-4 sm:grid-cols-4">
                        <div className="flex items-center gap-3">
                            <Building2 size={18} className="text-[var(--muted)]" />
                            <div>
                                <p className="font-sans text-[10px] text-[var(--muted)] uppercase">عدد الأدوار</p>
                                <p className="font-sans text-sm font-bold">{property.floorsNumber ?? '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Maximize2 size={18} className="text-[var(--muted)]" />
                            <div>
                                <p className="font-sans text-[10px] text-[var(--muted)] uppercase">المساحة</p>
                                <p className="font-sans text-sm font-bold">{property.area ? `${property.area} م²` : '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar size={18} className="text-[var(--muted)]" />
                            <div>
                                <p className="font-sans text-[10px] text-[var(--muted)] uppercase">تاريخ البداية</p>
                                <p className="font-sans text-sm font-bold">{formatDate(property.startedIn)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar size={18} className="text-[var(--muted)]" />
                            <div>
                                <p className="font-sans text-[10px] text-[var(--muted)] uppercase">تاريخ الانتهاء</p>
                                <p className="font-sans text-sm font-bold">{property.endedIn ? formatDate(property.endedIn) : 'قيد العمل'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid gap-10 py-9 lg:grid-cols-[1fr_280px]">
                <div>
                    {/* إضافة section إضافة الشقة هنا */}
                    <AddApartmentForm propertyID={propertyID} />

                    {/* عرض قائمة الشقق */}
                    <ApartmentsList apartments={apartments} />
                </div>

                <aside className="border-l border-[var(--line)] pl-6">
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[.18em] text-[var(--muted)]">Assigned team</p>
                    
                    <div className="mt-5 space-y-4">
                        {employees.map((e) => (
                            <div key={e.employeeId || e.employee?.id} className="border-b border-[var(--line)] pb-3">
                                <div className="flex items-center justify-between">
                                    <p className="font-sans text-sm font-bold">{e.employee?.name}</p>
                                    {e.role && (
                                        <span className="flex items-center gap-1 rounded bg-[var(--line)] px-2 py-0.5 font-sans text-[10px] font-medium">
                                            <UserCheck size={10} /> {e.role}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 font-sans text-xs text-[var(--muted)]">{e.employee?.phone}</p>
                            </div>
                        ))}
                        
                        {!employees.length && (
                            <p className="font-sans text-sm text-[var(--muted)]">No team assigned yet.</p>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}