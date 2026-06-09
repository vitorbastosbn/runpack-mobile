const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

export function getHostFromDevServer(devServerHost?: string | null) {
  const value = devServerHost?.trim();
  if (!value) return undefined;

  const hostWithPort = value.includes('://')
    ? new URL(value).host
    : value.split('/')[0];

  return hostWithPort.split(':')[0];
}

export function resolveDevServerUrl(
  configuredUrl: string,
  devServerHost?: string | null,
  scriptUrl?: string | null,
) {
  const devHost = getHostFromDevServer(devServerHost) ?? getHostFromDevServer(scriptUrl);
  if (!devHost) return configuredUrl;

  const match = configuredUrl.match(/^(https?:\/\/|wss?:\/\/)([^:/?#]+)(.*)$/i);
  if (!match) return configuredUrl;

  const [, protocol, host, rest] = match;
  if (!LOCAL_HOSTS.has(host.toLowerCase())) return configuredUrl;

  return `${protocol}${devHost}${rest}`;
}
