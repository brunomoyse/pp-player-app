import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Badge, type BadgeTone, Card, Text } from '@/components/ui';
import { colors } from '@/theme/tokens';
import type { Tournament, TournamentStatus } from '@/types/tournament';
import { currencyCents } from '@/utils/currency';
import { formatDateTime } from '@/utils/datetime';

const STATUS_TONE: Record<TournamentStatus, BadgeTone> = {
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'live',
  COMPLETED: 'completed',
};

export interface TournamentCardProps {
  tournament: Pick<Tournament, 'id' | 'title' | 'status' | 'startTime' | 'buyInCents' | 'seatCap'> &
    Partial<Pick<Tournament, 'registrationCount' | 'registrations'>>;
  onPress?: () => void;
}

export function TournamentCard({ tournament, onPress }: TournamentCardProps) {
  const { t, i18n } = useTranslation();
  const registered = tournament.registrationCount ?? tournament.registrations?.length ?? 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tournament.title}
      accessibilityHint={t('events.a11y.openHint')}
      testID="tournament-card">
      <Card className="gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <Text variant="heading" className="flex-1" numberOfLines={2}>
            {tournament.title}
          </Text>
          <Badge
            label={t(`events.status.${tournament.status.toLowerCase()}`, tournament.status)}
            tone={STATUS_TONE[tournament.status]}
          />
        </View>

        <View className="flex-row flex-wrap gap-x-5 gap-y-2">
          <Row icon="time-outline" text={formatDateTime(tournament.startTime, i18n.language)} />
          <Row icon="cash-outline" text={`${t('events.buyIn')} ${currencyCents(tournament.buyInCents)}`} />
          {tournament.seatCap ? (
            <Row
              icon="people-outline"
              text={t('events.maxPlayers', { count: tournament.seatCap })}
            />
          ) : null}
          <Row icon="person-outline" text={`${registered}`} />
        </View>
      </Card>
    </Pressable>
  );
}

function Row({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text variant="caption">
        {text}
      </Text>
    </View>
  );
}
