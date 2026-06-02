import { useTranslation } from 'react-i18next';

import { Placeholder } from '@/components/Placeholder';

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  return <Placeholder title={t('nav.leaders')} subtitle="Rankings — wired in Phase 5" />;
}
