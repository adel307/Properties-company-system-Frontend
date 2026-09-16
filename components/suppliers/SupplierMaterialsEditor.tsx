'use client';

import { FormEvent, useState } from 'react';
import { materialsApi } from '@/lib/api/materials';

interface Material {
  id: string;
  name: string;
  quantity?: number | string;
  status?: string;
  supplierId?: string;
  remainingAmount?: number | string;
}

interface SupplierMaterialsEditorProps {
  supplierId: string;
  materials: Material[];
  assignedMaterialIds: string[];
}

export default function SupplierMaterialsEditor({
  supplierId,
  materials,
  assignedMaterialIds,
}: SupplierMaterialsEditorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(assignedMaterialIds);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const toggleMaterial = (materialId: string) => {
    setSelectedIds((current) => current.includes(materialId)
      ? current.filter((id) => id !== materialId)
      : [...current, materialId]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const materialsToAssign = materials.filter(
        (material) => selectedIds.includes(material.id) && material.supplierId !== supplierId,
      );

      await Promise.all(materialsToAssign.map((material) => materialsApi.update(material.id, {
        supplierId,
      })));

      setSuccess('Materials assigned successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to assign materials.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 border-y border-[var(--line)] py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display text-2xl">Assign materials</h2>
          <p className="mt-1 font-sans text-sm text-[var(--muted)]">
            Select materials to register them under this supplier.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="bg-[var(--teal)] px-4 py-2.5 font-sans text-sm text-white disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save materials'}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-[var(--coral)]">{error}</p>}
      {success && <p className="mt-4 text-sm text-[var(--teal)]">{success}</p>}

      <div className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {materials.length === 0 ? (
          <p className="py-8 text-center font-sans text-sm text-[var(--muted)]">No materials available.</p>
        ) : materials.map((material) => {
          const selected = selectedIds.includes(material.id);
          const assignedToAnotherSupplier = Boolean(material.supplierId && material.supplierId !== supplierId);

          return (
            <label key={material.id} className="flex cursor-pointer items-center gap-4 py-4">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleMaterial(material.id)}
                className="h-4 w-4 accent-[var(--teal)]"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-sans text-sm font-semibold text-[var(--ink)]">{material.name}</span>
                <span className="mt-1 block font-sans text-xs text-[var(--muted)]">
                  Quantity: {material.quantity ?? 0} · Status: {material.status ?? '—'}
                  {assignedToAnotherSupplier ? ' · Currently assigned to another supplier' : ''}
                </span>
              </span>
              <span className="font-sans text-sm text-[var(--muted)]">
                ${Number(material.remainingAmount ?? 0).toLocaleString()}
              </span>
            </label>
          );
        })}
      </div>
    </form>
  );
}