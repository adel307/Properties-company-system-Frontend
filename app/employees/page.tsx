import { employeesApi } from '@/lib/api/employees';
import EntityPage from '@/components/common/EntityPage';
// import { propertiesApi } from '@/lib/api';
// import { Options } from '@/types/common';

export const dynamic = 'force-dynamic';

export default async function EmployeesPage() {
    const response = await employeesApi.getAll(); 
    const data = Array.isArray(response) ? response : response?.data || [];
    const rows = Array.isArray(data) ? data : [data];

    // const properties = await propertiesApi.getAll() || {data:[],pagination:[]}

    // const propertiesList = properties.data || [];

    // const propertiesOptions:Options = propertiesList.map((property) => {return {label:property.name,value:property.id}})

    const EnteredRaws = rows.map((row) => ({
        id: row.id as string,
        name: row.name as string,
        experienceYears: row.experienceYears as number,
        phone: row.phone as string,
        age: row.age as number,
        salary: row.salary as number,
        properties: row.properties || [],
    }));

    const Suffixes = rows.map((row) => ({
        id:'',
        name: '',
        experienceYears: 'years',
        phone: '',
        age: 'years',
        salary: 'USD',
        properties: '',
    }));

    return (
        <EntityPage
            title="Employees"
            eyebrow="Team directory" 
            description="Keep the Employee behind each build visible, assigned, and moving in the same direction." 
            rows={EnteredRaws}
            Suffixes={Suffixes}
            action="Add employee" 
            actionHref="/employees/new"
            onDelete={async (raw) => {
                'use server';
                const { id } = raw;
                await employeesApi.delete(id);
            }}
            onSave={async (id, updatedData) => {
                'use server';
                const payload = {
                    name:updatedData.name,
                    salary:parseInt(updatedData.salary as string),
                    experienceYears:parseInt(updatedData.experienceYears as string),
                    age:parseInt(updatedData.age as string),
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
                    key: 'properties', label: 'Assigned Properties', type:"readonly",
                }
            ]}
        />
    ); 
}