import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { showToast } from '@shared/components/AppDialogs';

function toFileUri(uri: string): string {
  return uri.startsWith('file://') ? uri : `file://${uri}`;
}

function waitForHiddenCardLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 80);
    });
  });
}

export function useRunResultShare() {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);

  const shareRunResult = useCallback(async () => {
    if (!cardRef.current || isSharing) return;

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      showToast('Este dispositivo não permite compartilhar imagens agora.', 'error');
      return;
    }

    setIsSharing(true);
    try {
      await waitForHiddenCardLayout();
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width: 1080,
        height: 1350,
      });

      await Sharing.shareAsync(toFileUri(uri), {
        dialogTitle: 'Compartilhar resultado',
        mimeType: 'image/png',
        UTI: 'public.png',
      });
    } catch (error) {
      console.warn('[share-run-result]', error);
      showToast('Não foi possível compartilhar. Tente novamente.', 'error');
    } finally {
      setIsSharing(false);
    }
  }, [isSharing]);

  return { cardRef, isSharing, shareRunResult };
}
