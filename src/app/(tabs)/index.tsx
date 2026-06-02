import { useTranslation } from 'react-i18next';

import { Placeholder } from '@/components/Placeholder';

export default function HomeScreen() {
  const { t } = useTranslation();
  return <Placeholder title={t('nav.home')} subtitle="Dashboard — wired in Phase 5" />;
}
