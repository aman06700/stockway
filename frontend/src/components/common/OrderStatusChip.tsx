import { Chip } from '@mui/material';
import { OrderStatus } from '@/types';

interface OrderStatusChipProps {
  status: OrderStatus;
  size?: 'small' | 'medium';
}

export default function OrderStatusChip({ status, size = 'small' }: OrderStatusChipProps) {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', color: 'warning' as const };
      case 'accepted':
        return { label: 'Accepted', color: 'info' as const };
      case 'rejected':
        return { label: 'Rejected', color: 'error' as const };
      case 'in_transit':
        return { label: 'In Transit', color: 'primary' as const };
      case 'delivered':
        return { label: 'Delivered', color: 'success' as const };
      case 'cancelled':
        return { label: 'Cancelled', color: 'default' as const };
      default:
        return { label: status, color: 'default' as const };
    }
  };

  const { label, color } = getStatusConfig(status);

  return <Chip label={label} color={color} size={size} />;
}
