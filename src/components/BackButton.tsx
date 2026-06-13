import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/ui';

export interface BackButtonProps {
  /** Override the default router.back() (e.g. to confirm unsaved changes first). */
  onPress?: () => void;
}

/** Standard screen-header back affordance: chevron, localized label, 44pt tap target. */
export function BackButton({ onPress }: BackButtonProps) {
  const { t } = useTranslation();
  return (
    <IconButton
      name="chevron-back"
      size={26}
      accessibilityLabel={t('common.back')}
      onPress={onPress ?? (() => router.back())}
    />
  );
}
