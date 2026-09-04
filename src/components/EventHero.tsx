import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { clubGradient } from '@/lib/clubGradient';
import { FacePile, Text } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { currencyCents } from '@/utils/currency';
import { formatDate, formatTime } from '@/utils/datetime';

const COVER_HEIGHT = 150;
const TOKEN_SIZE = 80;

export interface EventHeroProps {
  title: string;
  description?: string | null;
  clubId?: string | null;
  clubName?: string | null;
  clubCity?: string | null;
  startTime: string;
  buyInCents: number;
  /** Live registration count (already reconciled over the subscription). */
  registeredCount: number;
  seatCap?: number | null;
  /** Names for the face pile, in display order. Sliced internally. */
  playerNames: string[];
  /** Status / format badges, owned by the screen so tone mapping stays in one place. */
  badges?: ReactNode;
  /** Back + share controls, floated over the cover. */
  header?: ReactNode;
  onPressField?: () => void;
}

/**
 * Identity header for an upcoming tournament — a port of the "cover + overlapping
 * avatar + face pile" card pattern onto the dark theme.
 *
 * Deliberately upcoming-only: while a tournament runs, the clock has to stay
 * above the fold (players keep this screen face-up at the table), so the detail
 * screen falls back to its compact title block for every other status.
 */
export function EventHero({
  title,
  description,
  clubId,
  clubName,
  clubCity,
  startTime,
  buyInCents,
  registeredCount,
  seatCap,
  playerNames,
  badges,
  header,
  onPressField,
}: EventHeroProps) {
  const { t, i18n } = useTranslation();
  const ramp = clubGradient(clubId);
  const subtitle = [clubName, clubCity].filter(Boolean).join(' · ');
  const watermark = (clubName ?? '').trim().slice(0, 2).toUpperCase();
  const spotsLeft = seatCap != null ? Math.max(0, seatCap - registeredCount) : null;

  return (
    // Escape the Screen's p-4 so the cover bleeds to the device edges.
    <View className="-mx-4 -mt-4">
      <View style={{ height: COVER_HEIGHT }}>
        <LinearGradient
          colors={ramp}
          // The last stop is the page background, so the band dissolves into the
          // screen rather than ending on a visible seam.
          locations={[0, 0.55, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {watermark ? (
          <Text
            className="absolute font-display-bold text-pp-text"
            style={{ right: 8, bottom: -22, fontSize: 120, opacity: 0.05 }}
            accessibilityElementsHidden
            importantForAccessibility="no">
            {watermark}
          </Text>
        ) : null}
        {header ? (
          <View className="absolute left-4 right-4 top-2 flex-row items-center justify-between">
            {header}
          </View>
        ) : null}
      </View>

      <View className="items-center px-4">
        {/* The stake, as the card's focal token — overlaps the cover's lower edge. */}
        <View
          className="items-center justify-center rounded-full border-2 border-pp-gold bg-pp-surface"
          style={{
            width: TOKEN_SIZE,
            height: TOKEN_SIZE,
            marginTop: -(TOKEN_SIZE / 2),
          }}
          accessible
          accessibilityLabel={`${t('events.buyIn')}: ${currencyCents(buyInCents)}`}>
          <Text
            className="font-mono-medium uppercase tracking-widest text-pp-gold-deep"
            style={{ fontSize: 9 }}
            accessibilityElementsHidden
            importantForAccessibility="no">
            {t('events.buyIn')}
          </Text>
          <Text
            className="font-display-bold text-pp-gold"
            style={{ fontSize: 20 }}
            numberOfLines={1}
            adjustsFontSizeToFit
            accessibilityElementsHidden
            importantForAccessibility="no">
            {currencyCents(buyInCents)}
          </Text>
        </View>

        <Text variant="title" className="mt-3 text-center">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="muted" className="mt-0.5 text-center">
            {subtitle}
          </Text>
        ) : null}

        <View className="mt-3 flex-row flex-wrap items-center justify-center gap-2">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="calendar-outline" size={13} color={colors.gold} />
            <Text className="font-sans-medium text-[13px] text-pp-gold">
              {formatDate(startTime, i18n.language)} · {formatTime(startTime, i18n.language)}
            </Text>
          </View>
          {badges}
        </View>

        {description ? (
          <Text variant="caption" className="mt-3 text-center" numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>

      {registeredCount > 0 ? (
        <>
          <View className="mx-4 mt-4 h-px bg-pp-border" />
          <Pressable
            onPress={onPressField}
            disabled={!onPressField}
            accessibilityRole={onPressField ? 'button' : undefined}
            accessibilityHint={onPressField ? t('events.hero.viewFieldHint') : undefined}
            className="mx-4 mt-3 flex-row items-center gap-3">
            <FacePile names={playerNames} total={registeredCount} />
            <View className="flex-1">
              <Text className="font-sans-semibold text-pp-text">
                {t('events.hero.registered', { count: registeredCount })}
              </Text>
              {spotsLeft != null ? (
                <Text variant="dim">{t('events.spotsLeft', { count: spotsLeft })}</Text>
              ) : null}
            </View>
            {onPressField ? (
              <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
            ) : null}
          </Pressable>
        </>
      ) : null}
    </View>
  );
}
