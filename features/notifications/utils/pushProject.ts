const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function resolveExpoProjectId(
  envProjectId?: string | null,
  easProjectId?: string | null,
  configProjectId?: string | null,
) {
  const candidates = [envProjectId, easProjectId, configProjectId]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  return candidates.find((value) => UUID_PATTERN.test(value));
}
