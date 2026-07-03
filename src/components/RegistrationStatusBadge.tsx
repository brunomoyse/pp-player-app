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

export function RegistrationStatusBadge({
  status,
  waitlistPosition,
}: {
  status: RegistrationStatus;
  /** Shown inside the badge ("Waitlist #3") when status is WAITLISTED. */
  waitlistPosition?: number | null;
}) {
  const { t } = useTranslation();
  const label =
    status === 'WAITLISTED' && waitlistPosition
      ? t('mySeats.registrationStatus.WAITLISTED_POSITION', { position: waitlistPosition })
      : t(`mySeats.registrationStatus.${status}`, status.replace('_', ' '));
  return <Badge label={label} tone={TONE[status]} testID={`registration-status-${status}`} />;
}
