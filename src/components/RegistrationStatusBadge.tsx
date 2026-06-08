import { useTranslation } from 'react-i18next';

import { Badge, type BadgeTone } from '@/components/ui';
import type { RegistrationStatus } from '@/types/tournament';

const TONE: Record<RegistrationStatus, BadgeTone> = {
  REGISTERED: 'gold',
  CHECKED_IN: 'upcoming',
  SEATED: 'upcoming',
  BUSTED: 'completed',
  WAITLISTED: 'neutral',
  CANCELLED: 'completed',
  NO_SHOW: 'bounty',
};

export function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
  const { t } = useTranslation();
  const label = t(`mySeats.status.${status}`, status.replace('_', ' '));
  return <Badge label={label} tone={TONE[status]} />;
}
