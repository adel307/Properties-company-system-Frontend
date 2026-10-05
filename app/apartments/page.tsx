import EntityPage from '@/components/common/EntityPage';
import { propertiesApi } from '@/lib/api/properties';

export const dynamic = 'force-dynamic';

export default async function ApartmentsPage() {
    const response = await propertiesApi.apartments.getAll();
    const data = Array.isArray(response) ? response : response?.data || [];
    const rows = Array.isArray(data) ? data : [data];

    const properties = await propertiesApi.getAll() || {data:[],pagination:[]}

    const propertiesList = properties.data || [];

    const propertiesOptions = propertiesList.map((property) => {return {label:property.name,value:property.id}})

    const EnteredRaws = rows.map((row) => ({
        id: row.id as string,
        propertyId: row.propertyId as string,
        buildingName: propertiesList.find((p) => p.id === row.propertyId)?.name || '',
        number: row.number as string,
        floor: row.floor as number,
        status: row.status as string,
    }));

  return (
    <EntityPage

        title="Apartments"
        eyebrow="Units"
        description="View and manage apartment details, building assignments, and availability."
        rows={EnteredRaws}
        columns={[
            {
            key: 'buildingName',
            label: 'Building',
            type: 'select',
            options: propertiesOptions,
            },
            { key: 'number', label: 'Unit number', type: 'text' },
            { key: 'floor', label: 'Floor', type: 'number' },
            {
            key: 'status',
            label: 'Status',
            type: 'readonly',
            },
        ]}
        onSave={async (id, updatedData) => {
            'use server';

            const payload = {
                propertyId: updatedData.apartmentPropertyId,
                number: updatedData.number,
                floor: Number(updatedData.floor),
                status: updatedData.status,
            };
            await propertiesApi.apartments.update(id, payload);
        }}
        onDelete={async (raw) => {
            'use server';
            const { id } = raw;
            await propertiesApi.apartments.delete(id);
        }}
    />
  );
}
