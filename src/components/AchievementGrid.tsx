import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { AchievementCard } from '@/components/AchievementCard';
import { Stagger } from '@/components/motion';
import { Chip, EmptyState, Text } from '@/components/ui';
import { ACHIEVEMENT_CATEGORIES, type AchievementCategory, type PlayerAchievement } from '@/types/achievements';

type Filter = AchievementCategory | 'ALL';

export interface AchievementGridProps {
  items: PlayerAchievement[];
}

export function AchievementGrid({ items }: AchievementGridProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>('ALL');

  const unlocked = items.filter((i) => !i.isLocked).length;
  const filtered = useMemo(
    () => (filter === 'ALL' ? items : items.filter((i) => i.achievement.category === filter)),
    [items, filter]
  );

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text variant="heading">{t('achievements.title')}</Text>
        <Text variant="mono" className="text-pp-gold">
          {unlocked}/{items.length}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-0.5">
        <Chip
          label={t('achievements.filters.all')}
          active={filter === 'ALL'}
          onPress={() => setFilter('ALL')}
        />
        {ACHIEVEMENT_CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={t(`achievements.categories.${c.toLowerCase()}`, c)}
            active={filter === c}
            onPress={() => setFilter(c)}
          />
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <EmptyState icon="ribbon-outline" message={t('achievements.emptyCategory')} />
      ) : (
        <Stagger className="gap-3">
          {filtered.map((item) => (
            <AchievementCard key={item.id} item={item} />
          ))}
        </Stagger>
      )}
    </View>
  );
}
