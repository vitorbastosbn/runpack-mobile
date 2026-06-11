import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { PurchasesPackage } from 'react-native-purchases';
import { Button, ButtonStack } from '@shared/components/Button';
import { colors } from '@constants/theme';
import { useSubscriptionStore } from '@store/subscription.store';
import { subscriptionService } from '../services/subscription.service';

const BENEFITS = [
  { icon: 'radio', label: 'Acompanhe corridas dos amigos ao vivo na home' },
  { icon: 'notifications', label: 'Notificações em tempo real de quem está correndo' },
  { icon: 'people', label: 'Até 10 grupos e 20 participantes por corrida' },
  { icon: 'stats-chart', label: 'Histórico ilimitado e estatísticas avançadas' },
  { icon: 'sparkles', label: 'Zero anúncios' },
] as const;

export function Paywall() {
  const router = useRouter();
  const setPlan = useSubscriptionStore((s) => s.setPlan);
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    subscriptionService
      .getMonthlyPackage()
      .then(setPkg)
      .catch(() => setError('Não foi possível carregar a oferta'))
      .finally(() => setLoading(false));
  }, []);

  const handleResult = (hasPremium: boolean) => {
    if (hasPremium) {
      setPlan('premium', null);
      router.back();
    }
  };

  const purchase = async () => {
    if (!pkg) return;
    setPurchasing(true);
    setError(null);
    try {
      const info = await subscriptionService.purchase(pkg);
      handleResult(subscriptionService.hasPremiumEntitlement(info));
    } catch (e: unknown) {
      const cancelled =
        typeof e === 'object' && e !== null && 'userCancelled' in e && Boolean(e.userCancelled);
      if (!cancelled) setError('Compra não concluída. Tente novamente.');
    } finally {
      setPurchasing(false);
    }
  };

  const restore = async () => {
    setPurchasing(true);
    setError(null);
    try {
      const info = await subscriptionService.restore();
      const hasPremium = subscriptionService.hasPremiumEntitlement(info);
      handleResult(hasPremium);
      if (!hasPremium) setError('Nenhuma assinatura ativa encontrada.');
    } catch {
      setError('Não foi possível restaurar. Tente novamente.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <View className="flex-1 bg-surface-bg px-8 pt-16 pb-12">
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        className="self-end"
        accessibilityRole="button"
        accessibilityLabel="Fechar"
      >
        <Ionicons name="close" size={24} color={colors.text.secondary} />
      </Pressable>

      <Text
        className="text-brand-primary text-[12px] font-bold uppercase mt-4"
        style={{ letterSpacing: 3 }}
      >
        RunPack Premium
      </Text>
      <Text className="text-text-primary text-[32px] font-extrabold tracking-tight leading-[38px] mt-2">
        Corra na frente.
      </Text>

      <View className="gap-5 mt-8 flex-1">
        {BENEFITS.map((b) => (
          <View key={b.icon} className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-full bg-surface-card items-center justify-center">
              <Ionicons name={b.icon} size={17} color={colors.brand.primary} />
            </View>
            <Text className="text-text-primary text-[15px] leading-[21px] flex-1">{b.label}</Text>
          </View>
        ))}
      </View>

      {error ? <Text className="text-status-error text-[13px] text-center mb-3">{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color={colors.brand.primary} />
      ) : (
        <ButtonStack>
          <Button
            label={pkg ? `Assinar por ${pkg.product.priceString}/mês` : 'Oferta indisponível'}
            onPress={purchase}
            loading={purchasing}
            disabled={!pkg}
          />
          <Button label="Restaurar compra" variant="ghost" onPress={restore} disabled={purchasing} />
        </ButtonStack>
      )}
    </View>
  );
}
