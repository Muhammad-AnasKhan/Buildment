import { env, isTest } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { processEmailOutbox, setEmailQueuedListener } from "../services/notifications/email-outbox.js";
import { relayUnpushedNotifications } from "../services/notifications/service.js";

// In-process background worker for notifications. Each tick it pushes notifications that were
// written inside another transaction, then sends one batch of due email from the outbox. notify()
// wakes it immediately after queueing email; the interval is the fallback that picks up retries,
// rows from other processes, and anything a crash left behind. Safe to run on every replica.

export function startNotificationWorker(intervalMs = env.NOTIFICATION_WORKER_INTERVAL_MS): () => void {
  if (!env.NOTIFICATION_WORKER_ENABLED || isTest) {
    logger.info("[notifications] worker disabled");
    return () => undefined;
  }

  let running = false;
  let again = false;
  let stopped = false;

  const tick = async () => {
    if (stopped) return;
    if (running) {
      again = true;
      return;
    }
    running = true;
    try {
      do {
        again = false;
        const pushed = await relayUnpushedNotifications();
        const email = await processEmailOutbox();
        if (pushed || email.sent || email.retry || email.failed) {
          logger.info({ pushed, ...email }, "[notifications] worker tick");
        }
      } while (again && !stopped);
    } catch (error) {
      logger.error({ err: error }, "[notifications] worker tick failed");
    } finally {
      running = false;
    }
  };

  const timer = setInterval(() => void tick(), intervalMs);
  timer.unref();
  setEmailQueuedListener(() => void tick());
  void tick();
  logger.info({ intervalMs }, "[notifications] worker started");

  return () => {
    stopped = true;
    clearInterval(timer);
    setEmailQueuedListener(null);
  };
}
