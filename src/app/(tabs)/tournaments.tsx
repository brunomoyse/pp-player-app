import { useTranslation } from 'react-i18next';

import { Placeholder } from '@/components/Placeholder';

export default function TournamentsScreen() {
  const { t } = useTranslation();
  return <Placeholder title={t('nav.events')} subtitle="Tournament list — wired in Phase 5" />;
}
