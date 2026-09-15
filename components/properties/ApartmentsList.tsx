export default function ApartmentsList({ apartments = [] }) 
{
    return (
        <section>
            <div className="mb-4 flex items-baseline justify-between">
                <h2 className="display text-2xl">Apartments</h2>
                <span className="font-sans text-xs text-[var(--muted)]">{apartments.length} units</span>
            </div>
            {
                apartments.length ?
                <div className="divide-y divide-[var(--line)] border-y border-[var(--line)] bg-[var(--card)]">
                    {
                        apartments.map(apartment =>
                        <div key={apartment.id} className="flex items-center justify-between px-4 py-4 font-sans text-sm">
                            <span className="font-bold">Unit {apartment.number}</span>
                            <span className="text-[var(--muted)]">Floor {apartment.floor}</span>
                            <span className="text-xs text-[var(--teal)]">Available</span>
                        </div>)
                    }
                </div> : <p className="border-y border-[var(--line)] py-10 text-center font-sans text-sm text-[var(--muted)]">No apartments found.</p>
            }
        </section>
    )
}
