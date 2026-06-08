export const AVAILABLE_EMOJIS = ['🔥', '💪', '👏', '😤'] as const;
export type Emoji = (typeof AVAILABLE_EMOJIS)[number];

export function useReactions(sendReaction: (emoji: string) => void) {
  return {
    availableEmojis: AVAILABLE_EMOJIS,
    sendReaction,
  };
}
