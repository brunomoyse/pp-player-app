import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button, IconButton, Input, Screen, Text } from '@/components/ui';
import { openLegal } from '@/lib/legal';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Ionicons
        name={ok ? 'checkmark-circle' : 'ellipse-outline'}
        size={15}
        color={ok ? colors.success : colors.textDim}
      />
      <Text className={ok ? 'text-[12px] text-pp-success' : 'text-[12px] text-pp-text-dim'}>
        {label}
      </Text>
    </View>
  );
}

export default function RegisterScreen() {
  const { t } = useTranslation();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [ageConfirm, setAgeConfirm] = useState(false);
  const [show, setShow] = useState(false);

  const hasLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordValid = hasLength && hasLower && hasUpper && hasNumber;
  const valid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    USERNAME_RE.test(username) &&
    EMAIL_RE.test(email) &&
    passwordValid &&
    password === confirm &&
    terms &&
    ageConfirm;

  const onSubmit = async () => {
    if (!valid) return;
    const user = await register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username,
      email: email.trim(),
      password,
    });
    if (user) router.replace('/(tabs)');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('auth.register'),
          headerLeft: () => (
            <IconButton
              name="close"
              size={26}
              color={colors.text}
              accessibilityLabel={t('common.close')}
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <Screen contentClassName="gap-5 pt-6">
        <View className="gap-1">
          <Text variant="title">{t('auth.createAccount')}</Text>
          <Text variant="muted">{t('auth.joinCommunity')}</Text>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label={t('profile.firstName')}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              textContentType="givenName"
            />
          </View>
          <View className="flex-1">
            <Input
              label={t('profile.lastName')}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              textContentType="familyName"
            />
          </View>
        </View>
        <Input
          label={t('auth.username')}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Input
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <Input
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!show}
          textContentType="newPassword"
        />

        <View className="gap-1.5 rounded-xl border border-pp-border bg-white/[0.02] p-3">
          <Text variant="label" className="mb-0.5 text-pp-text-muted">
            {t('auth.passwordRequirements')}
          </Text>
          <Rule ok={hasLength} label={t('auth.passwordLength')} />
          <Rule ok={hasLower} label={t('auth.passwordLowercase')} />
          <Rule ok={hasUpper} label={t('auth.passwordUppercase')} />
          <Rule ok={hasNumber} label={t('auth.passwordNumber')} />
        </View>

        <Input
          label={t('auth.confirmPassword')}
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry={!show}
          textContentType="newPassword"
          error={confirm.length > 0 && confirm !== password ? t('auth.passwordsDoNotMatch') : null}
        />

        <Pressable onPress={() => setShow((s) => !s)} hitSlop={8} className="self-start">
          <Text variant="dim">
            {show ? t('auth.hidePassword') : t('auth.showPassword')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setTerms((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: terms }}
          className="flex-row items-center gap-2">
          <Ionicons
            name={terms ? 'checkbox' : 'square-outline'}
            size={20}
            color={terms ? colors.gold : colors.textMuted}
          />
          <Text variant="muted" className="flex-1">
            {t('auth.agreeToTerms')} {t('auth.termsAndConditions')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setAgeConfirm((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: ageConfirm }}
          className="flex-row items-center gap-2">
          <Ionicons
            name={ageConfirm ? 'checkbox' : 'square-outline'}
            size={20}
            color={ageConfirm ? colors.gold : colors.textMuted}
          />
          <Text variant="muted" className="flex-1">
            {t('auth.confirmAge')}
          </Text>
        </Pressable>

        <View className="flex-row items-center gap-4">
          <Pressable onPress={() => openLegal('terms')} hitSlop={8}>
            <Text className="text-[12px] text-pp-gold underline">{t('legal.termsOfService')}</Text>
          </Pressable>
          <Pressable onPress={() => openLegal('privacy')} hitSlop={8}>
            <Text className="text-[12px] text-pp-gold underline">{t('legal.privacyPolicy')}</Text>
          </Pressable>
        </View>

        <Text variant="dim">
          {t('legal.responsibleGaming')}
        </Text>

        {error ? (
          <Text className="text-[13px] text-pp-danger" accessibilityLiveRegion="polite">
            {t('auth.registrationFailed')}
          </Text>
        ) : null}

        <Button
          title={t('auth.createAccount')}
          onPress={onSubmit}
          loading={isLoading}
          disabled={!valid}
        />

        <View className="flex-row items-center justify-center gap-1">
          <Text variant="muted">{t('auth.alreadyHaveAccount')}</Text>
          <Pressable onPress={() => router.replace('/login')} hitSlop={8}>
            <Text className="font-sans-semibold text-pp-gold">{t('auth.login')}</Text>
          </Pressable>
        </View>
      </Screen>
    </>
  );
}
