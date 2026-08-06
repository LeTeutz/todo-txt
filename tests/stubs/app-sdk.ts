export function useChatLauncher(): {
  openChat: (options?: { agent?: string; message?: string }) => void;
} {
  return { openChat: () => undefined };
}
