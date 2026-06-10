/**
 * Identidade de cor por grupo — mesma paleta dos cards da home.
 * Hash determinístico pelo id: o grupo mantém a cor em todas as telas.
 */
export const GROUP_GRADIENTS: [string, string][] = [
  ['#FF5A1F', '#B23000'],
  ['#0E7490', '#063A4A'],
  ['#15803D', '#073D1E'],
  ['#6D28D9', '#34106E'],
  ['#B45309', '#5C2A04'],
];

export function groupGradient(id: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GROUP_GRADIENTS[hash % GROUP_GRADIENTS.length];
}
