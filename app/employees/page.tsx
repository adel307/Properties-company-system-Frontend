import { employeesApi } from '@/lib/api/employees';
import EntityPage from '@/components/common/EntityPage';

export const dynamic = 'force-dynamic';

export default async function EmployeesPage() {
    const response = await employeesApi.getAll(); 
    const data = Array.isArray(response) ? response : response?.data || [];
    const rows = Array.isArray(data) ? data : [data];

    return (
        <EntityPage
            title="People" 
            eyebrow="Team directory" 
            description="Keep the people behind each build visible, assigned, and moving in the same direction." 
            rows={rows}
            action="Add employee" 
            actionHref="/employees/new"
            columns={[
                { key: 'name', label: 'Name' },
                { key: 'experienceYears', label: 'Experience' },
                { key: 'phone', label: 'Phone' },
                { key: 'salary', label: 'Monthly salary' },
                { key: 'properties', label: 'Assigned Properties' }
            ]}
        />
    ); 
}