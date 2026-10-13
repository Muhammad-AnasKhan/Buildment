import "server-only";

export function queueEmail(task: () => Promise<void>): void {
  void task().catch((error) => {
    console.error("[email] Notification failed:", error);
  });
}
