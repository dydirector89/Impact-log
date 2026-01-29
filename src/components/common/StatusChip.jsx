import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StatusChip({ status, size = 'small' }) {
    const config = {
        pending: {
            label: 'Pending',
            variant: 'warning',
            icon: Clock,
        },
        approved: {
            label: 'Approved',
            variant: 'success',
            icon: CheckCircle,
        },
        rejected: {
            label: 'Rejected',
            variant: 'destructive',
            icon: XCircle,
        },
    };

    const { label, variant, icon: Icon } = config[status] || config.pending;

    return (
        <Badge variant={variant} className="gap-1">
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    );
}
