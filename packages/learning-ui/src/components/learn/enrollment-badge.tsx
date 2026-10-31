import type { EnrollmentLifecycle } from '../../shared/domain/enums';

export function enrollmentLabel(lifecycle: EnrollmentLifecycle | null | undefined): string | null {
  switch (lifecycle) {
    case 'ACTIVE': return 'Enrolled';
    case 'COMPLETED': return 'Completed';
    case 'PAYMENT_REQUIRED': return 'Payment due';
    case 'PENDING_ACCOUNT': return 'Account pending';
    case 'CANCELLED': return 'Enrollment cancelled';
    case 'EXPIRED': return 'Enrollment expired';
    default: return null;
  }
}

export function EnrollmentBadge({ label }: { label: string | null | undefined }) {
  if (!label) return null;
  return <span className="inline-flex rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">{label}</span>;
}
