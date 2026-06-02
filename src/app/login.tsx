import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button, Input, Screen, Text } from '@/components/ui';
import { useAuthStore } from '@/stores/useAuthStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const valid = EMAIL_RE.test(email) && password.length >= 5;

  const onSubmit = async () => {
    if (!valid) return;
    const user = await login({ email: email.trim(), password });
    if (user) router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: t('auth.login'), headerShown: true }} />
      <Screen contentClassName="gap-5 pt-8">
        <View className="gap-1">
          <Text variant="title">{t('auth.welcomeBack')}</Text>
          <Text variant="muted">{t('home.unlockFeatures')}</Text>
        </View>

        <Input
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="you@example.com"
        />

        <View className="gap-1.5">
          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!show}
            textContentType="password"
            placeholder="••••••••"
          />
          <Pressable onPress={() => setShow((s) => !s)} hitSlop={8} className="self-end">
            <Text variant="dim" className="text-[12px]">
              {show ? t('auth.hidePassword') : t('auth.showPassword')}
            </Text>
          </Pressable>
        </View>

        {error ? (
          <Text className="text-[13px] text-pp-danger" accessibilityLiveRegion="polite">
            {t('auth.loginFailed')}
          </Text>
        ) : null}

        <Button
          title={t('auth.login')}
          onPress={onSubmit}
          loading={isLoading}
          disabled={!valid}
        />

        <View className="flex-row items-center justify-center gap-1">
          <Text variant="muted">{t('auth.noAccount')}</Text>
          <Pressable onPress={() => router.replace('/register')} hitSlop={8}>
            <Text className="font-sans-semibold text-pp-gold">{t('auth.register')}</Text>
          </Pressable>
        </View>
      </Screen>
    </>
  );
}
