import { expensesApi } from '@/lib/api';
import EntityPage from '@/components/common/EntityPage';
export default async function CategoriesPage() { const response = await expensesApi.categories.getAll(); const rows = Array.isArray(response) ? response : response?.data || []; return <EntityPage title="Categories" eyebrow="Expense setup" description="Keep the expense vocabulary clean so reports stay useful over time." rows={rows} action="Add category" columns={[{ key: 'name', label: 'Category' }, { key: 'id', label: 'Identifier' }]} />; }
