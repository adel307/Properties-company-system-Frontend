import { employeesApi } from '@/lib/api/employees';
import EntityPage from '@/components/common/EntityPage';
import { propertiesApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function EmployeesPage() {
    const response = await employeesApi.getAll(); 
    const data = Array.isArray(response) ? response : response?.data || [];
    const rows = Array.isArray(data) ? data : [data];

    const properties = await propertiesApi.getAll() || {data:[],pagination:[]}

    const propertiesList = properties.data.map((property) => {return {label:property.name,value:property.id}})

    return (
        <EntityPage
            title="Employees"
            eyebrow="Team directory" 
            description="Keep the Employee behind each build visible, assigned, and moving in the same direction." 
            rows={rows}
            action="Add employee" 
            actionHref="/employees/new"
            onDelete={async (id) => {
                'use server';
                await employeesApi.delete(id);
            }}
            onSave={async (id, updatedData) => {
                'use server';
                const payload = {
                    name:updatedData.name,
                    salary:updatedData.salary,
                    experienceYears:updatedData.experienceYears,
                    age:updatedData.age,
                    phone:updatedData.phone,

                }
                const result = await employeesApi.update(id,payload);
                return result;
            }}
            columns={[
                { key: 'name', label: 'Name', type:"text" },
                { key: 'experienceYears', label: 'Experience', type:"number" },
                { key: 'phone', label: 'Phone', type:"text" },
                { key: 'age', label: 'age', type:"number" },
                { key: 'salary', label: 'Monthly salary' , type:"number" },
                { 
                    key: 'properties', label: 'Assigned Properties', type:"multi-select",
                    options: propertiesList
                }
            ]}
        />
    ); 
}