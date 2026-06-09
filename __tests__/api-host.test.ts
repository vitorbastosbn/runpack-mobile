import { resolveDevServerUrl } from '../constants/api-host';

function assertEqual(actual: string, expected: string, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual:   ${actual}`);
  }
}

assertEqual(
  resolveDevServerUrl('http://localhost:8080', '10.0.2.2:8081'),
  'http://10.0.2.2:8080',
  'Android emulator should replace localhost with emulator host',
);

assertEqual(
  resolveDevServerUrl('ws://localhost:8080/ws', '192.168.0.25:8081'),
  'ws://192.168.0.25:8080/ws',
  'Physical device should replace localhost with Metro host IP',
);

assertEqual(
  resolveDevServerUrl('http://localhost:8080', 'localhost:8081'),
  'http://localhost:8080',
  'USB physical device should keep localhost when adb reverse is active',
);

assertEqual(
  resolveDevServerUrl(
    'http://localhost:8080',
    undefined,
    'http://192.168.0.25:8081/index.bundle?platform=android&dev=true&minify=false',
  ),
  'http://192.168.0.25:8080',
  'Physical device should fall back to React Native scriptURL host',
);

assertEqual(
  resolveDevServerUrl('http://api.runpack.test:8080', '192.168.0.25:8081'),
  'http://api.runpack.test:8080',
  'Non-local hosts should stay untouched',
);
