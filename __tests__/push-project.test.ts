import { resolveExpoProjectId } from '../features/notifications/utils/pushProject';

function assertEqual(actual: string | undefined, expected: string | undefined, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual:   ${actual}`);
  }
}

assertEqual(
  resolveExpoProjectId('com.runpack.app', '9df850fe-3fd4-41bd-82ac-50304f4d4a7f'),
  '9df850fe-3fd4-41bd-82ac-50304f4d4a7f',
  'Android package name should not be used as Expo projectId',
);

assertEqual(
  resolveExpoProjectId('9df850fe-3fd4-41bd-82ac-50304f4d4a7f'),
  '9df850fe-3fd4-41bd-82ac-50304f4d4a7f',
  'Valid env projectId should be used',
);

assertEqual(
  resolveExpoProjectId('com.runpack.app'),
  undefined,
  'Invalid projectId should return undefined',
);
