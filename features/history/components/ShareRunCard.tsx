import { forwardRef } from 'react';
import { Text, View } from 'react-native';
import type { ShareRunCardInput } from '@features/history/utils/shareRunResult';
import { buildShareRunCardModel } from '@features/history/utils/shareRunResult';

type ShareRunCardProps = {
  run: ShareRunCardInput;
};

export const ShareRunCard = forwardRef<View, ShareRunCardProps>(function ShareRunCard({ run }, ref) {
  const model = buildShareRunCardModel(run);

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{
        position: 'absolute',
        left: -10000,
        top: 0,
        width: 1080,
        height: 1350,
        backgroundColor: '#111114',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: 260,
          backgroundColor: '#F97316',
          opacity: 0.22,
          right: -150,
          top: -140,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: 210,
          backgroundColor: '#22C55E',
          opacity: 0.14,
          left: -120,
          bottom: 190,
        }}
      />

      <View style={{ flex: 1, padding: 72 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <View
            style={{
              width: 74,
              height: 74,
              borderRadius: 37,
              backgroundColor: '#F97316',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: '900' }}>R</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 34, fontWeight: '900' }}>{model.title}</Text>
            {model.dateLabel ? (
              <Text style={{ color: '#A1A1AA', fontSize: 24, marginTop: 6 }}>{model.dateLabel}</Text>
            ) : null}
          </View>
        </View>

        <View style={{ marginTop: 86 }}>
          <Text style={{ color: '#F97316', fontSize: 34, fontWeight: '800' }}>{model.runnerName}</Text>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 72,
              lineHeight: 82,
              fontWeight: '900',
              marginTop: 14,
            }}
          >
            {model.headline}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: 22,
            marginTop: 70,
          }}
        >
          <MetricCard label="Distância" value={model.distanceLabel} accent />
          <MetricCard label="Tempo" value={model.timeLabel} />
        </View>
        <View
          style={{
            flexDirection: 'row',
            gap: 22,
            marginTop: 22,
          }}
        >
          <MetricCard label="Pace" value={model.paceLabel} />
          <MetricCard label="Resultado" value={model.rankLabel} accent />
        </View>

        <View style={{ marginTop: 74 }}>
          <Text style={{ color: '#A1A1AA', fontSize: 25, fontWeight: '800', textTransform: 'uppercase' }}>
            Top 3 da corrida
          </Text>
          <View style={{ marginTop: 22, gap: 14 }}>
            {model.topParticipants.map((participant) => (
              <View
                key={participant.userId}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#24242A',
                  borderRadius: 26,
                  paddingHorizontal: 28,
                  paddingVertical: 22,
                  borderWidth: 2,
                  borderColor: '#34343C',
                }}
              >
                <Text style={{ color: '#F97316', fontSize: 28, fontWeight: '900', width: 74 }}>
                  {participant.rankLabel}
                </Text>
                <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: '800', flex: 1 }} numberOfLines={1}>
                  {participant.name}
                </Text>
                <Text style={{ color: '#D4D4D8', fontSize: 28, fontWeight: '800' }}>
                  {participant.distanceLabel}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }} />
        <View
          style={{
            borderTopWidth: 2,
            borderTopColor: '#2F2F36',
            paddingTop: 28,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 34, fontWeight: '900' }}>{model.footer}</Text>
          <Text style={{ color: '#A1A1AA', fontSize: 24 }}>corra junto, dispute junto</Text>
        </View>
      </View>
    </View>
  );
});

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 154,
        borderRadius: 28,
        backgroundColor: accent ? '#F97316' : '#24242A',
        borderWidth: 2,
        borderColor: accent ? '#FB923C' : '#34343C',
        padding: 28,
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ color: accent ? '#FFF7ED' : '#A1A1AA', fontSize: 22, fontWeight: '800' }}>{label}</Text>
      <Text style={{ color: '#FFFFFF', fontSize: 40, fontWeight: '900' }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
