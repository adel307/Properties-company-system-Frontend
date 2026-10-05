import { auditApi } from '@/lib/api/audit';
import EntityPage from '@/components/common/EntityPage';
import AuditLogsTable from '@/components/audit/AuditLogsTable';

export default async function AuditLogsPage() { 
    const response = await auditApi.getAll();
    const data = Array.isArray(response) ? response : response?.data || [];
    const rows = Array.isArray(data) ? data : [data];

    return (
        <EntityPage
            title="AuditLogs"
            eyebrow="Audit Logs" 
            description="" 
            rows={rows}
            action="Add AuditLog" 
            actionHref="/audit-logs"
            onDelete={async (raw) => {
                'use server';
                return null;
            }}
            onSave={async (id, updatedData) => {
                'use server';
                return null;
            }}
            columns={[
                { key: 'tableName', label: 'table name', type:"text" },
                { key: 'actionType', label: 'action', type:"text" },
                { key: 'recordId', label: 'ID', type:"text" },
                { key: 'createdAt', label: 'Date', type:"date" },
                // { key: 'oldData', label: 'old data' , type:"json" },
                // { key: 'newData', label: 'new data', type:"json" }
            ]}
        />
    )
}
