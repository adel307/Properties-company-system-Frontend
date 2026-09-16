'use client';

import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';

export default function ShowProperties({ properties = [] }) {
  if (!properties.length) {
    return (
      <p className="border-y border-[var(--line)] py-10 text-center font-sans text-sm text-[var(--muted)]">
        No properties found.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {properties.map((property, index) => (
        <Link
          key={property.id}
          href={`/${property.id}`}
          className="group fade-up border border-[var(--line)] bg-[var(--card)] p-5"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <span
              className={`font-sans text-[10px] font-bold uppercase tracking-[.16em] ${
                property.status === 'completed'
                  ? 'text-[var(--teal)]'
                  : 'text-[var(--coral)]'
              }`}
            >
              {property.status.replace('_', ' ')}
            </span>
            <ArrowUpRight
              size={17}
              className="text-[var(--muted)] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </div>

          {/* Details Section */}
          <h3 className="display mt-10 text-2xl">{property.name}</h3>
          <p className="mt-2 flex items-center gap-1 font-sans text-xs text-[var(--muted)]">
            <MapPin size={13} />
            {property.address}
          </p>

          {/* Metrics Section */}
          <div className="mt-7 grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-4 font-sans">
            <Metric
              label="Area"
              value={`${(property.area / 1000).toFixed(1)}k m²`}
            />
            <Metric label="Floors" value={property.floorsNumber} />
            <Metric label="Homes" value={[property.apartments].length} />
          </div>
        </Link>
      ))}
    </div>
  );
}

// Sub-component
function Metric({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}