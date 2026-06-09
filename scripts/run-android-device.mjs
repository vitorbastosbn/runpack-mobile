import { spawnSync, spawn } from 'node:child_process';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'pipe', encoding: 'utf8', ...options });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `${command} failed`).trim());
  }
  return result.stdout;
}

function listDevices() {
  const output = run('adb', ['devices', '-l']);
  return output
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [serial, status] = line.split(/\s+/);
      return { serial, status };
    })
    .filter((device) => device.status === 'device');
}

function pickDevice(serialArg) {
  const devices = listDevices();
  if (serialArg) {
    const selected = devices.find((device) => device.serial === serialArg);
    if (!selected) {
      throw new Error(`Android device not found: ${serialArg}`);
    }
    return selected.serial;
  }

  const physical = devices.find((device) => !device.serial.startsWith('emulator-'));
  const selected = physical ?? devices[0];
  if (!selected) {
    throw new Error('No Android device found. Check adb devices.');
  }
  return selected.serial;
}

const serial = pickDevice(process.argv[2]);

for (const port of ['8080', '8081']) {
  run('adb', ['-s', serial, 'reverse', `tcp:${port}`, `tcp:${port}`], { stdio: 'inherit' });
}

console.log(`[android-device] using ${serial}`);
console.log('[android-device] reverse tcp:8080 and tcp:8081 ready');

const child = spawn('npx', ['expo', 'run:android'], {
  stdio: 'inherit',
  env: { ...process.env, ANDROID_SERIAL: serial },
});

child.on('exit', (code) => process.exit(code ?? 0));
