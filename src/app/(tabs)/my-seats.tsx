import { Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Placeholder } from '@/components/Placeholder';
import { useIsAuthenticated } from '@/stores/useAuthStore';

export default function MySeatsScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  if (!isAuth) return <Redirect href="/login" />;
  return <Placeholder title={t('nav.mySeats')} subtitle="Registrations — wired in Phase 5" />;
}
